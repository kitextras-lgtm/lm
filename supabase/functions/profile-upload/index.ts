import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

function getCorsHeaders(req: Request) {
  const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") || "*";
  const origin = req.headers.get("Origin") || "";
  const resolvedOrigin = allowedOrigin === "*" ? "*" : (origin === allowedOrigin ? origin : allowedOrigin);
  return {
    "Access-Control-Allow-Origin": resolvedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  };
}

// Allowed MIME types
const RESUME_ALLOWED_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'text/rtf',
];

const LINKEDIN_ALLOWED_MIMES = [
  'application/pdf',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Simple magic-byte check for PDF
function isPdfByMagic(bytes: Uint8Array): boolean {
  // PDF starts with %PDF
  return bytes.length >= 4 &&
    bytes[0] === 0x25 && bytes[1] === 0x50 &&
    bytes[2] === 0x44 && bytes[3] === 0x46;
}

// Simple magic-byte check for DOCX (ZIP-based)
function isDocxByMagic(bytes: Uint8Array): boolean {
  return bytes.length >= 4 &&
    bytes[0] === 0x50 && bytes[1] === 0x4B &&
    bytes[2] === 0x03 && bytes[3] === 0x04;
}

// Simple magic-byte check for DOC (OLE2)
function isDocByMagic(bytes: Uint8Array): boolean {
  return bytes.length >= 8 &&
    bytes[0] === 0xD0 && bytes[1] === 0xCF &&
    bytes[2] === 0x11 && bytes[3] === 0xE0 &&
    bytes[4] === 0xA1 && bytes[5] === 0xB1 &&
    bytes[6] === 0x1A && bytes[7] === 0xE1;
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
      // RTF starts with {\rtf
      return bytes.length >= 5 &&
        bytes[0] === 0x7B && bytes[1] === 0x5C &&
        bytes[2] === 0x72 && bytes[3] === 0x74 &&
        bytes[4] === 0x66;
    default:
      return false;
  }
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  const jsonResp = (status: number, body: Record<string, unknown>) => jsonResponse(status, body, corsHeaders);
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  // Expected paths: /profile-upload/init, /profile-upload/complete, /profile-upload/delete
  const action = pathParts[pathParts.length - 1];

  try {
    // ─── INIT: Validate metadata, create DB record, return signed upload URL ───
    if (action === 'init' && req.method === 'POST') {
      const { userId, uploadType, fileName, fileSize, mimeType } = await req.json();

      // Validate required fields
      if (!userId || !uploadType || !fileName || !fileSize || !mimeType) {
        return jsonResp(400, { success: false, message: 'Missing required fields: userId, uploadType, fileName, fileSize, mimeType' });
      }

      // Validate upload type
      if (!['resume', 'linkedin_pdf'].includes(uploadType)) {
        return jsonResp(400, { success: false, message: 'Invalid uploadType. Must be "resume" or "linkedin_pdf"' });
      }

      // Validate file size
      if (fileSize > MAX_FILE_SIZE) {
        return jsonResp(400, { success: false, message: 'File exceeds 5MB limit' });
      }

      // Validate MIME type
      const allowedMimes = uploadType === 'linkedin_pdf' ? LINKEDIN_ALLOWED_MIMES : RESUME_ALLOWED_MIMES;
      if (!allowedMimes.includes(mimeType)) {
        return jsonResp(400, { success: false, message: `File type "${mimeType}" is not supported` });
      }

      // Verify user exists
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const userCheck = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: 'GET',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      });
      if (!userCheck.ok) {
        return jsonResp(404, { success: false, message: 'User not found' });
      }

      // Delete any existing upload of the same type for this user (replace behavior)
      const { data: existingUploads } = await supabaseClient
        .from('profile_uploads')
        .select('id, storage_path')
        .eq('user_id', userId)
        .eq('upload_type', uploadType);

      if (existingUploads && existingUploads.length > 0) {
        for (const existing of existingUploads) {
          // Delete from storage
          await supabaseClient.storage
            .from('profile-uploads')
            .remove([existing.storage_path]);
          // Delete DB record
          await supabaseClient
            .from('profile_uploads')
            .delete()
            .eq('id', existing.id);
        }
        console.log(`🗑️ Cleaned up ${existingUploads.length} existing ${uploadType} upload(s) for user ${userId}`);
      }

      // Generate storage path
      const timestamp = Date.now();
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${uploadType}/${userId}/${timestamp}_${sanitizedName}`;

      // Create DB record with status 'uploading'
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
        console.error('❌ Failed to create upload record:', insertError);
        return jsonResp(500, { success: false, message: 'Failed to initialize upload' });
      }

      // Create a signed upload URL for direct client upload
      const { data: signedUrl, error: signedUrlError } = await supabaseClient.storage
        .from('profile-uploads')
        .createSignedUploadUrl(storagePath);

      if (signedUrlError) {
        console.error('❌ Failed to create signed URL:', signedUrlError);
        // Clean up the DB record
        await supabaseClient.from('profile_uploads').delete().eq('id', uploadRecord.id);
        return jsonResp(500, { success: false, message: 'Failed to create upload URL' });
      }

      console.log(`✅ Upload initialized: ${uploadRecord.id} → ${storagePath}`);

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
        return jsonResp(400, { success: false, message: 'Missing required fields: uploadId, userId' });
      }

      // Fetch the upload record
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
        return jsonResp(400, { success: false, message: `Upload is in "${upload.status}" state, expected "uploading"` });
      }

      // Verify the file exists in storage
      const { data: fileData, error: downloadError } = await supabaseClient.storage
        .from('profile-uploads')
        .download(upload.storage_path);

      if (downloadError || !fileData) {
        console.error('❌ File not found in storage:', downloadError);
        await supabaseClient
          .from('profile_uploads')
          .update({ status: 'failed', error_message: 'File not found in storage after upload' })
          .eq('id', uploadId);
        return jsonResp(400, { success: false, message: 'File was not uploaded successfully' });
      }

      // Server-side validation: check actual file size
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
        return jsonResp(400, { success: false, message: 'File content does not match the declared file type' });
      }

      // Mark as uploaded (scanning/parsing would be queued here in production)
      await supabaseClient
        .from('profile_uploads')
        .update({
          status: 'uploaded',
          file_size: bytes.length, // update with actual size
        })
        .eq('id', uploadId);

      console.log(`✅ Upload complete: ${uploadId} (${bytes.length} bytes, ${upload.mime_type})`);

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
        return jsonResp(400, { success: false, message: 'Missing required fields: uploadId, userId' });
      }

      // Fetch the upload record
      const { data: upload, error: fetchError } = await supabaseClient
        .from('profile_uploads')
        .select('*')
        .eq('id', uploadId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !upload) {
        return jsonResp(404, { success: false, message: 'Upload record not found' });
      }

      // Delete from storage
      const { error: storageError } = await supabaseClient.storage
        .from('profile-uploads')
        .remove([upload.storage_path]);

      if (storageError) {
        console.error('⚠️ Storage delete warning:', storageError);
        // Continue anyway — DB record should still be cleaned up
      }

      // Delete DB record
      const { error: dbError } = await supabaseClient
        .from('profile_uploads')
        .delete()
        .eq('id', uploadId);

      if (dbError) {
        console.error('❌ Failed to delete upload record:', dbError);
        return jsonResp(500, { success: false, message: 'Failed to delete upload record' });
      }

      console.log(`🗑️ Upload deleted: ${uploadId}`);

      return jsonResp(200, { success: true, message: 'Upload deleted' });
    }

    return jsonResp(404, { success: false, message: `Unknown action: ${action}` });

  } catch (error) {
    console.error('❌ profile-upload error:', error);
    return jsonResp(500, { success: false, message: 'Internal server error' });
  }
});

function jsonResponse(status: number, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}
