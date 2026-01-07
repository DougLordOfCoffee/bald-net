import { useRef, useEffect } from "react";
import { processCommand } from "../logic/terminalCommands";

function TabPanel({ tabs, setTabs, activeTabId, address, setAddress }) {
  const outputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [tabs]);

  const handleTerminalCommand = (tabId, cmd) => {
    if (!cmd.trim()) return;
    
    const result = processCommand(cmd, tabs, activeTabId);

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== tabId) return t;

        const inputLine = { text: `> ${cmd}`, color: "#0f0" };
        let newOutput = [...(t.output || []), inputLine];

        if (result.action === "CLEAR_OUTPUT") {
          newOutput = [];
        } else if (result.action === "APPEND_OUTPUT") {
          newOutput = [...newOutput, ...result.data];
        }

        return { ...t, output: newOutput };
      })
    );
  };

  const formatUrl = (input) => input.startsWith("http") ? input : `https://${input}`;

  const getProtocolColor = (url) => {
    if (!url) return "#666";
    return url.startsWith("https://") ? "#0f0" : "#ff0";
  };

  return (
    <div className="tab-panel">
      {/* Top Address Bar Row */}
      <div className="header-address-bar">
        <div className="protocol-indicator" style={{ color: getProtocolColor(address) }}>
          {address ? (address.startsWith("https://") ? "🔒" : "⚠️") : ""}
        </div>
        <input
          className="address-bar"
          placeholder="Current URLs appear here."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              window.baldnet?.navigate(formatUrl(address));
            }
          }}
        />
      </div>

      <div className="view-container">
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          const displayClass = isActive ? "active-view" : "hidden-view";

          if (tab.type === "new") {
            return (
              <div key={tab.id} className={displayClass}>
                <div className="new-tab-center">
                  <input
                    className="address-bar-large"
                    placeholder="Enter URL..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const url = formatUrl(e.target.value);
                        setTabs(tabs.map(t => t.id === tab.id ? { ...t, type: "browser", url, title: url } : t));
                        window.baldnet?.newTab(tab.id, url);
                      }
                    }}
                  />
                </div>
              </div>
            );
          }

          if (tab.type === "terminal") {
            return (
              <div key={tab.id} className={`terminal-view ${displayClass}`}>
                <div className="scanlines"></div>
                <div className="terminal-output" ref={outputRef}>
                  {tab.output.map((line, i) => (
                    <div key={i} style={{ color: line.color }}>{line.text}</div>
                  ))}
                </div>
                <div className="terminal-input-row">
                  <span>&gt;</span>
                  <input
                    autoFocus={isActive}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleTerminalCommand(tab.id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default TabPanel;