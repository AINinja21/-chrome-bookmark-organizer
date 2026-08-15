/**
 * Chrome Bookmark Netscape HTML Parser & Generator Utility
 */

// Helper to generate unique IDs
export const generateId = () => 'bm_' + Math.random().toString(36).substr(2, 9);

// Standard Netscape Bookmark HTML Header
const NETSCAPE_HEADER = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will read this file and preserve all properties. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

/**
 * Parses Chrome Bookmark HTML text into a structured tree object.
 */
export function parseChromeBookmarksHtml(htmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

  const rootDl = doc.querySelector('dl');

  if (!rootDl) {
    const anchors = Array.from(doc.querySelectorAll('a'));
    return {
      id: 'root',
      title: 'Bookmarks Bar',
      type: 'folder',
      children: anchors.map(a => ({
        id: generateId(),
        title: a.textContent.trim() || a.href,
        url: a.href,
        type: 'bookmark',
        addDate: a.getAttribute('add_date') || String(Math.floor(Date.now() / 1000)),
        icon: a.getAttribute('icon') || null,
        tags: extractDomainTags(a.href)
      }))
    };
  }

  function parseDl(dlElement, folderTitle = 'Bookmarks Bar') {
    const node = {
      id: generateId(),
      title: folderTitle,
      type: 'folder',
      children: []
    };

    const childrenNodes = Array.from(dlElement.children);

    for (let i = 0; i < childrenNodes.length; i++) {
      const el = childrenNodes[i];
      if (el.tagName.toLowerCase() !== 'dt') continue;

      const h3 = el.querySelector(':scope > h3');
      const anchor = el.querySelector(':scope > a');
      const nextDl = el.querySelector(':scope > dl');

      if (h3) {
        const folderName = h3.textContent.trim() || 'Untitled Folder';
        let subDl = nextDl;
        
        if (!subDl && childrenNodes[i + 1] && childrenNodes[i + 1].tagName.toLowerCase() === 'dl') {
          subDl = childrenNodes[i + 1];
        }

        const subFolderNode = subDl 
          ? parseDl(subDl, folderName) 
          : { id: generateId(), title: folderName, type: 'folder', children: [] };
        
        node.children.push(subFolderNode);
      } else if (anchor) {
        const url = anchor.getAttribute('href') || anchor.href;
        if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('chrome://'))) {
          node.children.push({
            id: generateId(),
            title: anchor.textContent.trim() || url,
            url: url,
            type: 'bookmark',
            addDate: anchor.getAttribute('add_date') || String(Math.floor(Date.now() / 1000)),
            icon: anchor.getAttribute('icon') || null,
            tags: extractDomainTags(url)
          });
        }
      }
    }

    return node;
  }

  return parseDl(rootDl, 'Bookmarks Bar');
}

/**
 * Extracts auto tags based on domain name
 */
export function extractDomainTags(url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    const parts = hostname.split('.');
    const domain = parts[0];
    const tags = [domain];
    
    if (url.includes('quran') || url.includes('sunnah') || url.includes('islam')) tags.push('islamic');
    if (url.includes('pubmed') || url.includes('medscape') || url.includes('drug')) tags.push('pharmd', 'medicine');
    if (url.includes('github') || url.includes('coursera') || url.includes('udemy')) tags.push('digital-skills');
    if (url.includes('medium') || url.includes('scholar') || url.includes('arxiv')) tags.push('readings');

    return Array.from(new Set(tags));
  } catch (e) {
    return ['web'];
  }
}

/**
 * Flatten tree into flat array of all bookmarks
 */
export function flattenBookmarks(node, folderPath = ['Bookmarks Bar']) {
  let list = [];
  if (node.type === 'bookmark') {
    list.push({ ...node, folderPath });
  } else if (node.type === 'folder' && node.children) {
    const currentPath = [...folderPath, node.title];
    for (const child of node.children) {
      list = list.concat(flattenBookmarks(child, currentPath));
    }
  }
  return list;
}

/**
 * Finds all duplicates
 */
