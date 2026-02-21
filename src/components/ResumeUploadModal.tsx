import { X, Check, Trash2, Paperclip, AlertCircle } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/config';
import { useProfileCreation } from '../contexts/ProfileCreationContext';
import { supabase } from '../lib/supabase';

interface ResumeUploadModalProps {
  onClose: () => void;
}

type UploadState = 'idle' | 'dragging' | 'validating' | 'uploading' | 'uploaded' | 'ready' | 'error';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'text/rtf',
];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.rtf'];

function getFileExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx).toLowerCase() : '';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResumeUploadModal({ onClose }: ResumeUploadModalProps) {
  const navigate = useNavigate();
  const { profileData, updateProfileData } = useProfileCreation();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [restoredFileName, setRestoredFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // On mount, check if a resume was already uploaded (context first, then DB)
  useEffect(() => {
    const restoreUpload = async () => {
      // Check context first
      if (profileData.uploadedFileName) {
        setRestoredFileName(profileData.uploadedFileName);
        setUploadState('ready');
        return;
      }

      // Fall back to DB
      const userId = localStorage.getItem('verifiedUserId');
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('file_name')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data?.file_name) {
          setRestoredFileName(data.file_name);
          setUploadState('ready');
        }
      } catch (err) {
        // No existing resume, stay in idle
      }
    };

    restoreUpload();
  }, []);

  // ─── Client-side validation ───
  const validateFile = useCallback((file: File): string | null => {
    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `That file type isn't supported. Please use PDF, DOC, DOCX, or RTF.`;
    }
    if (!ALLOWED_MIMES.includes(file.type) && file.type !== '') {
      return `That file type isn't supported. Please use PDF, DOC, DOCX, or RTF.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File exceeds 5MB. Your file is ${formatFileSize(file.size)}.`;
    }
    if (file.size === 0) {
      return 'File is empty. Please choose a valid file.';
    }
    return null;
  }, []);

  // ─── Upload flow: init → direct upload → complete ───
  const uploadFile = useCallback(async (file: File) => {
    setUploadState('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      // Get userId from localStorage (set during signup/login)
      const userId = localStorage.getItem('verifiedUserId');
      if (!userId) {
        throw new Error('You must be logged in to upload files.');
      }

      // Step 1: Init — get signed upload URL
      setUploadProgress(10);
      const initRes = await fetch(`${SUPABASE_URL}/functions/v1/profile-upload/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId,
          uploadType: 'resume',
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok || !initData.success) {
        throw new Error(initData.message || 'Failed to initialize upload');
      }

      setUploadId(initData.uploadId);
      setUploadProgress(30);

      // Step 2: Direct upload to storage via signed URL
      const uploadRes = await new Promise<boolean>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', initData.signedUrl, true);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            // Map upload progress to 30-80% range
            const pct = 30 + Math.round((e.loaded / e.total) * 50);
            setUploadProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(true);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.onabort = () => reject(new Error('Upload was cancelled'));

        xhr.send(file);
      });

      if (!uploadRes) {
        throw new Error('Upload failed');
      }

      setUploadProgress(85);

      // Step 3: Complete — server validates magic bytes, updates status
      const completeRes = await fetch(`${SUPABASE_URL}/functions/v1/profile-upload/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          uploadId: initData.uploadId,
          userId,
        }),
      });

      const completeData = await completeRes.json();
      if (!completeRes.ok || !completeData.success) {
        throw new Error(completeData.message || 'Server validation failed');
      }

      setUploadProgress(90);

      // Step 4: Create resume record in database
      // Use the actual storage path from the upload response
      const fileKey = initData.storagePath;
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .insert({
          user_id: userId,
          file_key: fileKey,
          file_name: file.name,
          mime_type: file.type || 'application/octet-stream',
          size_bytes: file.size,
          status: 'UPLOADED',
        })
        .select('id')
        .single();

      if (resumeError || !resumeData) {
        console.error('Failed to create resume record:', resumeError);
        throw new Error('Failed to save resume information');
      }

      const resumeId = resumeData.id;

      // Step 5: Save resume URL to users table for persistence (freelancer accounts only)
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ resume_url: fileKey })
        .eq('id', userId);

      if (userUpdateError) {
        console.warn('Failed to update user resume_url:', userUpdateError);
        // Don't fail the upload if this fails
      }

      // Step 6: Skip resume parsing - just save the file
      // Users will manually enter their experience on step 5
      console.log('📄 Resume uploaded successfully. Parsing disabled - user will enter experience manually.');
      updateProfileData({
        uploadedFileName: file.name,
        uploadedFileSize: file.size,
        uploadType: 'resume',
        resumeId: resumeId,
        parsingStatus: 'failed', // Mark as failed so parsing is skipped
      });

      setUploadProgress(100);
      setUploadState('ready');
    } catch (err: any) {
      console.error('❌ Resume upload error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setUploadState('error');
    }
  }, [updateProfileData]);

  // ─── File selection handler (shared by input + drop) ───
  const handleFile = useCallback((file: File) => {
    setUploadState('validating');
    setErrorMessage('');

    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setUploadState('error');
      return;
    }

    setSelectedFile(file);
    uploadFile(file);
  }, [validateFile, uploadFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (uploadState === 'idle' || uploadState === 'error') {
      setUploadState('dragging');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (uploadState === 'dragging') {
      setUploadState('idle');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    } else {
      setUploadState('idle');
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  // ─── Remove / replace: trash icon resets to idle ───
  const handleRemove = async () => {
    if (uploadId) {
      try {
        const userId = localStorage.getItem('verifiedUserId');
        await fetch(`${SUPABASE_URL}/functions/v1/profile-upload/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ uploadId, userId }),
        });
      } catch (err) {
        console.error('⚠️ Failed to delete upload:', err);
      }
    }
    // Clear resume_url from users table
    const userId = localStorage.getItem('verifiedUserId');
    if (userId) {
      await supabase.from('users').update({ resume_url: null }).eq('id', userId);
    }
    setSelectedFile(null);
    setRestoredFileName(null);
    setUploadId(null);
    setUploadProgress(0);
    setErrorMessage('');
    setUploadState('idle');
    updateProfileData({ uploadedFileName: undefined, uploadedFileSize: undefined, resumeId: undefined, draftId: undefined, parsingStatus: 'idle' });
  };

  const handleContinue = () => {
    if (uploadState === 'ready') {
      navigate('/freelancer-category-selection');
    }
  };

  const isDropzoneActive = uploadState === 'idle' || uploadState === 'dragging' || uploadState === 'error';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl p-8 max-w-2xl w-full"
        style={{
          backgroundColor: '#000000',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
        >
          <X className="w-5 h-5" style={{ color: '#666666' }} />
        </button>

        {/* Title */}
        <h2
          className="text-3xl font-normal mb-3"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#ffffff' }}
        >
          Add your resume
        </h2>

        {/* Subtitle */}
        <p
          className="text-base mb-8"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#cccccc' }}
        >
          Use a PDF, Word doc, or rich text file – make sure it's 5MB or less.
        </p>

        {/* ─── Dropzone (visible when idle/dragging/error) ─── */}
        {isDropzoneActive && (
          <div
            className="rounded-lg p-12 mb-8 transition-all duration-200 cursor-pointer"
            style={{
              border: uploadState === 'dragging' ? '2px solid #94A3B8' : '2px dashed rgba(255, 255, 255, 0.2)',
              backgroundColor: uploadState === 'dragging' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(255, 255, 255, 0.03)',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleChooseFile}
          >
            <div className="flex flex-col items-center justify-center">
              {/* Resume Icon */}
              <div className="mb-6">
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32">
                  <rect x="30" y="20" width="50" height="70" rx="4" fill="#f1f5f9" stroke="#94A3B8" strokeWidth="2" />
                  <g transform="translate(38, 32)">
                    <circle cx="0" cy="0" r="6" fill="#94A3B8" />
                    <path d="M -2 0 L -1 1 L 2 -2" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                  <g transform="translate(38, 48)">
                    <circle cx="0" cy="0" r="6" fill="#94A3B8" />
                    <path d="M -2 0 L -1 1 L 2 -2" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                  <line x1="50" y1="32" x2="70" y2="32" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                  <line x1="50" y1="38" x2="65" y2="38" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="50" y1="48" x2="70" y2="48" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                  <line x1="50" y1="54" x2="65" y2="54" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="38" y1="64" x2="72" y2="64" stroke="#cccccc" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="38" y1="70" x2="65" y2="70" stroke="#cccccc" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="38" y1="76" x2="70" y2="76" stroke="#cccccc" strokeWidth="1.5" strokeLinecap="round" />
                  <g transform="translate(90, 75)">
                    <circle cx="0" cy="-8" r="6" fill="#ff9800" />
                    <path d="M -8 8 Q -8 0 0 0 Q 8 0 8 8" fill="#ff9800" />
                  </g>
                </svg>
              </div>

              <p
                className="text-base"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#cccccc' }}
              >
                Drag and drop or{' '}
                <span className="font-medium underline" style={{ color: 'var(--text-primary)' }}>
                  choose file
                </span>
              </p>
            </div>
          </div>
        )}

        {/* ─── Uploading state: progress bar ─── */}
        {uploadState === 'uploading' && selectedFile && (
          <div className="mb-8">
            <div
              className="rounded-lg px-6 py-5"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Paperclip className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-primary)' }} />
                <span
                  className="text-sm truncate flex-1"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#ffffff' }}
                >
                  {selectedFile.name}
                </span>
                <span
                  className="text-xs flex-shrink-0"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: 'var(--text-primary)' }}
                >
                  {uploadProgress}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ backgroundColor: 'var(--text-primary)', width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Validating state ─── */}
        {uploadState === 'validating' && (
          <div className="mb-8">
            <div
              className="rounded-lg px-6 py-5 flex items-center gap-3"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--text-primary)', borderTopColor: 'transparent' }} />
              <span
                className="text-sm"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#cccccc' }}
              >
                Validating file...
              </span>
            </div>
          </div>
        )}

        {/* ─── Uploaded / Ready state: filename row + checkmark + trash ─── */}
        {(uploadState === 'uploaded' || uploadState === 'ready') && (selectedFile || restoredFileName) && (
          <div className="mb-8">
            <div
              className="rounded-lg px-6 py-4 flex items-center gap-3"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <Paperclip className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-primary)' }} />
              <span
                className="text-sm truncate flex-1"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#ffffff' }}
              >
                {selectedFile?.name || restoredFileName}
              </span>
              <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-primary)' }} />
              <button
                onClick={handleRemove}
                className="flex-shrink-0 p-1 rounded transition-all duration-200"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Error state ─── */}
        {uploadState === 'error' && errorMessage && (
          <div className="mb-4">
            <div
              className="rounded-lg px-5 py-3 flex items-center gap-3"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#ef4444' }} />
              <span
                className="text-sm flex-1"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#fca5a5' }}
              >
                {errorMessage}
              </span>
              <button
                onClick={() => { setErrorMessage(''); setUploadState('idle'); }}
                className="text-xs font-medium px-3 py-1 rounded"
                style={{ color: '#fca5a5', backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.rtf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Continue Button */}
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            disabled={uploadState !== 'ready'}
            className="px-8 py-3 rounded-lg font-medium text-base transition-all duration-200"
            style={{
              backgroundColor: uploadState === 'ready' ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
              color: uploadState === 'ready' ? '#000000' : '#666666',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              cursor: uploadState === 'ready' ? 'pointer' : 'not-allowed',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
