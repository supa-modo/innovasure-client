/**
 * File Upload Component
 * Hybrid drag-drop and button upload with previews
 */

import { useState, useRef, useCallback } from "react";
import { FiUpload, FiX, FiFile, FiFileText, FiImage } from "react-icons/fi";

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  multiple?: boolean;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
];

// Helper function to convert file extension to MIME type
const extensionToMimeType = (ext: string): string | null => {
  const extension = ext.toLowerCase().replace(".", "");
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return mimeMap[extension] || null;
};

// Helper function to normalize accepted types (support both extensions and MIME types)
const normalizeAcceptedTypes = (types: string[]): string[] => {
  return types.flatMap((type) => {
    if (type.startsWith(".")) {
      // It's an extension, convert to MIME type
      const mimeType = extensionToMimeType(type);
      return mimeType ? [mimeType] : [];
    }
    // Already a MIME type
    return [type];
  });
};

const FileUpload = ({
  onUpload,
  maxFiles = 5,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  multiple = true,
  className = "",
}: FileUploadProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize accepted types to MIME types
  const normalizedAcceptedTypes = normalizeAcceptedTypes(acceptedTypes);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!normalizedAcceptedTypes.includes(file.type)) {
      return `File type not supported. Accepted types: ${acceptedTypes
        .map((t) => (t.startsWith(".") ? t : t.split("/")[1]))
        .join(", ")}`;
    }

    // Check file size
    if (file.size > maxSize) {
      return `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`;
    }

    return null;
  };

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles || newFiles.length === 0) return;

      setError(null);

      const filesArray = Array.from(newFiles);
      const validFiles: FileWithPreview[] = [];

      for (const file of filesArray) {
        const error = validateFile(file);
        if (error) {
          setError(error);
          continue;
        }

        if (files.length + validFiles.length >= maxFiles) {
          setError(`Maximum ${maxFiles} files allowed`);
          break;
        }

        const fileWithPreview = file as FileWithPreview;
        if (file.type.startsWith("image/")) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }
        validFiles.push(fileWithPreview);
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    },
    [files.length, maxFiles, normalizedAcceptedTypes, maxSize, acceptedTypes]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    const file = files[index];
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      await onUpload(files);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Clear files after successful upload
      setTimeout(() => {
        setFiles([]);
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <FiImage className="w-5 h-5 text-blue-600" />;
    }
    if (file.type === "application/pdf") {
      return <FiFileText className="w-5 h-5 text-red-600" />;
    }
    return <FiFile className="w-5 h-5 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className={className}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-700 font-medium mb-2">
          Drag and drop files here
        </p>
        <p className="text-sm text-gray-500 mb-4">or</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Browse Files
        </button>
        <p className="text-xs text-gray-500 mt-3">
          Accepted: PDF, Images (JPG, PNG, GIF, WebP, BMP), Documents (Max {maxSize / 1024 / 1024}MB each)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-white rounded">
                  {getFileIcon(file)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={isUploading}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button & Progress */}
      {files.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading... {uploadProgress}%</span>
              </>
            ) : (
              <>
                <FiUpload className="w-5 h-5" />
                <span>
                  Upload {files.length} file{files.length > 1 ? "s" : ""}
                </span>
              </>
            )}
          </button>
          {isUploading && (
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