export function detectDuplicates(rootNode) {
  const allBookmarks = flattenBookmarks(rootNode);
  const urlMap = new Map();
  const duplicateIds = new Set();

  allBookmarks.forEach(bm => {
    try {
      const normalizedUrl = new URL(bm.url).href.replace(/\/$/, '').toLowerCase();
      if (urlMap.has(normalizedUrl)) {
        duplicateIds.add(bm.id);
      } else {
        urlMap.set(normalizedUrl, bm.id);
      }
    } catch (e) {
      if (urlMap.has(bm.url)) {
        duplicateIds.add(bm.id);
      } else {
        urlMap.set(bm.url, bm.id);
      }
    }
  });

  return {
    duplicateIds: Array.from(duplicateIds),
    totalDuplicates: duplicateIds.size,
    duplicatePairs: Array.from(duplicateIds).map(id => allBookmarks.find(b => b.id === id))
  };
}

/**
 * Removes duplicates from the tree, keeping the first occurrence
 */
export function removeDuplicatesFromTree(node) {
  const seenUrls = new Set();

  function filterNode(curr) {
    if (curr.type === 'bookmark') {
      let normalized = curr.url;
      try {
        normalized = new URL(curr.url).href.replace(/\/$/, '').toLowerCase();
      } catch (e) {}

      if (seenUrls.has(normalized)) {
        return null;
      }
      seenUrls.add(normalized);
      return curr;
    }

    if (curr.type === 'folder' && curr.children) {
      const newChildren = curr.children
        .map(filterNode)
        .filter(Boolean);
      return { ...curr, children: newChildren };
    }

    return curr;
  }

  return filterNode(node);
}

/**
 * Multi-Aspect Categorization Profiles
 */
