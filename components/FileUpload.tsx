import React, { useRef, useState, useEffect } from 'react';
import { Upload, FileText, Image as ImageIcon, X, Plus, Files } from 'lucide-react';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelect, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Notify parent whenever local files change
  useEffect(() => {
    onFilesSelect(selectedFiles);
  }, [selectedFiles, onFilesSelect]);

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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    if (disabled) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
    const newFiles: File[] = [];

    Array.from(fileList).forEach(file => {
      if (validTypes.includes(file.type)) {
        // Simple duplicate check by name and size
        const isDuplicate = selectedFiles.some(f => f.name === file.name && f.size === file.size);
        if (!isDuplicate) {
          newFiles.push(file);
        }
      } else {
        // Optionally handle invalid types (silent skip for now)
      }
    });

    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
    
    // Reset input to allow selecting the same file again if needed after removal
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const removeFile = (indexToRemove: number) => {
    if (disabled) return;
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setSelectedFiles([]);
  };

  const triggerInput = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        className={`relative flex flex-col items-center justify-center w-full transition-all duration-300 ease-in-out rounded-xl
          ${selectedFiles.length === 0 ? 'p-10 border-2 border-dashed' : 'p-6 border border-solid'}
          ${dragActive ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-gray-300 bg-white'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          multiple
          onChange={handleChange}
          disabled={disabled}
        />

        {selectedFiles.length > 0 ? (
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <Files className="w-4 h-4 mr-2 text-indigo-600" />
                {selectedFiles.length} File{selectedFiles.length !== 1 && 's'} Selected
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={triggerInput}
                  disabled={disabled}
                  className="text-xs flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add
                </button>
                <button
                  onClick={clearAll}
                  disabled={disabled}
                  className="text-xs text-red-500 hover:text-red-700 px-2 py-1.5"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {selectedFiles.map((file, index) => (
                <div 
                  key={`${file.name}-${index}`} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-center overflow-hidden">
                    {file.type.includes('image') ? (
                      <ImageIcon className="w-8 h-8 text-indigo-500 mr-3 flex-shrink-0" />
                    ) : (
                      <FileText className="w-8 h-8 text-red-500 mr-3 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {!disabled && (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center cursor-pointer py-4"
            onClick={triggerInput}
          >
            <div className="p-4 bg-indigo-50 rounded-full mb-4">
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              Upload Bank Statements
            </p>
            <p className="text-gray-500 text-center max-w-sm">
              Drag & drop PDFs or Images here, or click to browse.
              <br/>
              <span className="text-xs mt-1 block opacity-70">
                You can upload multiple files at once.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};