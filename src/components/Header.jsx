import React from 'react';
import { Bookmark, HelpCircle, Sun, Moon, Sparkles } from 'lucide-react';

export default function Header({ theme, toggleTheme, onOpenGuide, onLoadSample }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">
          <Bookmark size={24} />
        </div>
        <div className="brand-title">
          <h1>
            Chrome Bookmark Smart Organizer
            <span style={{
              fontSize: '0.7rem',
              padding: '3px 8px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              fontWeight: 600
            }}>AI Assistant</span>
          </h1>
          <p>Clean duplicates, auto-categorize, and export perfectly organized bookmarks</p>
        </div>
      </div>

      <div className="header-actions">
        <button className="btn-secondary" onClick={onLoadSample}>
          <Sparkles size={16} color="#8b5cf6" />
          Try Sample Data
        </button>

        <button className="btn-secondary" onClick={onOpenGuide}>
          <HelpCircle size={16} />
          Chrome Guide
        </button>

        <button className="btn-secondary" onClick={toggleTheme} title="Toggle Dark/Light Mode">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
