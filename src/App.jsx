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

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    localStorage.setItem(ACTIVE_KEY, activeTabId);
  }, [tabs, activeTabId]);

  // Sync Address Bar with Electron events
  useEffect(() => {
    window.baldnet?.onUrlUpdate((id, url) => {
      if (id === activeTabId) setAddress(url);
    });
    window.baldnet?.onTitleUpdate((id, title) => {
      setTabs(prev => prev.map(t => t.id === id ? { ...t, title } : t));
    });
  }, [activeTabId]);

  const handleActivateTab = (id) => {
    setActiveTabId(id);
    const tab = tabs.find(t => t.id === id);
    if (tab?.type === "browser") {
      window.baldnet?.activateTab(id);
    } else {
      window.baldnet?.hideDisplays();
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

  const handleAddTab = () => {
    const id = `tab-${Date.now()}`;
    setTabs([...tabs, { id, title: "New Tab", type: "new" }]);
    handleActivateTab(id);
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
      />
      <SystemBar 
        activeTabId={activeTabId}
        tabs={tabs}
      />
    </div>
  );
}

export default App;