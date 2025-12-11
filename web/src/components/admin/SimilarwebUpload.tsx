"use client";

import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface SimilarwebUploadProps {
  toolId: string;
  toolSlug: string;
}

export function SimilarwebUpload({ toolId, toolSlug }: SimilarwebUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      if (!fileName.endsWith('.pdf') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        setStatus({ type: 'error', message: 'Please select a PDF or Excel file.' });
        return;
      }
      setFile(selectedFile);
      setStatus({ type: null, message: '' });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus({ type: 'error', message: 'Please select a file first.' });
      return;
    }

    setUploading(true);
    setStatus({ type: null, message: '' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('toolId', toolId);

      const response = await fetch('/api/admin/similarweb/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      setStatus({ type: 'success', message: 'Similarweb data imported successfully!' });
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('similarweb-file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      // Reload page after a short delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Upload error:', error);
      setStatus({ 
        type: 'error', 
        message: error.message || 'Failed to upload file. Please try again.' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold" style={{ fontWeight: 600 }}>
          Upload Similarweb Report
        </h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Upload a PDF or Excel file from Similarweb to import traffic and engagement metrics. 
        Data will be merged with existing reports.
      </p>

      <div className="space-y-4">
        <div>
          <label 
            htmlFor="similarweb-file-input"
            className="block w-full cursor-pointer"
          >
            <div className="border-2 border-dashed border-border rounded-[12px] p-6 hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div className="text-center">
                  <span className="text-sm font-medium">
                    {file ? file.name : 'Click to select file'}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF or Excel (.xlsx, .xls)
                  </p>
                </div>
              </div>
            </div>
            <input
              id="similarweb-file-input"
              type="file"
              accept=".pdf,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {status.type && (
          <div className={`flex items-center gap-2 p-3 rounded-[12px] ${
            status.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <p className={`text-sm ${
              status.type === 'success' 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {status.message}
            </p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full rounded-full bg-primary text-primary-foreground px-6 py-3 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ fontWeight: 500 }}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload & Import Data
            </>
          )}
        </button>
      </div>
    </div>
  );
}


