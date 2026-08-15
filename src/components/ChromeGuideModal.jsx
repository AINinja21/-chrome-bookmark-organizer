import React from 'react';
import { X, ExternalLink, Download, Upload, CheckCircle2 } from 'lucide-react';

export default function ChromeGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span>📌</span> How to Organize Chrome Bookmarks
          </h2>
          <button className="action-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="guide-step">
            <div className="step-num">1</div>
            <div className="step-text">
              <h4>Open Chrome Bookmark Manager</h4>
              <p>
                Press <span className="shortcut-badge">Ctrl + Shift + O</span> (Windows) or <span className="shortcut-badge">Cmd + Option + B</span> (Mac) in Chrome, or type <code>chrome://bookmarks</code> in your browser address bar.
              </p>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-num">2</div>
            <div className="step-text">
              <h4>Export Bookmarks to HTML</h4>
              <p>
                Click the 3 dots menu <span className="shortcut-badge">⋮</span> in the top-right corner of Chrome Bookmark Manager &rarr; select <strong>Export bookmarks</strong>. Save the file to your downloads folder.
              </p>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-num">3</div>
            <div className="step-text">
              <h4>Clean & Categorize in this Web App</h4>
              <p>
                Drop the exported file into this Web App. Click <strong>Clean Duplicates</strong> and <strong>Auto-Categorize</strong> to organize all loose links into clean folders automatically.
              </p>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-num">4</div>
            <div className="step-text">
              <h4>Export & Import Back to Chrome</h4>
              <p>
                Click <strong>Export HTML for Chrome</strong> to download your organized file. Back in <code>chrome://bookmarks</code>, click <span className="shortcut-badge">⋮</span> &rarr; <strong>Import bookmarks</strong>!
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
          <button className="btn-primary" onClick={onClose}>
            <CheckCircle2 size={18} />
            Got it, Let's Start!
          </button>
        </div>
      </div>
    </div>
  );
}
