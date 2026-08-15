import React from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Layers, Plus } from 'lucide-react';
import { flattenBookmarks } from '../utils/bookmarkParser';

export default function FolderTree({ rootNode, selectedFolderId, onSelectFolder, onCreateFolder }) {
  const [expandedFolderIds, setExpandedFolderIds] = React.useState(new Set([rootNode.id]));

  const toggleExpand = (folderId, e) => {
    e.stopPropagation();
    setExpandedFolderIds(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  function renderFolderItem(node, level = 0) {
    if (node.type !== 'folder') return null;

    const isSelected = selectedFolderId === node.id;
    const isExpanded = expandedFolderIds.has(node.id);
    const hasChildrenFolders = node.children && node.children.some(c => c.type === 'folder');
    const bookmarkCount = flattenBookmarks(node).length;

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          className={`tree-item ${isSelected ? 'active' : ''}`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => onSelectFolder(node.id)}
        >
          <div className="tree-item-left">
            {hasChildrenFolders ? (
              <span onClick={(e) => toggleExpand(node.id, e)} style={{ display: 'flex', alignItems: 'center' }}>
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            ) : (
              <span style={{ width: 16 }} />
            )}

            {isExpanded ? <FolderOpen size={18} color="#3b82f6" /> : <Folder size={18} color="#3b82f6" />}
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {node.title}
            </span>
          </div>

          <span className="badge-count">{bookmarkCount}</span>
        </div>

        {isExpanded && node.children && (
          <div className="tree-list">
            {node.children.map(child => renderFolderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  }

  const allBookmarksTotal = flattenBookmarks(rootNode).length;

  return (
    <div className="sidebar-panel">
      <div className="panel-header">
        <h2>
          <Layers size={18} color="#3b82f6" />
          Folders
        </h2>
        <button className="action-icon-btn" onClick={onCreateFolder} title="Create New Folder">
          <Plus size={18} />
        </button>
      </div>

      <div
        className={`tree-item ${selectedFolderId === 'ALL' ? 'active' : ''}`}
        onClick={() => onSelectFolder('ALL')}
      >
        <div className="tree-item-left">
          <Layers size={18} color="#8b5cf6" />
          <span>All Bookmarks</span>
        </div>
        <span className="badge-count">{allBookmarksTotal}</span>
      </div>

      <div className="tree-list">
        {renderFolderItem(rootNode)}
      </div>
    </div>
  );
}
