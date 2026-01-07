import { useState, useEffect } from "react";

function SystemBar({ activeTabId, tabs }) {
  const [connectionStatus, setConnectionStatus] = useState("online");
  const [isSecure, setIsSecure] = useState(false);

  useEffect(() => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab?.type === "browser") {
      setIsSecure(activeTab.url?.startsWith("https://"));
    } else {
      setIsSecure(false);
    }
  }, [activeTabId, tabs]);

  // Listen for connection status updates from Electron
  useEffect(() => {
    window.baldnet?.onConnectionStatus?.((tabId, status) => {
      if (tabId === activeTabId) {
        setConnectionStatus(status);
      }
    });
  }, [activeTabId]);

  return (
    <div className="system-bar">
      <div className="system-bar-left">
        <div className={`connection-indicator ${connectionStatus}`}></div>
        <span className="connection-text">
          {connectionStatus === "online" ? "CONNECTED" : 
           connectionStatus === "loading" ? "CONNECTING..." : 
           "DISCONNECTED"}
        </span>
      </div>
      <div className="system-bar-center">
        {isSecure && <span className="security-indicator">🔒 SECURE</span>}
      </div>
      <div className="system-bar-right">
        <span className="system-time">{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

export default SystemBar;