export const CATEGORIZATION_PRESETS = [
  {
    id: 'ACADEMIC_PERSONAL',
    name: '🕌 Academic, Medical & Islamic Knowledge (Recommended)',
    description: 'Categorizes links into Islamic Studies, PharmD & Medicine, Digital Skills, Personality Development, Readings & Secular Subjects.',
    rules: [
      {
        name: '🕌 Islamic Studies & Knowledge',
        keywords: ['quran', 'hadith', 'tafsir', 'fiqh', 'seerah', 'islam', 'muslim', 'dua', 'yaqeen', 'seekersguidance', 'bayyinah', 'prophet', 'sunnah', 'tajweed', 'arabic', 'islamic', 'salah', 'khutbah', 'surah'],
        domains: ['quran.com', 'sunnah.com', 'seekersguidance.org', 'yaqeeninstitute.org', 'bayyinah.tv', 'islamqa.info', 'islamweb.net', 'alhudamedia.com', 'quranicaudio.com']
      },
      {
        name: '💊 PharmD Studies & Medicine',
        keywords: ['pharmacy', 'pharmd', 'pharmacology', 'pharmacotherapy', 'drug', 'medicine', 'medical', 'clinical', 'anatomy', 'physiology', 'pathology', 'dose', 'prescription', 'patient', 'health', 'biochemistry', 'pharmaceutics', 'hospital', 'disease', 'diagnosis', 'therapy', 'pharma'],
        domains: ['pubmed.ncbi.nlm.nih.gov', 'ncbi.nlm.nih.gov', 'medscape.com', 'drugs.com', 'rxlist.com', 'osmosis.org', 'accessmedicine.mhmedical.com', 'sciencedirect.com', 'uptodate.com', 'bmj.com', 'thelancet.com', 'who.int']
      },
      {
        name: '💻 Digital Skills & Tech',
        keywords: ['code', 'coding', 'programming', 'developer', 'web dev', 'javascript', 'python', 'react', 'github', 'digital marketing', 'seo', 'graphic design', 'ui', 'ux', 'video editing', 'freelance', 'fiverr', 'upwork', 'skills', 'data science', 'ai', 'coursera', 'udemy', 'freecodecamp'],
        domains: ['github.com', 'coursera.org', 'udemy.com', 'edx.org', 'freecodecamp.org', 'w3schools.com', 'fiverr.com', 'upwork.com', 'behance.net', 'dribbble.com', 'developer.mozilla.org', 'stackoverflow.com']
      },
      {
        name: '🧠 Personality Development & Mindset',
        keywords: ['personality', 'self improvement', 'habit', 'mindset', 'productivity', 'leadership', 'motivation', 'time management', 'mental clarity', 'focus', 'discipline', 'growth', 'communication', 'public speaking', 'book summary', 'stoic', 'psychology', 'mindfulness'],
        domains: ['ted.com', 'blinkist.com', 'shortform.com', 'jamesclear.com', 'fs.blog', 'mindtools.com']
      },
      {
        name: '📚 Readings, Papers & Literature',
        keywords: ['reading', 'article', 'paper', 'journal', 'literature', 'book', 'essay', 'review', 'research', 'thesis', 'publication', 'blog', 'news', 'magazine', 'novel'],
        domains: ['scholar.google.com', 'researchgate.net', 'arxiv.org', 'jstor.org', 'substack.com', 'medium.com', 'wikipedia.org', 'goodreads.com', 'news.ycombinator.com']
      },
      {
        name: '🎓 Other Secular & Academic Subjects',
        keywords: ['secular', 'subject', 'math', 'mathematics', 'physics', 'chemistry', 'biology', 'history', 'economics', 'geography', 'education', 'lecture', 'notes', 'exam', 'algebra', 'calculus', 'science'],
        domains: ['khanacademy.org', 'brilliant.org', 'quizlet.com', 'coursera.org']
      },
      {
        name: '🚀 Daily & Productivity Utilities',
        keywords: ['mail', 'gmail', 'drive', 'calendar', 'notion', 'slack', 'trello', 'figma', 'chatgpt', 'openai', 'claude', 'canva'],
        domains: ['mail.google.com', 'drive.google.com', 'calendar.google.com', 'notion.so', 'chatgpt.com', 'claude.ai', 'canva.com']
      }
    ]
  },
  {
    id: 'TECH_DEV',
    name: '💻 Software & Developer Aspect',
    description: 'Tailored for programmers, software engineers, DevOps, and cloud architects.',
    rules: [
      {
        name: '💻 Frontend & Web Tech',
        keywords: ['react', 'vue', 'angular', 'css', 'html', 'javascript', 'typescript', 'tailwind', 'next.js', 'vite', 'ui', 'component'],
        domains: ['react.dev', 'developer.mozilla.org', 'tailwindcss.com', 'vercel.com']
      },
      {
        name: '⚙️ Backend, APIs & Databases',
        keywords: ['node', 'express', 'python', 'django', 'fastapi', 'postgres', 'sql', 'mongodb', 'graphql', 'api', 'backend', 'java', 'go'],
        domains: ['github.com', 'stackoverflow.com', 'npmjs.com']
      },
      {
        name: '🤖 AI, ML & Data Science',
        keywords: ['ai', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'openai', 'huggingface', 'chatgpt', 'claude', 'data science', 'jupyter'],
        domains: ['huggingface.co', 'chatgpt.com', 'kaggle.com', 'claude.ai']
      },
      {
        name: '🛠️ DevOps, Cloud & Tools',
        keywords: ['aws', 'docker', 'kubernetes', 'linux', 'cloud', 'devops', 'cicd', 'github actions', 'terminal', 'bash'],
        domains: ['aws.amazon.com', 'docker.com']
      }
    ]
  },
  {
    id: 'GENERAL_LIFE',
    name: '🌐 General Life & Business Aspect',
    description: 'Clean general-purpose categorization for work, personal life, media, and shopping.',
    rules: [
      {
        name: '💼 Work & Professional',
        keywords: ['mail', 'calendar', 'drive', 'doc', 'sheet', 'notion', 'slack', 'trello', 'zoom', 'meeting'],
        domains: ['google.com', 'notion.so', 'slack.com', 'zoom.us']
      },
      {
        name: '💰 Finance & Banking',
        keywords: ['bank', 'stripe', 'paypal', 'crypto', 'invest', 'tax', 'finance', 'money', 'budget'],
        domains: ['stripe.com', 'paypal.com', 'coinbase.com']
      },
      {
        name: '🎬 Media & Entertainment',
        keywords: ['youtube', 'netflix', 'spotify', 'twitch', 'movie', 'song', 'music', 'game', 'stream'],
        domains: ['youtube.com', 'netflix.com', 'spotify.com', 'twitch.tv']
      },
      {
        name: '🛒 Shopping & Travel',
        keywords: ['amazon', 'ebay', 'shopping', 'flight', 'hotel', 'airbnb', 'travel', 'store', 'cart'],
        domains: ['amazon.com', 'ebay.com', 'airbnb.com']
      }
    ]
  }
];

/**
 * Natural Language AI Prompt Parser:
 * Converts user prompt instructions into structured category rules.
 * Example prompt: "Group into Islamic Studies, PharmD, Digital Skills, Personality Development, and Readings"
 */
