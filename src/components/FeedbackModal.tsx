import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { SuggestionIcon, BugReportIcon, FeatureRequestIcon, OtherIcon } from './FeedbackIcons';
import React from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface CategoryButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactElement;
  label: string;
}

function CategoryButton({ isActive, onClick, icon, label }: CategoryButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 ${
        isActive ? 'shadow-md' : 'hover:brightness-105'
      }`}
      style={{
        backgroundColor: isActive ? '#0f0f13' : 'transparent',
        color: '#F8FAFC',
        border: isActive ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.25)',
      }}
    >
      {React.cloneElement(icon, { isHovered })}
      <span>{label}</span>
    </button>
  );
}

export function FeedbackModal({ isOpen, onClose, userId }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState<'bug' | 'suggestion' | 'feature' | 'other'>('suggestion');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFeedback('');
      setCategory('suggestion');
      setSubmitStatus('idle');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || !userId) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Store feedback in the separate feedback table
      const { error: feedbackError } = await supabase
        .from('feedback')
        .insert({
          user_id: userId,
          category: category,
          content: feedback.trim(),
          status: 'pending',
        });

      if (feedbackError) throw feedbackError;

      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm animate-fade-in overflow-y-auto"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 my-8 rounded-2xl shadow-2xl animate-fade-in"
        style={{ backgroundColor: '#111111', border: '1px solid rgba(75, 85, 99, 0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(75, 85, 99, 0.25)', backgroundColor: '#111111' }}>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: '#F8FAFC' }}>
            Give Feedback
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:brightness-110"
            style={{ backgroundColor: 'transparent', color: '#64748B' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#F8FAFC' }}>
              Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              <CategoryButton
                isActive={category === 'suggestion'}
                onClick={() => setCategory('suggestion')}
                icon={<SuggestionIcon />}
                label="Suggestion"
              />
              
              <CategoryButton
                isActive={category === 'bug'}
                onClick={() => setCategory('bug')}
                icon={<BugReportIcon />}
                label="Bug Report"
              />
              
              <CategoryButton
                isActive={category === 'feature'}
                onClick={() => setCategory('feature')}
                icon={<FeatureRequestIcon />}
                label="Feature Request"
              />
              
              <CategoryButton
                isActive={category === 'other'}
                onClick={() => setCategory('other')}
                icon={<OtherIcon />}
                label="Other"
              />
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#F8FAFC' }}>
              Your Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts, suggestions, or report any issues..."
              rows={6}
              required
              className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/10 placeholder:text-slate-400 hover:border-slate-500/40"
              style={{
                backgroundColor: '#0f0f13',
                border: '1px solid rgba(75, 85, 99, 0.25)',
                color: '#F8FAFC',
              }}
            />
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="p-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ADE80', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              ✓ Feedback submitted successfully! Thank you.
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="p-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              ✗ Failed to submit feedback. Please try again.
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-110"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(75, 85, 99, 0.25)',
                color: '#94A3B8',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!feedback.trim() || isSubmitting || submitStatus === 'success'}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105"
              style={{
                backgroundColor: submitStatus === 'success' ? '#22C55E' : '#F8FAFC',
                color: submitStatus === 'success' ? '#FFFFFF' : '#111111',
              }}
            >
              {isSubmitting ? 'Submitting...' : submitStatus === 'success' ? 'Submitted!' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

