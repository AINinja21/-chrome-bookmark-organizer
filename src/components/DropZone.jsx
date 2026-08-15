import React, { useRef, useState } from 'react';
import { Upload, FileCode, Sparkles, HelpCircle } from 'lucide-react';

export default function DropZone({ onFileUpload, onLoadSample, onOpenGuide }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      onFileUpload(event.target.result, file.name);
    };
    reader.readAsText(file);
  };

  return (
    <div 
      className={`dropzone-container ${isDragActive ? 'active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".html,.htm" 
        style={{ display: 'none' }} 
      />

      <div className="dropzone-icon">
        <Upload size={32} />
      </div>

      <h2 className="dropzone-title">Drop your Chrome `bookmarks.html` file here</h2>
      <p className="dropzone-sub">
        Export your bookmarks from Chrome (<span className="shortcut-badge">Ctrl + Shift + O</span> &rarr; Export), then drop the HTML file here for automated cleanup.
      </p>

      <div className="dropzone-actions" onClick={(e) => e.stopPropagation()}>
        <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
          <FileCode size={18} />
          Choose HTML File
        </button>

        <span className="divider-or">or</span>

        <button className="btn-secondary" onClick={onLoadSample}>
          <Sparkles size={18} color="#8b5cf6" />
          Test with Sample Bookmarks
        </button>

        <button className="btn-secondary" onClick={onOpenGuide}>
          <HelpCircle size={18} />
          How to Export?
        </button>
      </div>
    </div>
  );
}
