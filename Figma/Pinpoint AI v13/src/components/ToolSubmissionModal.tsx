import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useState } from 'react';
import { Package } from 'lucide-react';

interface ToolSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ToolSubmissionModal({ isOpen, onClose }: ToolSubmissionModalProps) {
  const [formData, setFormData] = useState({
    toolName: '',
    toolUrl: '',
    description: '',
    category: '',
    founderName: '',
    founderEmail: '',
    pricing: '',
    additionalNotes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert(`Thank you! We've received your submission for "${formData.toolName}". Our team will review it and contact you at ${formData.founderEmail} within 2-3 business days.`);
    setSubmitting(false);
    setFormData({
      toolName: '',
      toolUrl: '',
      description: '',
      category: '',
      founderName: '',
      founderEmail: '',
      pricing: '',
      additionalNotes: ''
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <DialogTitle className="text-2xl" style={{ fontWeight: 600 }}>
                List Your AI Tool
              </DialogTitle>
              <DialogDescription>
                Submit your tool for review and listing on Pinpoint AI
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Tool Information */}
          <div className="space-y-4">
            <h3 className="text-sm text-muted-foreground" style={{ fontWeight: 600 }}>
              Tool Information
            </h3>

            <div>
              <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                Tool Name *
              </label>
              <input
                type="text"
                name="toolName"
                value={formData.toolName}
                onChange={handleChange}
                placeholder="e.g., ChatGPT"
                required
                className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                Tool Website URL *
              </label>
              <input
                type="url"
                name="toolUrl"
                value={formData.toolUrl}
                onChange={handleChange}
                placeholder="https://your-tool.com"
                required
                className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                Short Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of what your tool does..."
                required
                rows={3}
                className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select a category</option>
                <option value="writing">Writing</option>
                <option value="coding">Coding</option>
                <option value="design">Design</option>
                <option value="productivity">Productivity</option>
                <option value="research">Research</option>
                <option value="marketing">Marketing</option>
                <option value="analytics">Analytics</option>
                <option value="customer-service">Customer Service</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                Pricing Model *
              </label>
              <select
                name="pricing"
                value={formData.pricing}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select pricing model</option>
                <option value="free">Free</option>
                <option value="freemium">Freemium</option>
                <option value="subscription">Subscription</option>
                <option value="one-time">One-time Purchase</option>
                <option value="usage-based">Usage-based</option>
              </select>
            </div>
          </div>

          {/* Founder Information */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm text-muted-foreground" style={{ fontWeight: 600 }}>
              Your Information
            </h3>

            <div>
              <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                Your Name *
              </label>
              <input
                type="text"
                name="founderName"
                value={formData.founderName}
                onChange={handleChange}
                placeholder="John Smith"
                required
                className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                Email Address *
              </label>
              <input
                type="email"
                name="founderEmail"
                value={formData.founderEmail}
                onChange={handleChange}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                Additional Notes (Optional)
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                placeholder="Any additional information about your tool..."
                rows={3}
                className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
          </div>

          {/* Pricing Info */}
          <div className="bg-secondary/30 rounded-[16px] p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm" style={{ fontWeight: 500 }}>New Tool Listing Package</p>
                <p className="text-xs text-muted-foreground mt-1">One-time fee</p>
              </div>
              <p className="text-2xl" style={{ fontWeight: 600, color: '#6E7E55' }}>$499</p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-full border-2 border-border hover:border-primary/50 transition-all"
              style={{ fontWeight: 500 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
              style={{ fontWeight: 500 }}
            >
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            This is a demo form. No actual submission will be processed.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
