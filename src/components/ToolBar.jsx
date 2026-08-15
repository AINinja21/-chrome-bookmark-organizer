import React from 'react';
import { Search, Trash2, Sparkles, Download, Plus, RefreshCw } from 'lucide-react';

export default function ToolBar({
  searchQuery,
  setSearchQuery,
  onCleanDuplicates,
  onOpenCategorizeModal,
  onExportHtml,
  onAddBookmark,
  onReset,
  duplicateCount,
  customRulesCount
}) {
  return (
    <div className="toolbar-card">
      <div className="search-box">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search bookmarks by title, domain, URL, or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="toolbar-actions">
        {duplicateCount > 0 && (
          <button className="btn-secondary" style={{ borderColor: '#f59e0b', color: '#f59e0b' }} onClick={onCleanDuplicates}>
            <Trash2 size={16} />
            Clean {duplicateCount} Duplicates
          </button>
        )}

        <button
          className="btn-secondary"
          onClick={onOpenCategorizeModal}
          title="AI Customization Prompt Box"
          style={{ borderColor: 'var(--accent-purple)', background: 'rgba(139, 92, 246, 0.1)' }}
        >
          <Sparkles size={16} color="#8b5cf6" />
          <span>✨ AI Customizer ({customRulesCount || 6} Rules)</span>
        </button>

        <button className="btn-secondary" onClick={onAddBookmark}>
          <Plus size={16} />
          Add Bookmark
        </button>

        <button className="btn-primary btn-success" onClick={onExportHtml}>
          <Download size={16} />
          Export HTML for Chrome
        </button>

        <button className="btn-secondary" onClick={onReset} title="Load New File">
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
}