export function parseAiPromptToRules(promptText) {
  if (!promptText || !promptText.trim()) return CATEGORIZATION_PRESETS[0].rules;

  // Clean prompt and extract category targets split by commas, semicolons, 'and', or newlines
  const text = promptText.trim();
  
  // Standard split by punctuation / list patterns
  const rawCategories = text
    .replace(/^categorize into|^organize by|^group into|^organize my bookmarks into|^create folders for/i, '')
    .split(/[,;\n•\*\d+\.\-]| and /i)
    .map(c => c.trim())
    .filter(c => c.length > 1);

  if (rawCategories.length === 0) return CATEGORIZATION_PRESETS[0].rules;

  const generatedRules = rawCategories.map(catName => {
    const cleanName = catName.charAt(0).toUpperCase() + catName.slice(1);
    const lower = cleanName.toLowerCase();
    
    let keywords = [lower];
    let domains = [];

    // Intelligent keyword enrichment based on AI intent recognition
    if (lower.includes('islam') || lower.includes('quran') || lower.includes('religious')) {
      keywords.push('quran', 'hadith', 'tafsir', 'fiqh', 'seerah', 'islam', 'muslim', 'dua', 'yaqeen', 'seekersguidance', 'bayyinah', 'prophet', 'sunnah', 'tajweed');
      domains.push('quran.com', 'sunnah.com', 'seekersguidance.org', 'yaqeeninstitute.org', 'bayyinah.tv');
    }
    if (lower.includes('pharm') || lower.includes('medic') || lower.includes('health') || lower.includes('clinical')) {
      keywords.push('pharmacy', 'pharmd', 'pharmacology', 'pharmacotherapy', 'drug', 'medicine', 'medical', 'clinical', 'anatomy', 'physiology', 'pathology', 'prescription', 'patient');
      domains.push('pubmed.ncbi.nlm.nih.gov', 'ncbi.nlm.nih.gov', 'medscape.com', 'drugs.com', 'osmosis.org');
    }
    if (lower.includes('skill') || lower.includes('tech') || lower.includes('code') || lower.includes('program') || lower.includes('dev')) {
      keywords.push('code', 'coding', 'programming', 'developer', 'web dev', 'javascript', 'python', 'react', 'github', 'digital marketing', 'freelance', 'fiverr', 'upwork');
      domains.push('github.com', 'coursera.org', 'freecodecamp.org', 'udemy.com', 'stackoverflow.com');
    }
    if (lower.includes('personality') || lower.includes('mindset') || lower.includes('habit') || lower.includes('productivity') || lower.includes('growth')) {
      keywords.push('personality', 'self improvement', 'habit', 'mindset', 'productivity', 'leadership', 'motivation', 'time management', 'focus', 'discipline');
      domains.push('ted.com', 'blinkist.com', 'jamesclear.com', 'fs.blog');
    }
    if (lower.includes('read') || lower.includes('paper') || lower.includes('journal') || lower.includes('article') || lower.includes('literature')) {
      keywords.push('reading', 'article', 'paper', 'journal', 'literature', 'book', 'essay', 'research', 'thesis');
      domains.push('scholar.google.com', 'researchgate.net', 'arxiv.org', 'substack.com', 'medium.com');
    }
    if (lower.includes('subject') || lower.includes('secular') || lower.includes('math') || lower.includes('science') || lower.includes('study')) {
      keywords.push('math', 'physics', 'chemistry', 'biology', 'history', 'economics', 'education', 'lecture', 'notes', 'exam', 'secular');
      domains.push('khanacademy.org', 'brilliant.org', 'quizlet.com');
    }
    if (lower.includes('work') || lower.includes('job') || lower.includes('office')) {
      keywords.push('mail', 'drive', 'calendar', 'doc', 'sheet', 'notion', 'slack', 'trello', 'zoom');
      domains.push('google.com', 'notion.so', 'slack.com');
    }
    if (lower.includes('media') || lower.includes('video') || lower.includes('entertainment')) {
      keywords.push('youtube', 'netflix', 'spotify', 'twitch', 'movie', 'music');
      domains.push('youtube.com', 'netflix.com', 'spotify.com');
    }

    return {
      name: cleanName,
      keywords: Array.from(new Set(keywords)),
      domains: Array.from(new Set(domains))
    };
  });

  return generatedRules;
}

