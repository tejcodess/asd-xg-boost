import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

const CSVDropzone = ({ onFileSelect, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndSetFile = (file) => {
    setError('');
    if (!file) return;
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }

    // Check file size (limit to 10MB for safety)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 10MB.');
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    setError('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div 
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out bg-white
          ${dragActive ? 'border-clinical-blue bg-blue-50' : 'border-slate-300 hover:bg-slate-50'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!selectedFile ? (
          <>
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleChange}
              accept=".csv"
              disabled={isLoading}
            />
            <UploadCloud className={`w-12 h-12 mb-4 ${dragActive ? 'text-clinical-blue' : 'text-slate-400'}`} />
            <p className="mb-2 text-sm text-slate-700 font-medium">
              <span className="font-semibold text-clinical-blue">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">CSV file with 75 skeletal coordinate columns</p>
          </>
        ) : (
          <div className="flex flex-col items-center p-6 text-center">
            <div className="relative">
              <FileText className="w-16 h-16 text-clinical-blue mb-4" />
              {!isLoading && (
                <button 
                  onClick={clearFile}
                  className="absolute -top-2 -right-2 p-1 bg-white rounded-full border border-slate-200 shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-700 break-all">{selectedFile.name}</p>
            <p className="text-xs text-slate-500 mt-1">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

export default CSVDropzone;
