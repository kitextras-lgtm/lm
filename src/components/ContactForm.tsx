import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ChevronDown } from 'lucide-react';
import { submitContactForm } from '../api/submissions';

interface SubjectDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

function SubjectDropdown({ value, onChange }: SubjectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const subjectOptions = [
    { value: '', label: 'Select a topic' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'support', label: 'Support' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedLabel = subjectOptions.find(opt => opt.value === value)?.label || 'Select a topic';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-between group"
        style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid rgba(75, 85, 99, 0.5)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span className="transition-all duration-200">{selectedLabel}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${isOpen ? 'rotate-180' : ''}`} 
          style={{ color: '#94A3B8' }} 
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 rounded-lg shadow-xl overflow-hidden animate-fade-in-down"
          style={{ backgroundColor: 'rgba(17, 17, 17, 0.95)', border: '1px solid rgba(75, 85, 99, 0.5)' }}
        >
          <div className="max-h-60 overflow-y-auto">
            {subjectOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-sm transition-all duration-200 flex items-center gap-2 group/option relative"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <span className="transition-all duration-200">{option.label}</span>
                  {isSelected && (
                    <span className="ml-auto text-xs transition-all duration-200" style={{ color: '#94A3B8' }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ContactForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubjectChange = (value: string) => {
    setFormData({
      ...formData,
      subject: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitContactForm(formData);

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden py-8 sm:py-12 px-6"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")'
      }}
    >
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-xs font-medium">Home</span>
      </button>

      <div className="relative z-10 w-full max-w-2xl mx-auto">

        <div className="flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3">Contact Us</h1>
          <p className="text-neutral-400 text-sm mb-2 text-center">
            If you'd like to get in touch with us, please fill out the form below.
          </p>
          <p className="text-neutral-400 text-xs mb-8 text-center">
            We typically respond within 24 hours.
          </p>

          <form
            onSubmit={handleSubmit}
            className="w-full p-6 relative overflow-hidden space-y-4"
            style={{
              background: 'transparent',
              border: '1px solid rgba(75, 85, 99, 0.5)',
              borderRadius: '16px'
            }}
          >
            <div>
              <label htmlFor="name" className="block text-neutral-400 text-xs mb-1.5">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="h-11 w-full px-4 bg-transparent border border-neutral-700 text-white placeholder:text-neutral-500 rounded-lg focus:border-neutral-500 focus:outline-none"
                placeholder="Your name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-neutral-400 text-xs mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="h-11 w-full px-4 bg-transparent border border-neutral-700 text-white placeholder:text-neutral-500 rounded-lg focus:border-neutral-500 focus:outline-none"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-neutral-400 text-xs mb-1.5">
                  Subject *
                </label>
                <SubjectDropdown
                  value={formData.subject}
                  onChange={handleSubjectChange}
                />
                <input
                  type="hidden"
                  name="subject"
                  value={formData.subject}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-neutral-400 text-xs mb-1.5">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-neutral-700 text-white placeholder:text-neutral-500 rounded-lg focus:border-neutral-500 focus:outline-none resize-none"
                placeholder="Tell us how we can help you..."
              />
            </div>

            {submitStatus === 'success' && (
              <p className="text-green-500 text-xs mt-1.5">Message sent successfully! Redirecting...</p>
            )}

            {submitStatus === 'error' && (
              <p className="text-red-500 text-xs mt-1.5">Failed to send message. Please try again.</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-11 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                !isSubmitting
                  ? 'text-black hover:opacity-95'
                  : 'bg-neutral-800 text-neutral-500 border border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              style={!isSubmitting ? { background: '#E8E8E8' } : {}}
            >
              <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              {!isSubmitting && <Mail size={16} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
