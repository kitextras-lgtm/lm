import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleCors, getCorsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { getSupabaseEnv } from '../_shared/supabase-client.ts';

// Allowed MIME types
const RESUME_ALLOWED_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'text/rtf',
];

const LINKEDIN_ALLOWED_MIMES = ['application/pdf'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function isPdfByMagic(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x25 && bytes[1] === 0x50 &&
    bytes[2] === 0x44 && bytes[3] === 0x46
  );
}

function isDocxByMagic(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x50 && bytes[1] === 0x4b &&
    bytes[2] === 0x03 && bytes[3] === 0x04
  );
}

function isDocByMagic(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0xd0 && bytes[1] === 0xcf &&
    bytes[2] === 0x11 && bytes[3] === 0xe0 &&
    bytes[4] === 0xa1 && bytes[5] === 0xb1 &&
    bytes[6] === 0x1a && bytes[7] === 0xe1
  );
}

function validateMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  switch (mimeType) {
    case 'application/pdf':
      return isPdfByMagic(bytes);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return isDocxByMagic(bytes);
    case 'application/msword':
      return isDocByMagic(bytes);
    case 'application/rtf':
    case 'text/rtf':
      return (
        bytes.length >= 5 &&
        bytes[0] === 0x7b && bytes[1] === 0x5c &&
        bytes[2] === 0x72 && bytes[3] === 0x74 &&
        bytes[4] === 0x66
      );
    default:
      return false;
  }
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);
  const jsonResp = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  const { url: supabaseUrl, serviceRoleKey } = getSupabaseEnv();
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? serviceRoleKey;

  // ── Verify JWT: ensure the caller is an authenticated user ──
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResp(401, { success: false, message: 'Missing Authorization header' });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user: callerUser }, error: authError } = await userClient.auth.getUser();
  if (authError || !callerUser) {
    return jsonResp(401, { success: false, message: 'Invalid or expired token' });
  }

  const supabaseClient = createServiceClient();

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const action = pathParts[pathParts.length - 1];

  try {
    // ─── INIT: Validate metadata, create DB record, return signed upload URL ───
    if (action === 'init' && req.method === 'POST') {
      const { userId, uploadType, fileName, fileSize, mimeType } = await req.json();

      if (!userId || !uploadType || !fileName || !fileSize || !mimeType) {
        return jsonResp(400, {
          success: false,
          message: 'Missing required fields: userId, uploadType, fileName, fileSize, mimeType',
        });
      }

      // Ownership check: caller must match the userId being acted on
      if (callerUser.id !== userId) {
        return jsonResp(403, { success: false, message: 'Cannot upload files for another user' });
      }

      if (!['resume', 'linkedin_pdf'].includes(uploadType)) {
        return jsonResp(400, {
          success: false,
          message: 'Invalid uploadType. Must be "resume" or "linkedin_pdf"',
        });
      }

      if (fileSize > MAX_FILE_SIZE) {
        return jsonResp(400, { success: false, message: 'File exceeds 5MB limit' });
      }

      const allowedMimes = uploadType === 'linkedin_pdf' ? LINKEDIN_ALLOWED_MIMES : RESUME_ALLOWED_MIMES;
      if (!allowedMimes.includes(mimeType)) {
        return jsonResp(400, {
          success: false,
          message: `File type "${mimeType}" is not supported`,
        });
      }

      // Verify user exists
      const userCheck = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: 'GET',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });
      if (!userCheck.ok) {
        return jsonResp(404, { success: false, message: 'User not found' });
      }

      // Delete any existing upload of the same type (replace behavior)
      const { data: existingUploads } = await supabaseClient
        .from('profile_uploads')
        .select('id, storage_path')
        .eq('user_id', userId)
        .eq('upload_type', uploadType);

      if (existingUploads && existingUploads.length > 0) {
        for (const existing of existingUploads) {
          await supabaseClient.storage.from('profile-uploads').remove([existing.storage_path]);
          await supabaseClient.from('profile_uploads').delete().eq('id', existing.id);
        }
      }

      const timestamp = Date.now();
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${uploadType}/${userId}/${timestamp}_${sanitizedName}`;

      const { data: uploadRecord, error: insertError } = await supabaseClient
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
        return jsonResp(500, { success: false, message: 'Failed to initialize upload' });
      }

      const { data: signedUrl, error: signedUrlError } = await supabaseClient.storage
        .from('profile-uploads')
        .createSignedUploadUrl(storagePath);

      if (signedUrlError) {
        console.error('Failed to create signed URL:', signedUrlError);
        await supabaseClient.from('profile_uploads').delete().eq('id', uploadRecord.id);
        return jsonResp(500, { success: false, message: 'Failed to create upload URL' });
      }

      return jsonResp(200, {
        success: true,
        uploadId: uploadRecord.id,
        signedUrl: signedUrl.signedUrl,
        token: signedUrl.token,
        storagePath,
      });
    }

    // ─── COMPLETE: Verify file was uploaded, validate magic bytes, update status ───
    if (action === 'complete' && req.method === 'POST') {
      const { uploadId, userId } = await req.json();

      if (!uploadId || !userId) {
        return jsonResp(400, {
          success: false,
          message: 'Missing required fields: uploadId, userId',
        });
      }

      if (callerUser.id !== userId) {
        return jsonResp(403, { success: false, message: 'Cannot complete uploads for another user' });
      }

      const { data: upload, error: fetchError } = await supabaseClient
        .from('profile_uploads')
        .select('*')
        .eq('id', uploadId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !upload) {
        return jsonResp(404, { success: false, message: 'Upload record not found' });
      }

      if (upload.status !== 'uploading') {
        return jsonResp(400, {
          success: false,
          message: `Upload is in "${upload.status}" state, expected "uploading"`,
        });
      }

      const { data: fileData, error: downloadError } = await supabaseClient.storage
        .from('profile-uploads')
        .download(upload.storage_path);

      if (downloadError || !fileData) {
        console.error('File not found in storage:', downloadError);
        await supabaseClient
          .from('profile_uploads')
          .update({ status: 'failed', error_message: 'File not found in storage after upload' })
          .eq('id', uploadId);
        return jsonResp(400, { success: false, message: 'File was not uploaded successfully' });
      }

      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      if (bytes.length > MAX_FILE_SIZE) {
        await supabaseClient.storage.from('profile-uploads').remove([upload.storage_path]);
        await supabaseClient
          .from('profile_uploads')
          .update({ status: 'failed', error_message: 'File exceeds size limit' })
          .eq('id', uploadId);
        return jsonResp(400, { success: false, message: 'File exceeds 5MB limit' });
      }

      // Server-side validation: verify magic bytes match claimed MIME type
      if (!validateMagicBytes(bytes, upload.mime_type)) {
        await supabaseClient.storage.from('profile-uploads').remove([upload.storage_path]);
        await supabaseClient
          .from('profile_uploads')
          .update({ status: 'failed', error_message: 'File content does not match declared type' })
          .eq('id', uploadId);
        return jsonResp(400, {
          success: false,
          message: 'File content does not match the declared file type',
        });
      }

      await supabaseClient
        .from('profile_uploads')
        .update({ status: 'uploaded', file_size: bytes.length })
        .eq('id', uploadId);

      return jsonResp(200, {
        success: true,
        uploadId,
        status: 'uploaded',
        fileName: upload.file_name,
        fileSize: bytes.length,
      });
    }

    // ─── DELETE: Remove file from storage and DB ───
    if (action === 'delete' && req.method === 'POST') {
      const { uploadId, userId } = await req.json();

      if (!uploadId || !userId) {
        return jsonResp(400, {
          success: false,
          message: 'Missing required fields: uploadId, userId',
        });
      }

      if (callerUser.id !== userId) {
        return jsonResp(403, { success: false, message: 'Cannot delete uploads for another user' });
      }

      const { data: upload, error: fetchError } = await supabaseClient
        .from('profile_uploads')
        .select('*')
        .eq('id', uploadId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !upload) {
        return jsonResp(404, { success: false, message: 'Upload record not found' });
      }

      const { error: storageError } = await supabaseClient.storage
        .from('profile-uploads')
        .remove([upload.storage_path]);

      if (storageError) {
        console.error('Storage delete warning:', storageError);
      }

      const { error: dbError } = await supabaseClient
        .from('profile_uploads')
        .delete()
        .eq('id', uploadId);

      if (dbError) {
        console.error('Failed to delete upload record:', dbError);
        return jsonResp(500, { success: false, message: 'Failed to delete upload record' });
      }

      return jsonResp(200, { success: true, message: 'Upload deleted' });
    }

    return jsonResp(404, { success: false, message: `Unknown action: ${action}` });
  } catch (error) {
    console.error('profile-upload error:', error);
    return jsonResp(500, { success: false, message: 'Internal server error' });
  }
});
