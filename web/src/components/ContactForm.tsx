"use client";

import { useState, useRef } from 'react';
import { X, Send, Check, Paperclip, File } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import Logo from './Logo';

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactForm({ open, onOpenChange }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 2 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setAttachedFile(null);
      setIsSubmitted(false);
      onOpenChange(false);
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setAttachedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden bg-background border-primary/20">
        {/* Header Section */}
        <div className="bg-accent/10 px-6 py-5 border-b border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <Logo size="sm" />
            <DialogTitle className="text-xl" style={{ fontWeight: 500 }}>
              Get in Touch
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Have questions about pricing, features, or anything else? We'd love to hear from you.
          </DialogDescription>
        </div>

        {/* Form Section */}
        <div className="px-6 py-6">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>
                Message Sent!
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Thank you for reaching out. We'll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm" style={{ fontWeight: 500 }}>
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-background border-2 border-border/50 focus:border-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm" style={{ fontWeight: 500 }}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-background border-2 border-border/50 focus:border-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Subject Field */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm" style={{ fontWeight: 500 }}>
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="What's this about?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-background border-2 border-border/50 focus:border-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm" style={{ fontWeight: 500 }}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell us more about your inquiry..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2.5 bg-background border-2 border-border/50 focus:border-primary/50 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                
                {/* File Attachment */}
                <div className="pt-1">
                  {attachedFile ? (
                    <div className="flex items-center gap-3 p-3 bg-accent/10 border border-border/50 rounded-lg">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                        <File className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ fontWeight: 500 }}>
                          {attachedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachedFile.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 hover:bg-background rounded-md transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="file-upload"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Attach a file</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border-2 border-border/50 hover:bg-secondary/50 transition-all"
                  style={{ fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ fontWeight: 500 }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

