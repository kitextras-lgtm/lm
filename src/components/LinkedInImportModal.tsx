import { X, Upload, Check, Trash2, Paperclip, AlertCircle } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/config';
import { useProfileCreation } from '../contexts/ProfileCreationContext';

interface LinkedInImportModalProps {
  onClose: () => void;
}

type UploadState = 'idle' | 'validating' | 'uploading' | 'uploaded' | 'ready' | 'error';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LinkedInImportModal({ onClose }: LinkedInImportModalProps) {
  const navigate = useNavigate();
  const { updateProfileData } = useProfileCreation();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadId, setUploadId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Client-side validation (PDF only for LinkedIn) ───
  const validateFile = useCallback((file: File): string | null => {
    const ext = file.name.toLowerCase().endsWith('.pdf');
    if (!ext) {
      return 'LinkedIn profiles must be saved as PDF. Please export your profile as a PDF first.';
    }
    if (file.type && file.type !== 'application/pdf') {
      return 'LinkedIn profiles must be saved as PDF. Please export your profile as a PDF first.';
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
      const userId = localStorage.getItem('verifiedUserId');
      if (!userId) {
        throw new Error('You must be logged in to upload files.');
      }

      // Step 1: Init
      setUploadProgress(10);
      const initRes = await fetch(`${SUPABASE_URL}/functions/v1/profile-upload/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId,
          uploadType: 'linkedin_pdf',
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/pdf',
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok || !initData.success) {
        throw new Error(initData.message || 'Failed to initialize upload');
      }

      setUploadId(initData.uploadId);
      setUploadProgress(30);

      // Step 2: Direct upload to storage via signed URL
      await new Promise<boolean>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', initData.signedUrl, true);
        xhr.setRequestHeader('Content-Type', file.type || 'application/pdf');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
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

      setUploadProgress(100);
      setUploadState('ready');
      
      // Save upload info to context
      updateProfileData({
        uploadedFileName: file.name,
        uploadedFileSize: file.size,
        uploadType: 'linkedin_pdf',
      });

    } catch (err) {
      console.error('❌ LinkedIn PDF upload error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setUploadState('error');
    }
  }, []);

  // ─── File selection handler ───
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
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    setSelectedFile(null);
    setUploadId(null);
    setUploadProgress(0);
    setErrorMessage('');
    setUploadState('idle');
  };

  const handleContinue = () => {
    if (uploadState === 'ready') {
      navigate('/freelancer-category-selection');
    }
  };

  const showUploadButton = uploadState === 'idle' || uploadState === 'error';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          scrollbarWidth: 'none',
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
          className="text-3xl font-normal mb-6"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#ffffff' }}
        >
          Upload your LinkedIn profile
        </h2>

        {/* Step 1 */}
        <p
          className="text-base mb-6"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#cccccc' }}
        >
          Step 1: if you haven't already, save your LinkedIn profile as a PDF. Here's how:
        </p>

        {/* LinkedIn Screenshot */}
        <div
          className="rounded-lg p-6 mb-6"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <div className="flex items-start gap-4">
            {/* Profile Image Placeholder */}
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#b0bec5' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#ffffff' }}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" style={{ color: '#78909c' }}>
                  <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                  <circle cx="12" cy="14" r="2" fill="currentColor" />
                  <path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Profile Content */}
            <div className="flex-1">
              <h3
                className="text-xl font-semibold mb-3"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#ffffff' }}
              >
                Your Name
              </h3>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  className="px-4 py-1.5 rounded-full text-sm font-medium"
                  style={{ backgroundColor: '#2563eb', color: '#ffffff', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  Open to
                </button>
                <button
                  className="px-4 py-1.5 rounded-full text-sm font-medium"
                  style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', border: '1px solid #2563eb', color: '#2563eb', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  Add section
                </button>
                <button
                  className="px-4 py-1.5 rounded-full text-sm font-medium"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#cccccc', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  More
                </button>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm" style={{ color: '#2563eb' }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Share profile in a message
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#2563eb' }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                    Save to PDF
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#2563eb' }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Build a resume
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <p
          className="text-base mb-4"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#cccccc' }}
        >
          Step 2: come back here to upload it.
        </p>

        {/* ─── Upload Button (idle state) ─── */}
        {showUploadButton && (
          <div className="mb-8">
            <div
              className="px-6 py-4 rounded-lg text-left flex items-center gap-3 transition-all duration-200 hover:brightness-95 cursor-pointer"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid var(--border-subtle)',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}
              onClick={handleChooseFile}
            >
              <Upload className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)', fontSize: '16px' }}>
                Upload your saved LinkedIn PDF
              </span>
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

        {/* ─── Uploaded / Ready state: filename row + checkmark + trash ─── */}
        {(uploadState === 'uploaded' || uploadState === 'ready') && selectedFile && (
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
                {selectedFile.name}
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
          accept=".pdf"
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
