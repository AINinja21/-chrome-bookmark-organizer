import React from 'react';
import { ExternalLink, Edit2, Trash2, Globe, AlertCircle, Copy } from 'lucide-react';

export default function BookmarkList({
  bookmarks,
  folderTitle,
  onEditBookmark,
  onDeleteBookmark,
  duplicateSet
}) {
  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
      return null;
    }
  };

  const isHttp = (url) => {
    return url && url.startsWith('http://');
  };

  return (
    <div className="content-panel">
      <div className="panel-header">
        <h2>
          <span>📁</span>
          {folderTitle}
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            ({bookmarks.length} {bookmarks.length === 1 ? 'item' : 'items'})
          </span>
        </h2>
      </div>

      {bookmarks.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Globe size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h3>No bookmarks found</h3>
          <p style={{ fontSize: '0.9rem' }}>Try selecting a different folder or clearing search filters.</p>
        </div>
      ) : (
        <div className="bookmark-grid">
          {bookmarks.map((bm) => {
            const isDup = duplicateSet.has(bm.id);
            const faviconUrl = getFaviconUrl(bm.url);
            const isInsecure = isHttp(bm.url);

            return (
              <div
                key={bm.id}
                className={`bookmark-card ${isDup ? 'duplicate-warning' : ''}`}
              >
                <div className="bookmark-header">
                  <div className="favicon-icon">
                    {faviconUrl ? (
                      <img
                        src={faviconUrl}
                        alt=""
                        style={{ width: 16, height: 16 }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <Globe size={14} color="var(--text-dim)" />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bookmark-title-link"
                      title={bm.title}
                    >
                      {bm.title}
                    </a>
                    <div className="bookmark-url" title={bm.url}>
                      {bm.url}
                    </div>
                  </div>
                </div>

                <div className="bookmark-tags">
                  {isDup && (
                    <span className="tag-pill warning">
                      <Copy size={10} style={{ marginRight: 4 }} />
                      Duplicate
                    </span>
                  )}

                  {isInsecure && (
                    <span className="tag-pill warning" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                      <AlertCircle size={10} style={{ marginRight: 4 }} />
                      HTTP (Insecure)
                    </span>
                  )}

                  {bm.tags && bm.tags.map((tag, idx) => (
                    <span key={idx} className="tag-pill">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="bookmark-footer">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {bm.folderPath ? bm.folderPath.slice(-1)[0] : 'Bookmarks'}
                  </span>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-icon-btn"
                      title="Open in new tab"
                    >
                      <ExternalLink size={15} />
                    </a>

                    <button
                      className="action-icon-btn"
                      onClick={() => onEditBookmark(bm)}
                      title="Edit bookmark"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      className="action-icon-btn danger"
                      onClick={() => onDeleteBookmark(bm.id)}
                      title="Delete bookmark"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
