import React, { useState } from 'react';
import { X, Wand2, Check, Sparkles, BookOpen, Laptop, Globe, MessageSquare, Plus, Trash2, Sliders } from 'lucide-react';
import { CATEGORIZATION_PRESETS, parseAiPromptToRules } from '../utils/bookmarkParser';

export default function CategorizationModal({ isOpen, onClose, onApplyCustomRules, currentRules }) {
  const [activeTab, setActiveTab] = useState('PROMPT'); // 'PROMPT' or 'PRESETS'
  const [aiPrompt, setAiPrompt] = useState(
    'Organize into Islamic Studies, PharmD & Medicine, Digital Skills, Personality Development, Readings & Literature, and Secular Subjects'
  );
  const [customRules, setCustomRules] = useState(currentRules || CATEGORIZATION_PRESETS[0].rules);
  const [selectedPresetId, setSelectedPresetId] = useState('ACADEMIC_PERSONAL');

  if (!isOpen) return null;

  const samplePrompts = [
    '🕌 Islamic Studies, PharmD Studies & Medicine, Digital Skills, Personality Development, Readings',
    '💻 Frontend Dev, Backend APIs, AI Tools, Cloud DevOps, Tech Documentation',
    '📚 Academic Research Papers, Book Summaries, Podcasts, Personal Journaling',
    '💼 Work Projects, Personal Shopping, Finance & Banking, Streaming Media'
  ];

  const handleAnalyzePrompt = (promptToAnalyze = aiPrompt) => {
    const generated = parseAiPromptToRules(promptToAnalyze);
    setCustomRules(generated);
  };

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setCustomRules(preset.rules);
  };

  const handleAddCustomFolder = () => {
    const folderName = prompt('Enter new folder category name:');
    if (!folderName || !folderName.trim()) return;
    const clean = folderName.trim();
    setCustomRules(prev => [
      ...prev,
      {
        name: clean,
        keywords: [clean.toLowerCase()],
        domains: []
      }
    ]);
  };

  const handleDeleteRule = (idx) => {
    setCustomRules(prev => prev.filter((_, i) => i !== idx));
  };

  const handleApply = () => {
    onApplyCustomRules(customRules);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 820 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Sparkles size={22} color="#8b5cf6" />
            AI-Powered Bookmark Customization
          </h2>
          <button className="action-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
          <button
            className={`btn-secondary ${activeTab === 'PROMPT' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('PROMPT')}
            style={{ fontSize: '0.88rem' }}
          >
            <MessageSquare size={16} />
            Natural Language AI Prompt Box
          </button>
          <button
            className={`btn-secondary ${activeTab === 'PRESETS' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('PRESETS')}
            style={{ fontSize: '0.88rem' }}
          >
            <Sliders size={16} />
            Pre-Built Aspect Profiles
          </button>
        </div>

        {activeTab === 'PROMPT' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-main)' }}>
                ✨ Tell the AI how you want your bookmarks organized:
              </label>
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Organize my bookmarks into Islamic Knowledge, PharmD & Medicine, Digital Skills, Personality Development, and Readings..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Quick Prompt Pills */}
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                💡 Click a Quick Prompt Idea:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {samplePrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setAiPrompt(p);
                      handleAnalyzePrompt(p);
                    }}
                    style={{
                      fontSize: '0.76rem',
                      padding: '6px 12px',
                      borderRadius: 16,
                      background: 'var(--bg-primary)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      textAlign: 'left'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={() => handleAnalyzePrompt(aiPrompt)}
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', alignSelf: 'flex-start' }}
            >
              <Wand2 size={16} />
              Analyze Prompt & Generate Folders
            </button>

            {/* Rules Preview & Tweak Builder */}
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  📂 Target Folder Rules ({customRules.length} Categories Generated):
                </span>
                <button className="btn-secondary" onClick={handleAddCustomFolder} style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                  <Plus size={14} /> Add Folder
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {customRules.map((rule, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--accent-purple)' }}>{rule.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Keywords: {rule.keywords ? rule.keywords.slice(0, 6).join(', ') + (rule.keywords.length > 6 ? '...' : '') : 'auto'}
                      </div>
                    </div>
                    <button className="action-icon-btn danger" onClick={() => handleDeleteRule(idx)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {CATEGORIZATION_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  style={{
                    padding: 16,
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-primary)',
                    border: `2px solid ${isSelected ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{preset.name}</h3>
                    {isSelected && <Check size={18} color="var(--accent-purple)" />}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>{preset.description}</p>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary btn-success" onClick={handleApply}>
            <Check size={16} />
            Apply & Organize Bookmarks
          </button>
        </div>
      </div>
    </div>
  );
}