/**
 * Categorizes tree using custom generated or chosen rules
 */
export function autoCategorizeWithCustomRules(rootNode, rules) {
  const allBookmarks = flattenBookmarks(rootNode);

  const folderMap = new Map();
  rules.forEach(rule => {
    folderMap.set(rule.name, {
      id: generateId(),
      title: rule.name,
      type: 'folder',
      children: []
    });
  });

  const uncategorizedFolder = {
    id: generateId(),
    title: '📁 Uncategorized',
    type: 'folder',
    children: []
  };

  allBookmarks.forEach(bm => {
    let matched = false;
    const lowerUrl = bm.url.toLowerCase();
    const lowerTitle = bm.title.toLowerCase();

    for (const rule of rules) {
      const matchDomain = rule.domains && rule.domains.some(d => lowerUrl.includes(d));
      const matchKw = rule.keywords && rule.keywords.some(kw => lowerUrl.includes(kw) || lowerTitle.includes(kw));

      if (matchDomain || matchKw) {
        folderMap.get(rule.name).children.push({
          id: bm.id,
          title: bm.title,
          url: bm.url,
          type: 'bookmark',
          addDate: bm.addDate || String(Math.floor(Date.now() / 1000)),
          icon: bm.icon,
          tags: Array.from(new Set([...(bm.tags || []), extractDomainTags(bm.url)[0]]))
        });
        matched = true;
        break;
      }
    }

    if (!matched) {
      uncategorizedFolder.children.push({
        id: bm.id,
        title: bm.title,
        url: bm.url,
        type: 'bookmark',
        addDate: bm.addDate || String(Math.floor(Date.now() / 1000)),
        icon: bm.icon,
        tags: bm.tags || ['uncategorized']
      });
    }
  });

  const newChildren = Array.from(folderMap.values()).filter(f => f.children.length > 0);
  if (uncategorizedFolder.children.length > 0) {
    newChildren.push(uncategorizedFolder);
  }

  return {
    id: rootNode.id || generateId(),
    title: 'Bookmarks Bar',
    type: 'folder',
    children: newChildren
  };
}

export function autoCategorizeTree(rootNode, presetId = 'ACADEMIC_PERSONAL') {
  const activePreset = CATEGORIZATION_PRESETS.find(p => p.id === presetId) || CATEGORIZATION_PRESETS[0];
  return autoCategorizeWithCustomRules(rootNode, activePreset.rules);
}

/**
 * Converts tree back into Chrome-compatible HTML string
 */
