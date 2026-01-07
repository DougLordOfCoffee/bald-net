import { useState, useEffect } from "react";

function SystemBar({ activeTabId, tabs, onActivateTab, onAddTab, bookmarks = [], onAddBookmark }) {
  const [connectionStatus, setConnectionStatus] = useState("online");
  const [isSecure, setIsSecure] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);

  const DEFAULT_BOOKMARKS = [
    { id: "dome", title: "Dome", url: "https://the-bald-chat.web.app", icon: "💬" },
    { id: "astrominer", title: "Astro", url: "https://randydomke.github.io/Astrominer", icon: "🚀" },
  ];

  const allBookmarks = [...DEFAULT_BOOKMARKS, ...bookmarks];

  const handleBookmarkClick = (bookmark) => {
    // Check if tab is already open
    const existingTab = tabs.find(t => t.url === bookmark.url);
    if (existingTab) {
      onActivateTab(existingTab.id);
    } else {
      // Create new tab
      const tabId = `bookmark-${bookmark.id}-${Date.now()}`;
      onAddTab(tabId, bookmark.title, bookmark.url);
    }
  };

  useEffect(() => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab?.type === "browser") {
      setIsSecure(activeTab.url?.startsWith("https://"));
    } else {
      setIsSecure(false);
    }
  }, [activeTabId, tabs]);

  // Battery status
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);
        };
        
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
        
        return () => {
          battery.removeEventListener('levelchange', updateBattery);
          battery.removeEventListener('chargingchange', updateBattery);
        };
      });
    }
  }, []);

  // Listen for connection status updates from Electron
  useEffect(() => {
    const cleanup = window.baldnet?.onConnectionStatus?.((tabId, status) => {
      if (tabId === activeTabId) {
        setConnectionStatus(status);
      }
    });

    return () => cleanup?.();
  }, [activeTabId]);

  return (
    <div className="system-bar">
      <div className="system-bar-left">
        <div className="bookmarks">
          {allBookmarks.map(bookmark => {
            const isActive = tabs.find(t => t.url === bookmark.url && t.id === activeTabId);
            return (
              <button
                key={bookmark.id}
                className={`bookmark ${isActive ? 'active' : ''}`}
                onClick={() => handleBookmarkClick(bookmark)}
                title={bookmark.title}
              >
                {bookmark.icon}
              </button>
            );
          })}
        </div>
        <div className={`connection-indicator ${connectionStatus}`}></div>
        <span className="connection-text">
          {connectionStatus === "online" ? "CONNECTED" : 
           connectionStatus === "loading" ? "CONNECTING..." : 
           "DISCONNECTED"}
        </span>
      </div>
      <div className="system-bar-center">
        {isSecure && <span className="security-indicator">🔒 SECURE</span>}
        <div className="battery-indicator">
          {isCharging ? "🔋" : "🔋"} {batteryLevel}%
        </div>
      </div>
      <div className="system-bar-right">
        <span className="system-time">{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

export default SystemBar;