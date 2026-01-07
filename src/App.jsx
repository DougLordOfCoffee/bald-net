import { useState, useEffect, useRef } from "react";
import TabBar from "./components/TabBar.jsx";
import TabPanel from "./components/TabPanel";
import SystemBar from "./components/SystemBar.jsx";

const STORAGE_KEY = "baldnet-tabs";
const ACTIVE_KEY = "baldnet-active";

const INITIAL_TABS = [
  { id: "dome", title: "The Dome", type: "browser", url: "https://the-bald-chat.web.app" },
  { id: "astrominer", title: "Astro-Miner", type: "browser", url: "https://randydomke.github.io/Astrominer" },
  { id: "terminal", title: "Terminal", type: "terminal", output: [] },
];

function App() {
  const [tabs, setTabs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_TABS;
  });

  const [activeTabId, setActiveTabId] = useState(
    () => localStorage.getItem(ACTIVE_KEY) || tabs[0]?.id
  );
  
  const [address, setAddress] = useState("");
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem("baldnet-bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  // Create BrowserViews for initial browser tabs and activate the current tab
  useEffect(() => {
    // First create all browser views
    tabs.forEach(tab => {
      if (tab.type === "browser" && tab.url) {
        window.baldnet?.newTab(tab.id, tab.url);
      }
    });
    
    // Then activate the current tab
    if (activeTabId) {
      const currentTab = tabs.find(t => t.id === activeTabId);
      if (currentTab) {
        handleActivateTab(activeTabId);
      } else if (tabs.length > 0) {
        // If active tab doesn't exist, activate the first tab
        handleActivateTab(tabs[0].id);
      }
    }
  }, []); // Only run once on mount

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+T: New tab
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        handleAddTab();
      }
      
      // Ctrl+W: Close current tab
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        const currentTab = tabs.find(t => t.id === activeTabId);
        if (currentTab && tabs.length > 1) {
          handleCloseTab(activeTabId);
        }
      }
      
      // Ctrl+Tab: Next tab
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const nextIndex = (currentIndex + 1) % tabs.length;
        handleActivateTab(tabs[nextIndex].id);
      }
      
      // Ctrl+Shift+Tab: Previous tab
      if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        handleActivateTab(tabs[prevIndex].id);
      }
      
      // Ctrl+L: Focus address bar
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        // Focus address bar - we'll need to expose this
        document.querySelector('.address-bar')?.focus();
      }
      
      // Ctrl+R: Refresh
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        window.baldnet?.refresh();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId]);

  // Sync Address Bar with Electron events
  useEffect(() => {
    const cleanupUrl = window.baldnet?.onUrlUpdate((id, url) => {
      if (id === activeTabId) setAddress(url);
    });
    const cleanupTitle = window.baldnet?.onTitleUpdate((id, title) => {
      setTabs(prev => prev.map(t => t.id === id ? { ...t, title } : t));
    });
    const cleanupFavicon = window.baldnet?.onFaviconUpdate((id, faviconUrl) => {
      setTabs(prev => prev.map(t => t.id === id ? { ...t, favicon: faviconUrl } : t));
    });

    return () => {
      cleanupUrl?.();
      cleanupTitle?.();
      cleanupFavicon?.();
    };
  }, [activeTabId]);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    localStorage.setItem(ACTIVE_KEY, activeTabId);
    localStorage.setItem("baldnet-bookmarks", JSON.stringify(bookmarks));
  }, [tabs, activeTabId, bookmarks]);

  const handleActivateTab = (id) => {
    setActiveTabId(id);
    const tab = tabs.find(t => t.id === id);
    if (tab?.type === "browser") {
      window.baldnet?.activateTab(id);
      // Immediately set address from tab data for instant display
      if (tab.url) {
        setAddress(tab.url);
      }
    } else {
      window.baldnet?.hideDisplays();
      setAddress(""); // Clear address for non-browser tabs
    }
  };

  const handleCloseTab = (id) => {
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    window.baldnet?.closeTab(id);
    if (activeTabId === id && remaining.length) {
      handleActivateTab(remaining[0].id);
    }
  };

  const handleAddTab = (customId, customTitle, customUrl) => {
    const id = customId || `tab-${Date.now()}`;
    const title = customTitle || "New Tab";
    const type = customUrl ? "browser" : "new";
    const url = customUrl || undefined;
    
    setTabs([...tabs, { id, title, type, url }]);
    handleActivateTab(id);
    
    if (customUrl) {
      window.baldnet?.newTab(id, customUrl);
    }
  };

  const handleAddBookmark = (url) => {
    if (!url) return;
    
    // Extract title from current tab
    const currentTab = tabs.find(t => t.id === activeTabId);
    const title = currentTab?.title || url;
    
    // Check if already bookmarked
    const existing = bookmarks.find(b => b.url === url);
    if (existing) return;
    
    // Generate icon based on domain
    const domain = new URL(url).hostname;
    let icon = "⭐";
    if (domain.includes("github")) icon = "🐙";
    else if (domain.includes("youtube")) icon = "📺";
    else if (domain.includes("chat")) icon = "💬";
    else if (domain.includes("miner") || domain.includes("astro")) icon = "🚀";
    
    const newBookmark = {
      id: `bookmark-${Date.now()}`,
      title: title.length > 10 ? title.substring(0, 10) + "..." : title,
      url,
      icon
    };
    
    setBookmarks([...bookmarks, newBookmark]);
  };

  return (
    <div className="baldnet">
      <TabBar 
        tabs={tabs} 
        setTabs={setTabs}
        activeTabId={activeTabId} 
        onActivate={handleActivateTab} 
        onClose={handleCloseTab}
        onAdd={handleAddTab}
      />
      <TabPanel 
        tabs={tabs} 
        setTabs={setTabs}
        activeTabId={activeTabId}
        address={address}
        setAddress={setAddress}
        onAddBookmark={handleAddBookmark}
      />
      <SystemBar 
        activeTabId={activeTabId}
        tabs={tabs}
        onActivateTab={handleActivateTab}
        onAddTab={handleAddTab}
        bookmarks={bookmarks}
      />
    </div>
  );
}

export default App;