export function exportBookmarksToHtml(rootNode) {
  let html = NETSCAPE_HEADER;

  function buildHtml(node, depth = 0) {
    const indent = '    '.repeat(depth);
    let str = '';

    if (node.type === 'folder') {
      if (depth > 0) {
        str += `${indent}<DT><H3 ADD_DATE="${node.addDate || Math.floor(Date.now() / 1000)}">${escapeHtml(node.title)}</H3>\n`;
        str += `${indent}<DL><p>\n`;
      }
      if (node.children) {
        node.children.forEach(child => {
          str += buildHtml(child, depth + 1);
        });
      }
      if (depth > 0) {
        str += `${indent}</DL><p>\n`;
      }
    } else if (node.type === 'bookmark') {
      const iconAttr = node.icon ? ` ICON="${node.icon}"` : '';
      const dateAttr = node.addDate ? ` ADD_DATE="${node.addDate}"` : '';
      str += `${indent}<DT><A HREF="${escapeHtml(node.url)}"${dateAttr}${iconAttr}>${escapeHtml(node.title)}</A>\n`;
    }

    return str;
  }

  html += buildHtml(rootNode, 0);
  html += `</DL><p>\n`;
  return html;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Realistic Sample Bookmarks tailored to the user's interests:
 * - Islamic Studies
 * - PharmD Studies & Medicine
 * - Digital Skills & Tech
 * - Personality Development & Mindset
 * - Readings & Research
 * - Secular & Academic Subjects
 */
export function getSampleBookmarksTree() {
  return {
    id: 'root',
    title: 'Bookmarks Bar',
    type: 'folder',
    children: [
      {
        id: generateId(),
        title: 'Uncategorized Links',
        type: 'folder',
        children: [
          // Islamic Knowledge
          { id: generateId(), title: 'Quran.com – Read, Listen & Learn Quran', url: 'https://quran.com', type: 'bookmark', addDate: '1700000000', tags: ['islamic', 'quran'] },
          { id: generateId(), title: 'Sunnah.com – Sayings and Teachings of Prophet Muhammad ﷺ', url: 'https://sunnah.com', type: 'bookmark', addDate: '1700000100', tags: ['islamic', 'hadith'] },
          { id: generateId(), title: 'Yaqeen Institute for Islamic Research', url: 'https://yaqeeninstitute.org', type: 'bookmark', addDate: '1700000200', tags: ['islamic', 'research'] },
          { id: generateId(), title: 'SeekersGuidance – Global Islamic Seminary', url: 'https://seekersguidance.org', type: 'bookmark', addDate: '1700000300', tags: ['islamic', 'fiqh'] },

          // PharmD & Medicine
          { id: generateId(), title: 'PubMed Central - Medical Literature Database', url: 'https://pubmed.ncbi.nlm.nih.gov', type: 'bookmark', addDate: '1700000400', tags: ['pharmd', 'medicine'] },
          { id: generateId(), title: 'Medscape Pharmacotherapy & Clinical Reference', url: 'https://www.medscape.com', type: 'bookmark', addDate: '1700000500', tags: ['pharmd', 'pharmacology'] },
          { id: generateId(), title: 'Drugs.com – Prescription Drug Information Database', url: 'https://www.drugs.com', type: 'bookmark', addDate: '1700000600', tags: ['pharmd', 'drugs'] },
          { id: generateId(), title: 'Osmosis by Elsevier – Clinical Pharmacy & Medicine', url: 'https://www.osmosis.org', type: 'bookmark', addDate: '1700000700', tags: ['pharmd', 'clinical'] },

          // Digital Skills & Tech
          { id: generateId(), title: 'FreeCodeCamp – Learn Coding & Web Development Skills', url: 'https://www.freecodecamp.org', type: 'bookmark', addDate: '1700000800', tags: ['digital-skills', 'coding'] },
          { id: generateId(), title: 'Coursera – Full Stack Web Dev & AI Specialization', url: 'https://www.coursera.org', type: 'bookmark', addDate: '1700000900', tags: ['digital-skills', 'tech'] },
          { id: generateId(), title: 'GitHub Repository – Modern Software Projects', url: 'https://github.com', type: 'bookmark', addDate: '1700001000', tags: ['tech', 'dev'] },
          { id: generateId(), title: 'GitHub Repository – Main Source', url: 'https://github.com', type: 'bookmark', addDate: '1700001050', tags: ['tech', 'dev'] }, // Duplicate

          // Personality Development & Mindset
          { id: generateId(), title: 'Atomic Habits & Mindset – James Clear', url: 'https://jamesclear.com', type: 'bookmark', addDate: '1700001100', tags: ['personality', 'habits'] },
          { id: generateId(), title: 'Farnam Street (FS) – Mental Models & Decision Making', url: 'https://fs.blog', type: 'bookmark', addDate: '1700001200', tags: ['personality', 'focus'] },
          { id: generateId(), title: 'TED Talks – Ideas Worth Spreading', url: 'https://www.ted.com', type: 'bookmark', addDate: '1700001300', tags: ['personality', 'growth'] },

          // Readings & Literature
          { id: generateId(), title: 'Google Scholar – Academic Papers & Scientific Research', url: 'https://scholar.google.com', type: 'bookmark', addDate: '1700001400', tags: ['readings', 'research'] },
          { id: generateId(), title: 'Medium – In-depth Essays & Tech Articles', url: 'https://medium.com', type: 'bookmark', addDate: '1700001500', tags: ['readings', 'articles'] },
          { id: generateId(), title: 'arXiv Preprint Server – Computer Science & Biology Papers', url: 'https://arxiv.org', type: 'bookmark', addDate: '1700001600', tags: ['readings', 'papers'] },

          // Secular & Other Academic Subjects
          { id: generateId(), title: 'Khan Academy – Mathematics, Organic Chemistry & Physics', url: 'https://www.khanacademy.org', type: 'bookmark', addDate: '1700001700', tags: ['secular', 'math'] },
          { id: generateId(), title: 'Brilliant.org – Interactive Science & Problem Solving', url: 'https://brilliant.org', type: 'bookmark', addDate: '1700001800', tags: ['secular', 'science'] }
        ]
      }
    ]
  };
}
