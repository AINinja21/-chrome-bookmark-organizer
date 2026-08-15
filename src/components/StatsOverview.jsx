import React from 'react';
import { Bookmark, Folder, Copy, AlertTriangle, Layers } from 'lucide-react';

export default function StatsOverview({ totalBookmarks, totalFolders, duplicateCount, uncategorizedCount }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
          <Bookmark size={24} />
        </div>
        <div className="stat-info">
          <h3>{totalBookmarks}</h3>
          <p>Total Bookmarks</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
          <Folder size={24} />
        </div>
        <div className="stat-info">
          <h3>{totalFolders}</h3>
          <p>Active Folders</p>
        </div>
      </div>

      <div className="stat-card" style={{ borderColor: duplicateCount > 0 ? 'rgba(245, 158, 11, 0.4)' : undefined }}>
        <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
          <Copy size={24} />
        </div>
        <div className="stat-info">
          <h3 style={{ color: duplicateCount > 0 ? '#f59e0b' : 'inherit' }}>{duplicateCount}</h3>
          <p>Duplicates Detected</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
          <Layers size={24} />
        </div>
        <div className="stat-info">
          <h3>{uncategorizedCount}</h3>
          <p>Uncategorized Links</p>
        </div>
      </div>
    </div>
  );
}
