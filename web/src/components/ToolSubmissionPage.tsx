"use client";

import { useState } from 'react';
import { Package, Check, Upload, X, Play, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Navigation } from './Navigation';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export function ToolSubmissionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    toolName: '',
    toolUrl: '',
    tagline: '',
    pricing: '',
    overview: '',
    features: '',
    founderName: '',
    founderEmail: '',
    founderRole: '',
    companyName: '',
    additionalNotes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<{ file: File; preview: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate featured image upload
    if (!featuredImage) {
      alert('Please upload a featured image for your tool.');
      return;
    }
    
    // Validate file upload
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one screenshot or video demo of your tool.');
      return;
    }
    
    setSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert(`Thank you! We've received your submission for "${formData.toolName}". Our team will review it and contact you at ${formData.founderEmail} within 2-3 business days to process payment and complete the listing.`);
    setSubmitting(false);
    
    // Reset form
    setFormData({
      toolName: '',
      toolUrl: '',
      tagline: '',
      pricing: '',
      overview: '',
      features: '',
      founderName: '',
      founderEmail: '',
      founderRole: '',
      companyName: '',
      additionalNotes: ''
    });
    setUploadedFiles([]);
    setFeaturedImage(null);
    
    // Navigate back after success
    setTimeout(() => router.push("/"), 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(file => {
        const id = Math.random().toString(36).substr(2, 9);
        const preview = URL.createObjectURL(file);
        const type = file.type.startsWith('image') ? 'image' : 'video';
        return { id, file, preview, type };
      });
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(file => {
        const id = Math.random().toString(36).substr(2, 9);
        const preview = URL.createObjectURL(file);
        const type = file.type.startsWith('image') ? 'image' : 'video';
        return { id, file, preview, type };
      });
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setFeaturedImage({ file, preview });
    }
  };

  const handleRemoveFeaturedImage = () => {
    setFeaturedImage(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border/30">
        <Navigation 
          onBack={() => router.push("/")}
          onNavigate={(page) => {
            router.push(`/${page}`);
          }}
          onLogoClick={() => router.push("/")}
          showBackButton={false}
        />
      </div>

      {/* Hero Section */}
      <section className="px-4 md:px-8 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl mb-4" style={{ fontWeight: 500, lineHeight: 1.2 }}>
            List Your AI Tool
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" style={{ lineHeight: 1.6 }}>
            Get your tool listed on Pinpoint AI with human verification, full scoring analysis, and featured exposure in our Alpha Bar.
          </p>
        </div>

        {/* Package Info */}
        <div className="bg-primary/5 border-2 border-primary rounded-[24px] p-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl mb-2" style={{ fontWeight: 500 }}>New Tool Listing Package</h2>
              <p className="text-muted-foreground mb-4">Everything you need to get started on Pinpoint</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm">Human Verified badge</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm">Full scoring & analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm">3 days in Alpha Bar</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm">Feature verification</span>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="flex items-baseline justify-center md:justify-end gap-1 mb-2">
                <span className="text-5xl" style={{ fontWeight: 600, color: '#6E7E55' }}>$499</span>
              </div>
              <p className="text-sm text-muted-foreground">One-time payment</p>
              <p className="text-xs text-muted-foreground mt-1">Payment collected after approval</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="px-4 md:px-8 pb-20 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Tool Information */}
          <div className="bg-card rounded-[24px] border border-border/50 p-8">
            <h2 className="text-2xl mb-6" style={{ fontWeight: 500 }}>Tool Information</h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
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
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                  Tagline *
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="One-line description of your tool"
                  required
                  maxLength={120}
                  className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.tagline.length}/120 characters
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
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

              <div>
                <label className="block text-sm mb-3" style={{ fontWeight: 500 }}>
                  Overview *
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Provide a comprehensive description of your tool. What problem does it solve? Who is it for? What makes it unique?
                </p>
                <textarea
                  name="overview"
                  value={formData.overview}
                  onChange={handleChange}
                  placeholder="Write a detailed overview of your AI tool..."
                  required
                  rows={8}
                  className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.overview.length} characters • Aim for 200-500 words
                </p>
              </div>

              <div>
                <label className="block text-sm mb-3" style={{ fontWeight: 500 }}>
                  Features *
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  List the key features of your tool. Put each feature on a new line. Be specific and focus on what makes your tool valuable.
                </p>
                <textarea
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  placeholder="Feature 1: Advanced natural language processing&#10;Feature 2: Real-time collaboration&#10;Feature 3: Custom integrations&#10;..."
                  required
                  rows={10}
                  className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  List 5-15 key features, one per line
                </p>
              </div>
            </div>
          </div>

          {/* Featured Image Upload */}
          <div className="bg-card rounded-[24px] border border-border/50 p-8">
            <h2 className="text-2xl mb-3" style={{ fontWeight: 500 }}>Featured Image *</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Upload a high-quality featured image for your tool. This will be the main thumbnail shown on your listing card (recommended: 1200x630px or 16:9 aspect ratio).
            </p>
            
            <div className="space-y-6">
              {!featuredImage ? (
                <div className="relative border-2 border-dashed rounded-[16px] p-10 transition-all border-border hover:border-primary/50 bg-secondary/20">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <ImageIcon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base mb-2" style={{ fontWeight: 500 }}>
                      Upload featured image
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag & drop or click to browse
                    </p>
                    <div className="text-xs text-muted-foreground">
                      PNG, JPG, or WebP • Minimum 1200px wide
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFeaturedImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-[12px] border border-primary/20 mb-4">
                    <Check className="w-4 h-4 text-primary" strokeWidth={2} />
                    <span className="text-sm" style={{ fontWeight: 500 }}>
                      Featured image uploaded
                    </span>
                  </div>
                  
                  <div className="relative group rounded-[16px] overflow-hidden border-2 border-primary/30">
                    <img
                      src={featuredImage.preview}
                      alt="Featured image preview"
                      className="w-full h-64 object-cover"
                    />
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleRemoveFeaturedImage}
                        className="px-6 py-3 bg-red-500 text-white rounded-[12px] hover:bg-red-600 transition-colors flex items-center gap-2"
                        style={{ fontWeight: 500 }}
                      >
                        <X className="w-4 h-4" />
                        Remove Image
                      </button>
                    </div>

                    <div className="absolute top-4 left-4">
                      <div className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full backdrop-blur-sm">
                        <span className="text-xs" style={{ fontWeight: 500 }}>
                          Featured Image
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-secondary/30 rounded-[12px] p-4 space-y-2">
                <h4 className="text-sm" style={{ fontWeight: 500 }}>Image guidelines:</h4>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Use a 16:9 aspect ratio (e.g., 1200x630px or 1600x900px)</li>
                  <li>• Choose a clear, professional image that represents your tool</li>
                  <li>• Avoid excessive text in the image</li>
                  <li>• Ensure good contrast and visibility at smaller sizes</li>
                  <li>• This will be the main image users see in search results</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-card rounded-[24px] border border-border/50 p-8">
            <h2 className="text-2xl mb-3" style={{ fontWeight: 500 }}>Screenshots & Video Demos *</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Upload screenshots and/or video demos showcasing your tool in action. High-quality visuals help users understand your product better.
            </p>
            
            <div className="space-y-6">
              <div
                className={`relative border-2 border-dashed rounded-[16px] p-12 transition-all ${
                  isDragging 
                    ? 'border-primary bg-primary/5 scale-[1.02]' 
                    : 'border-border hover:border-primary/50 bg-secondary/20'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base mb-2" style={{ fontWeight: 500 }}>
                    {isDragging ? 'Drop files here' : 'Drag & drop your files here'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse from your device
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      <span>PNG, JPG, WebP</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30"></div>
                    <div className="flex items-center gap-1.5">
                      <Play className="w-4 h-4" />
                      <span>MP4, WebM</span>
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  name="files"
                  multiple
                  accept="image/png,image/jpeg,image/jpg,image/webp,video/mp4,video/webm"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-[12px] border border-primary/20">
                  <Check className="w-4 h-4 text-primary" strokeWidth={2} />
                  <span className="text-sm" style={{ fontWeight: 500 }}>
                    {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'} uploaded
                  </span>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedFiles.map((file) => (
                    <div 
                      key={file.id} 
                      className="relative group rounded-[12px] overflow-hidden border border-border/50 hover:border-primary/50 transition-all"
                    >
                      {file.type === 'image' ? (
                        <img
                          src={file.preview}
                          alt={file.file.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 flex flex-col items-center justify-center bg-primary/5">
                          <Play className="w-12 h-12 text-primary mb-2" strokeWidth={1.5} />
                          <p className="text-xs text-muted-foreground px-2 text-center truncate max-w-full">
                            {file.file.name}
                          </p>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center gap-2"
                          style={{ fontWeight: 500 }}
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </button>
                      </div>

                      <div className="absolute top-2 left-2">
                        <div className="px-2 py-1 bg-background/90 rounded-md backdrop-blur-sm">
                          <span className="text-xs" style={{ fontWeight: 500 }}>
                            {file.type === 'image' ? 'Image' : 'Video'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-secondary/30 rounded-[12px] p-4 space-y-2">
                <h4 className="text-sm" style={{ fontWeight: 500 }}>Tips for great visuals:</h4>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Upload 3-6 screenshots showing key features and user interface</li>
                  <li>• Include at least one full-page screenshot of your tool</li>
                  <li>• Video demos should be 30-90 seconds and show real usage</li>
                  <li>• Use high resolution images (minimum 1280px wide recommended)</li>
                  <li>• Show your tool solving real problems for users</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Founder Information */}
          <div className="bg-card rounded-[24px] border border-border/50 p-8">
            <h2 className="text-2xl mb-6" style={{ fontWeight: 500 }}>Your Information</h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
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
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                    Your Role *
                  </label>
                  <input
                    type="text"
                    name="founderRole"
                    value={formData.founderRole}
                    onChange={handleChange}
                    placeholder="e.g., Founder, CEO, Product Manager"
                    required
                    className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Your Company Inc."
                    required
                    className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  placeholder="Any additional information, special requests, or context we should know..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-secondary/30 rounded-[24px] p-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl mb-4 text-center" style={{ fontWeight: 500 }}>
                Ready to Submit?
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Our team will review your submission within 2-3 business days. Once approved, we'll process the payment and complete your listing.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="flex-1 py-4 rounded-full border-2 border-border hover:border-primary/50 transition-all"
                  style={{ fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                  style={{ fontWeight: 500 }}
                >
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

