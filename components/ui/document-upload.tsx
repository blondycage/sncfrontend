import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { uploadApi } from '@/lib/api';

interface DocumentUploadProps {
  onDocumentChange: (url: string, cloudinaryId?: string) => void;
  maxSize?: number; // in MB
  className?: string;
  currentDocument?: {
    url: string;
    name?: string;
  };
  acceptedTypes?: string[];
  label?: string;
  required?: boolean;
}

export function DocumentUpload({ 
  onDocumentChange, 
  maxSize = 10,
  className = "",
  currentDocument,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
  label = "Upload Document",
  required = false
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Upload document using API
  const uploadDocument = async (file: File): Promise<{url: string, cloudinaryId: string}> => {
    const result = await uploadApi.uploadDocument(file);
    return {
      url: result.data.url,
      cloudinaryId: result.data.public_id
    };
  };

  // Handle file selection and upload
  const handleFileUpload = useCallback(async (file: File) => {
    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      toast.error(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File is larger than ${maxSize}MB`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadDocument(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      onDocumentChange(result.url, result.cloudinaryId);
      toast.success('Document uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [acceptedTypes, maxSize, onDocumentChange]);

  // Remove document
  const removeDocument = () => {
    onDocumentChange('');
    toast.success('Document removed');
  };

  // View document
  const viewDocument = () => {
    if (currentDocument?.url) {
      window.open(currentDocument.url, '_blank');
    }
  };

  // Download document
  const downloadDocument = () => {
    if (currentDocument?.url) {
      const link = document.createElement('a');
      link.href = currentDocument.url;
      link.download = currentDocument.name || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {!currentDocument?.url ? (
        <>
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept={acceptedTypes.join(',')}
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
              id={`document-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
              disabled={uploading}
            />
            
            <label
              htmlFor={`document-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
              className={`cursor-pointer ${uploading ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {uploading ? 'Uploading...' : 'Upload Document'}
              </p>
              <p className="text-sm text-gray-500">
                Click to select a document
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Accepted formats: {acceptedTypes.join(', ')} • Max {maxSize}MB
              </p>
            </label>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </>
      ) : (
        /* Document Preview */
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {currentDocument.name || 'Document'}
                </p>
                <p className="text-xs text-gray-500">Document uploaded successfully</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={viewDocument}
                className="flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadDocument}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
              
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeDocument}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}