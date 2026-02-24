import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { handleCors } from '../_shared/cors.ts';
import { json, jsonError } from '../_shared/response.ts';
import { createServiceClient, getSupabaseEnv } from '../_shared/supabase-client.ts';

// ── Constants ──

const RESUME_ALLOWED_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'text/rtf',
];

const LINKEDIN_ALLOWED_MIMES = ['application/pdf'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ── Magic-byte validators ──

function validateMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  switch (mimeType) {
    case 'application/pdf':
      return bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
    case 'application/msword':
      return (
        bytes.length >= 8 &&
        bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0 &&
        bytes[4] === 0xa1 && bytes[5] === 0xb1 && bytes[6] === 0x1a && bytes[7] === 0xe1
      );
    case 'application/rtf':
    case 'text/rtf':
      return (
        bytes.length >= 5 &&
        bytes[0] === 0x7b && bytes[1] === 0x5c && bytes[2] === 0x72 && bytes[3] === 0x74 && bytes[4] === 0x66
      );
    default:
      return false;
  }
}

// ── Handler ──

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createServiceClient();
  const url = new URL(req.url);
  const action = url.pathname.split('/').filter(Boolean).pop();

  try {
    if (action === 'init' && req.method === 'POST') return await handleInit(req, supabase);
    if (action === 'complete' && req.method === 'POST') return await handleComplete(req, supabase);
    if (action === 'delete' && req.method === 'POST') return await handleDelete(req, supabase);

    return jsonError(`Unknown action: ${action}`, 404);
  } catch (error) {
    console.error('profile-upload error:', error);
    return jsonError('Internal server error', 500);
  }
});

// ── INIT: validate metadata, create DB record, return signed upload URL ──

async function handleInit(req: Request, supabase: SupabaseClient) {
  const { userId, uploadType, fileName, fileSize, mimeType } = await req.json();

  if (!userId || !uploadType || !fileName || !fileSize || !mimeType) {
    return jsonError('Missing required fields: userId, uploadType, fileName, fileSize, mimeType');
  }
  if (!['resume', 'linkedin_pdf'].includes(uploadType)) {
    return jsonError('Invalid uploadType. Must be "resume" or "linkedin_pdf"');
  }
  if (fileSize > MAX_FILE_SIZE) {
    return jsonError('File exceeds 5MB limit');
  }

  const allowedMimes = uploadType === 'linkedin_pdf' ? LINKEDIN_ALLOWED_MIMES : RESUME_ALLOWED_MIMES;
  if (!allowedMimes.includes(mimeType)) {
    return jsonError(`File type "${mimeType}" is not supported`);
  }

  // Verify user exists
  const { url: supabaseUrl, serviceRoleKey } = getSupabaseEnv();
  const userCheck = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'GET',
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
  });
  if (!userCheck.ok) {
    return jsonError('User not found', 404);
  }

  // Replace any existing upload of this type
  const { data: existing } = await supabase
    .from('profile_uploads')
    .select('id, storage_path')
    .eq('user_id', userId)
    .eq('upload_type', uploadType);

  if (existing?.length) {
    for (const e of existing) {
      await supabase.storage.from('profile-uploads').remove([e.storage_path]);
      await supabase.from('profile_uploads').delete().eq('id', e.id);
    }
  }

  // Generate storage path
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${uploadType}/${userId}/${Date.now()}_${sanitizedName}`;

  const { data: record, error: insertError } = await supabase
    .from('profile_uploads')
    .insert({
      user_id: userId,
      upload_type: uploadType,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
      storage_path: storagePath,
      status: 'uploading',
    })
    .select()
    .single();

  if (insertError) {
    console.error('Failed to create upload record:', insertError);
    return jsonError('Failed to initialize upload', 500);
  }

  const { data: signedUrl, error: signedUrlError } = await supabase.storage
    .from('profile-uploads')
    .createSignedUploadUrl(storagePath);

  if (signedUrlError) {
    console.error('Failed to create signed URL:', signedUrlError);
    await supabase.from('profile_uploads').delete().eq('id', record.id);
    return jsonError('Failed to create upload URL', 500);
  }

  return json({
    success: true,
    uploadId: record.id,
    signedUrl: signedUrl.signedUrl,
    token: signedUrl.token,
    storagePath,
  });
}

// ── COMPLETE: verify file was uploaded, validate magic bytes, update status ──

async function handleComplete(req: Request, supabase: SupabaseClient) {
  const { uploadId, userId } = await req.json();

  if (!uploadId || !userId) {
    return jsonError('Missing required fields: uploadId, userId');
  }

  const { data: upload, error: fetchError } = await supabase
    .from('profile_uploads')
    .select('*')
    .eq('id', uploadId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !upload) return jsonError('Upload record not found', 404);
  if (upload.status !== 'uploading') {
    return jsonError(`Upload is in "${upload.status}" state, expected "uploading"`);
  }

  const { data: fileData, error: dlError } = await supabase.storage
    .from('profile-uploads')
    .download(upload.storage_path);

  if (dlError || !fileData) {
    await supabase.from('profile_uploads')
      .update({ status: 'failed', error_message: 'File not found in storage after upload' })
      .eq('id', uploadId);
    return jsonError('File was not uploaded successfully');
  }

  const bytes = new Uint8Array(await fileData.arrayBuffer());

  if (bytes.length > MAX_FILE_SIZE) {
    await supabase.storage.from('profile-uploads').remove([upload.storage_path]);
    await supabase.from('profile_uploads')
      .update({ status: 'failed', error_message: 'File exceeds size limit' })
      .eq('id', uploadId);
    return jsonError('File exceeds 5MB limit');
  }

  if (!validateMagicBytes(bytes, upload.mime_type)) {
    await supabase.storage.from('profile-uploads').remove([upload.storage_path]);
    await supabase.from('profile_uploads')
      .update({ status: 'failed', error_message: 'File content does not match declared type' })
      .eq('id', uploadId);
    return jsonError('File content does not match the declared file type');
  }

  await supabase.from('profile_uploads')
    .update({ status: 'uploaded', file_size: bytes.length })
    .eq('id', uploadId);

  return json({
    success: true,
    uploadId,
    status: 'uploaded',
    fileName: upload.file_name,
    fileSize: bytes.length,
  });
}

// ── DELETE: remove file from storage and DB ──

async function handleDelete(req: Request, supabase: SupabaseClient) {
  const { uploadId, userId } = await req.json();

  if (!uploadId || !userId) {
    return jsonError('Missing required fields: uploadId, userId');
  }

  const { data: upload, error: fetchError } = await supabase
    .from('profile_uploads')
    .select('*')
    .eq('id', uploadId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !upload) return jsonError('Upload record not found', 404);

  const { error: storageError } = await supabase.storage
    .from('profile-uploads')
    .remove([upload.storage_path]);

  if (storageError) {
    console.error('Storage delete warning:', storageError);
  }

  const { error: dbError } = await supabase.from('profile_uploads').delete().eq('id', uploadId);

  if (dbError) {
    console.error('Failed to delete upload record:', dbError);
    return jsonError('Failed to delete upload record', 500);
  }

  return json({ success: true, message: 'Upload deleted' });
}
