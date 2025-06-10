import React, { useState, useRef } from 'react';
import { Upload, X, Image, Video, FileText, Loader, Camera, Film } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MediaUploadProps {
  onMediaSelect: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  showPreview?: boolean;
}

export default function MediaUpload({ 
  onMediaSelect, 
  maxFiles = 4, 
  acceptedTypes = ['image/*', 'video/*'],
  maxSize = 50,
  showPreview = true
}: MediaUploadProps) {
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      // Check file size
      const isValidSize = file.size <= maxSize * 1024 * 1024;

      if (!isValidType) {
        alert(`نوع الملف ${file.name} غير مدعوم`);
        return false;
      }

      if (!isValidSize) {
        alert(`حجم الملف ${file.name} كبير جداً (الحد الأقصى ${maxSize}MB)`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    const newFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles);
    setSelectedFiles(newFiles);
    onMediaSelect(newFiles);

    // Upload files to Supabase Storage (simulation)
    if (user) {
      await uploadFiles(validFiles);
    }
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    
    for (const file of files) {
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // In a real implementation, you would upload to Supabase Storage:
        // const { data, error } = await supabase.storage
        //   .from('media')
        //   .upload(`${user.id}/${Date.now()}_${file.name}`, file);

        // Store media info in database
        await supabase.from('media_uploads').insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type.startsWith('image/') ? 'image' : 'video',
          file_size: file.size,
          file_url: URL.createObjectURL(file), // In real app, use Supabase Storage URL
          thumbnail_url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        });

      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`خطأ في رفع الملف ${file.name}`);
      }
    }
    
    setUploading(false);
    setUploadProgress({});
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onMediaSelect(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-6 h-6" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="w-6 h-6" />;
    }
    return <FileText className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="space-y-4">
          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
          <div>
            <p className="text-gray-600 mb-3">
              اسحب الملفات هنا أو اختر من الخيارات التالية
            </p>
            <div className="flex justify-center space-x-4 space-x-reverse">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4 ml-2" />
                اختر ملفات
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Camera className="w-4 h-4 ml-2" />
                التقط صورة
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              الحد الأقصى {maxFiles} ملفات، {maxSize}MB لكل ملف
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">الملفات المحددة:</h4>
          
          {/* Preview Grid */}
          {showPreview && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedFiles.map((file, index) => {
                const preview = getFilePreview(file);
                const progress = uploadProgress[file.name];
                
                return (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {preview ? (
                        <img
                          src={preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getFileIcon(file)}
                        </div>
                      )}
                      
                      {/* Progress overlay */}
                      {progress !== undefined && progress < 100 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                            <span className="text-sm">{progress}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {/* File info */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* File List */}
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="text-gray-500">
                    {getFileIcon(file)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    {uploadProgress[file.name] !== undefined && (
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[file.name]}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="flex items-center space-x-2 space-x-reverse text-blue-600">
          <Loader className="w-4 h-4 animate-spin" />
          <span className="text-sm">جاري رفع الملفات...</span>
        </div>
      )}
    </div>
  );
}