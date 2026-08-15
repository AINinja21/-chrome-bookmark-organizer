import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import DropZone from './components/DropZone';
import StatsOverview from './components/StatsOverview';
import ToolBar from './components/ToolBar';
import FolderTree from './components/FolderTree';
import BookmarkList from './components/BookmarkList';
import ChromeGuideModal from './components/ChromeGuideModal';
import EditBookmarkModal from './components/EditBookmarkModal';
import CategorizationModal from './components/CategorizationModal';

import {
  parseChromeBookmarksHtml,
  getSampleBookmarksTree,
  flattenBookmarks,
  detectDuplicates,
  removeDuplicatesFromTree,
  autoCategorizeWithCustomRules,
  exportBookmarksToHtml,
  generateId,
  CATEGORIZATION_PRESETS
} from './utils/bookmarkParser';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [bookmarkTree, setBookmarkTree] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCategorizeModalOpen, setIsCategorizeModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeCustomRules, setActiveCustomRules] = useState(CATEGORIZATION_PRESETS[0].rules);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFileUpload = (htmlContent, fileName) => {
    try {
      const tree = parseChromeBookmarksHtml(htmlContent);
      // Auto-categorize immediately using active custom rules/prompt
      const categorized = autoCategorizeWithCustomRules(tree, activeCustomRules);
      setBookmarkTree(categorized);
      setSelectedFolderId('ALL');
      showToast(`Loaded & AI-organized ${flattenBookmarks(tree).length} bookmarks from ${fileName}`);
    } catch (err) {
      showToast('Error parsing HTML file. Make sure it is a Chrome Bookmark HTML export.');
    }
  };

  const handleLoadSample = () => {
    const sampleTree = getSampleBookmarksTree();
    const categorized = autoCategorizeWithCustomRules(sampleTree, activeCustomRules);
    setBookmarkTree(categorized);
    setSelectedFolderId('ALL');
    showToast('Loaded sample bookmarks organized by your AI custom rules!');
  };

  // Flattened Bookmarks list
  const allBookmarks = useMemo(() => {
    if (!bookmarkTree) return [];
    return flattenBookmarks(bookmarkTree);
  }, [bookmarkTree]);

  // Duplicates detection
  const duplicatesInfo = useMemo(() => {
    if (!bookmarkTree) return { totalDuplicates: 0, duplicateIds: [] };
    return detectDuplicates(bookmarkTree);
  }, [bookmarkTree]);

  const duplicateSet = useMemo(() => new Set(duplicatesInfo.duplicateIds), [duplicatesInfo]);

  // Calculate Folders & Stats
  const totalFoldersCount = useMemo(() => {
    if (!bookmarkTree) return 0;
    function countFolders(node) {
      if (node.type !== 'folder') return 0;
      let count = 1;
      if (node.children) {
        node.children.forEach(child => {
          count += countFolders(child);
        });
      }
      return count;
    }
    return countFolders(bookmarkTree);
  }, [bookmarkTree]);

  const uncategorizedCount = useMemo(() => {
    if (!bookmarkTree) return 0;
    const loose = allBookmarks.filter(b => b.folderPath && b.folderPath.includes('Uncategorized Links'));
    return loose.length;
  }, [allBookmarks, bookmarkTree]);

  // Handle Clean Duplicates
  const handleCleanDuplicates = () => {
    if (!bookmarkTree) return;
    const cleanTree = removeDuplicatesFromTree(bookmarkTree);
    setBookmarkTree(cleanTree);
    showToast(`Removed ${duplicatesInfo.totalDuplicates} duplicate bookmarks!`);
  };

  // Handle Apply AI Prompt / Custom Rules
  const handleApplyCustomRules = (rules) => {
    setActiveCustomRules(rules);
    if (!bookmarkTree) return;

    const categorizedTree = autoCategorizeWithCustomRules(bookmarkTree, rules);
    setBookmarkTree(categorizedTree);
    setSelectedFolderId('ALL');

    showToast(`AI Re-organized bookmarks into ${rules.length} custom prompt categories!`);
  };

  // Export HTML
  const handleExportHtml = () => {
    if (!bookmarkTree) return;
    const htmlString = exportBookmarksToHtml(bookmarkTree);
    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookmarks_organized_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded organized bookmarks.html! Ready to import into Chrome.');
  };

  // Filtered Bookmarks by Selected Folder & Search Query
  const displayedBookmarks = useMemo(() => {
    if (!bookmarkTree) return [];

    let list = [];
    if (selectedFolderId === 'ALL') {
      list = allBookmarks;
    } else {
      function findFolder(node) {
        if (node.id === selectedFolderId) return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findFolder(child);
            if (found) return found;
          }
        }
        return null;
      }
      const folder = findFolder(bookmarkTree);
      list = folder ? flattenBookmarks(folder) : [];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(bm =>
        bm.title.toLowerCase().includes(query) ||
        bm.url.toLowerCase().includes(query) ||
        (bm.tags && bm.tags.some(t => t.toLowerCase().includes(query)))
      );
    }

    return list;
  }, [bookmarkTree, selectedFolderId, searchQuery, allBookmarks]);

  // Selected Folder Title
  const folderTitle = useMemo(() => {
    if (selectedFolderId === 'ALL') return 'All Bookmarks';
    if (!bookmarkTree) return '';
    function getTitle(node) {
      if (node.id === selectedFolderId) return node.title;
      if (node.children) {
        for (const child of node.children) {
          const t = getTitle(child);
          if (t) return t;
        }
      }
      return null;
    }
    return getTitle(bookmarkTree) || 'Selected Folder';
  }, [selectedFolderId, bookmarkTree]);

  // Edit / Delete / Create Handlers
  const handleDeleteBookmark = (id) => {
    function deleteFromNode(node) {
      if (node.type === 'folder' && node.children) {
        return {
          ...node,
          children: node.children
            .filter(c => c.id !== id)
            .map(deleteFromNode)
        };
      }
      return node;
    }
    setBookmarkTree(prev => deleteFromNode(prev));
    showToast('Bookmark deleted');
  };

  const handleSaveBookmark = (updatedBm) => {
    if (!updatedBm.id) {
      // Add new
      const newBm = {
        id: generateId(),
        title: updatedBm.title,
        url: updatedBm.url,
        type: 'bookmark',
        tags: updatedBm.tags || ['custom']
      };
      setBookmarkTree(prev => ({
        ...prev,
        children: [...(prev.children || []), newBm]
      }));
      showToast('New bookmark created');
    } else {
      // Update existing
      function updateInNode(node) {
        if (node.id === updatedBm.id) {
          return { ...node, ...updatedBm };
        }
        if (node.type === 'folder' && node.children) {
          return {
            ...node,
            children: node.children.map(updateInNode)
          };
        }
        return node;
      }
      setBookmarkTree(prev => updateInNode(prev));
      showToast('Bookmark updated');
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter new folder name:');
    if (!folderName || !folderName.trim()) return;

    const newFolder = {
      id: generateId(),
      title: folderName.trim(),
      type: 'folder',
      children: []
    };

    setBookmarkTree(prev => ({
      ...prev,
      children: [newFolder, ...(prev.children || [])]
    }));
    showToast(`Folder "${folderName}" created`);
  };

  return (
    <div className="app-container">
      <Header
        theme={theme}
        toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onOpenGuide={() => setIsGuideOpen(true)}
        onLoadSample={handleLoadSample}
      />

      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'var(--accent-purple)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          fontWeight: 600,
          zIndex: 2000,
          animation: 'fadeIn 0.3s ease'
        }}>
          {toastMessage}
        </div>
      )}

      {!bookmarkTree ? (
        <DropZone
          onFileUpload={handleFileUpload}
          onLoadSample={handleLoadSample}
          onOpenGuide={() => setIsGuideOpen(true)}
        />
      ) : (
        <>
          <StatsOverview
            totalBookmarks={allBookmarks.length}
            totalFolders={totalFoldersCount}
            duplicateCount={duplicatesInfo.totalDuplicates}
            uncategorizedCount={uncategorizedCount}
          />

          <ToolBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCleanDuplicates={handleCleanDuplicates}
            onOpenCategorizeModal={() => setIsCategorizeModalOpen(true)}
            onExportHtml={handleExportHtml}
            onAddBookmark={() => {
              setEditingBookmark(null);
              setIsEditModalOpen(true);
            }}
            onReset={() => setBookmarkTree(null)}
            duplicateCount={duplicatesInfo.totalDuplicates}
            customRulesCount={activeCustomRules.length}
          />

          <div className="main-layout">
            <FolderTree
              rootNode={bookmarkTree}
              selectedFolderId={selectedFolderId}
              onSelectFolder={setSelectedFolderId}
              onCreateFolder={handleCreateFolder}
            />

            <BookmarkList
              bookmarks={displayedBookmarks}
              folderTitle={folderTitle}
              onEditBookmark={(bm) => {
                setEditingBookmark(bm);
                setIsEditModalOpen(true);
              }}
              onDeleteBookmark={handleDeleteBookmark}
              duplicateSet={duplicateSet}
            />
          </div>
        </>
      )}

      <ChromeGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <CategorizationModal
        isOpen={isCategorizeModalOpen}
        onClose={() => setIsCategorizeModalOpen(false)}
        onApplyCustomRules={handleApplyCustomRules}
        currentRules={activeCustomRules}
      />

      <EditBookmarkModal
        isOpen={isEditModalOpen}
        bookmark={editingBookmark}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveBookmark}
      />
    </div>
  );
}
