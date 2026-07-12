import { useState, useRef } from 'react';
import { RESUME_MAX_SIZE } from '../../config/constants';

// ─────────────────────────────────────────────────────────────────────────────
// FileUpload — Drag-and-drop PDF upload with validation
// ─────────────────────────────────────────────────────────────────────────────

const FileUpload = ({ onFileSelect, currentFile, label = 'Upload Resume' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validateFile = (file) => {
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return false;
    }
    if (file.size > RESUME_MAX_SIZE) {
      setError('File size must be less than 5MB');
      return false;
    }
    setError('');
    return true;
  };

  const handleFile = (file) => {
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>

      {currentFile && (
        <div className="mb-3 p-3 bg-emerald-50 rounded-lg flex items-center gap-2 border border-emerald-200">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9-9 0 00-9-9z" />
          </svg>
          <span className="text-sm text-emerald-700 font-medium">Current resume on file</span>
          <span className="text-xs text-emerald-600 ml-auto">Uploaded ✓</span>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleChange}
          className="hidden"
        />
        <svg className="mx-auto w-8 h-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-sm text-slate-600 font-medium">
          Drag & drop or <span className="text-blue-600">browse</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">PDF only, max 5MB</p>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
