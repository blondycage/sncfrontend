import React, { useState, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { uploadApi } from '@/lib/api';

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
  maxSize?: number; // in MB
  className?: string;
  useUploadApi?: boolean; // Option to use the simplified uploadApi
  initialImages?: string[]; // Initial images for editing
}

export function ImageUpload({
  onImagesChange,
  maxImages = 5,
  maxSize = 10,
  className = "",
  useUploadApi = true, // Default to using the new uploadApi
  initialImages = []
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages);

  // Update imageUrls when initialImages change
  useEffect(() => {
    setImageUrls(initialImages);
  }, [initialImages]);

  // Direct Cloudinary upload function
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    formData.append('folder', 'listings');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dtuorzemy/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  };

  // Handle file selection and upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    const filesArray = Array.from(files);
    
    // Validate file count
    if (imageUrls.length + filesArray.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles = filesArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`${file.name} is larger than ${maxSize}MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      let uploadedUrls: string[];

      if (useUploadApi) {
        // Use the simplified uploadApi
        const response = await uploadApi.uploadImages(validFiles);
        uploadedUrls = response.data.urls;
        setUploadProgress(100);
      } else {
        // Use direct Cloudinary upload with progress tracking
        const uploadPromises = validFiles.map(async (file, index) => {
          const url = await uploadToCloudinary(file);
          setUploadProgress(((index + 1) / validFiles.length) * 100);
          return url;
        });
        uploadedUrls = await Promise.all(uploadPromises);
      }

      const newUrls = [...imageUrls, ...uploadedUrls];
      
      setImageUrls(newUrls);
      onImagesChange(newUrls);
      
      toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [imageUrls, maxImages, maxSize, onImagesChange, useUploadApi]);

  // Remove image
  const removeImage = (indexToRemove: number) => {
    const newUrls = imageUrls.filter((_, index) => index !== indexToRemove);
    setImageUrls(newUrls);
    onImagesChange(newUrls);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
          id="image-upload"
          disabled={uploading || imageUrls.length >= maxImages}
        />
        
        <label
          htmlFor="image-upload"
          className={`cursor-pointer ${uploading || imageUrls.length >= maxImages ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {uploading ? 'Uploading...' : 'Upload Images'}
          </p>
          <p className="text-sm text-gray-500">
            Drag and drop or click to select images
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Max {maxImages} images, {maxSize}MB each
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

      {/* Image Preview Grid */}
      {imageUrls.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Uploaded Images ({imageUrls.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual URL Input (Optional) */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or add image URL manually:
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                const url = input.value.trim();
                if (url && imageUrls.length < maxImages) {
                  const newUrls = [...imageUrls, url];
                  setImageUrls(newUrls);
                  onImagesChange(newUrls);
                  input.value = '';
                  toast.success('Image URL added');
                }
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
              const url = input?.value.trim();
              if (url && imageUrls.length < maxImages) {
                const newUrls = [...imageUrls, url];
                setImageUrls(newUrls);
                onImagesChange(newUrls);
                input.value = '';
                toast.success('Image URL added');
              }
            }}
          >
            Add URL
          </Button>
        </div>
      </div>
    </div>
  );
} 
