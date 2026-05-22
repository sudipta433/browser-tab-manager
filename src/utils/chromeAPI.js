const demoTabs = [
  {
    id: 1,
    title: 'React Docs - Getting Started',
    url: 'https://react.dev/learn',
    favIconUrl: 'https://www.google.com/s2/favicons?domain=react.dev',
  },
  {
    id: 2,
    title: 'GitHub - browser-tab-manager',
    url: 'https://github.com/sudipta433/browser-tab-manager',
    favIconUrl: 'https://www.google.com/s2/favicons?domain=github.com',
  },
  {
    id: 3,
    title: 'Chrome Extensions Documentation',
    url: 'https://developer.chrome.com/docs/extensions',
    favIconUrl: 'https://www.google.com/s2/favicons?domain=developer.chrome.com',
  },
  {
    id: 4,
    title: 'Vite Guide',
    url: 'https://vite.dev/guide/',
    favIconUrl: 'https://www.google.com/s2/favicons?domain=vite.dev',
  },
];

const demoSessionsKey = 'tab-manager-pro-demo-sessions';

export const isChromeExtension = () => {
  const chromeApi = globalThis.chrome;
  return Boolean(chromeApi?.tabs && chromeApi?.storage);
};

const getDemoSessions = () => {
  try {
    return JSON.parse(localStorage.getItem(demoSessionsKey)) || [];
  } catch {
    return [];
  }
};

const setDemoSessions = (sessions) => {
  localStorage.setItem(demoSessionsKey, JSON.stringify(sessions));
};

// Get all open tabs
export const getAllTabs = () => {
  if (!isChromeExtension()) {
    return Promise.resolve(demoTabs);
  }

  return new Promise((resolve) => {
    globalThis.chrome.tabs.query({}, (tabs) => {
      resolve(tabs);
    });
  });
};

// Close a specific tab
export const closeTab = (tabId) => {
  if (!isChromeExtension()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    globalThis.chrome.tabs.remove(tabId, () => {
      resolve();
    });
  });
};

// Switch to a tab
export const switchToTab = (tabId, tabUrl) => {
  if (!isChromeExtension()) {
    if (tabUrl) window.open(tabUrl, '_blank', 'noopener,noreferrer');
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    globalThis.chrome.tabs.update(tabId, { active: true }, () => {
      resolve();
    });
  });
};

// Group tabs by domain
export const groupTabsByDomain = (tabs) => {
  return tabs.reduce((groups, tab) => {
    try {
      const url = new URL(tab.url);
      const domain = url.hostname;
      if (!groups[domain]) {
        groups[domain] = [];
      }
      groups[domain].push(tab);
    } catch {
      if (!groups.Other) groups.Other = [];
      groups.Other.push(tab);
    }
    return groups;
  }, {});
};

// Save session to chrome storage
export const saveSession = (sessionName, tabs) => {
  const newSession = {
    id: Date.now(),
    name: sessionName,
    tabs: tabs.map((t) => ({ url: t.url, title: t.title, favIconUrl: t.favIconUrl })),
    timestamp: Date.now(),
    tabCount: tabs.length,
  };

  if (!isChromeExtension()) {
    const sessions = getDemoSessions();
    setDemoSessions([...sessions, newSession]);
    return Promise.resolve(newSession);
  }

  return new Promise((resolve) => {
    globalThis.chrome.storage.local.get(['sessions'], (result) => {
      const sessions = result.sessions || [];
      sessions.push(newSession);
      globalThis.chrome.storage.local.set({ sessions }, () => {
        resolve(newSession);
      });
    });
  });
};

// Get all saved sessions
export const getSessions = () => {
  if (!isChromeExtension()) {
    return Promise.resolve(getDemoSessions());
  }

  return new Promise((resolve) => {
    globalThis.chrome.storage.local.get(['sessions'], (result) => {
      resolve(result.sessions || []);
    });
  });
};

// Restore a session
export const restoreSession = (session) => {
  if (!isChromeExtension()) {
    session.tabs.forEach((tab) => window.open(tab.url, '_blank', 'noopener,noreferrer'));
    return;
  }

  session.tabs.forEach((tab) => {
    globalThis.chrome.tabs.create({ url: tab.url, active: false });
  });
};

// Delete a session
export const deleteSession = (sessionId) => {
  if (!isChromeExtension()) {
    const filtered = getDemoSessions().filter((s) => s.id !== sessionId);
    setDemoSessions(filtered);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    globalThis.chrome.storage.local.get(['sessions'], (result) => {
      const sessions = result.sessions || [];
      const filtered = sessions.filter((s) => s.id !== sessionId);
      globalThis.chrome.storage.local.set({ sessions: filtered }, () => {
        resolve();
      });
    });
  });
};
