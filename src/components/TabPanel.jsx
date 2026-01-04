import { useRef, useEffect } from "react";

function TabPanel({ tabs, setTabs, activeTabId, address, setAddress }) {
  const outputRef = useRef(null);

  // Auto-scroll terminal when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [tabs]);

  const handleTerminalCommand = (tabId, cmd) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== tabId) return t;
        const out = [...(t.output || []), { text: `> ${cmd}`, color: "#0f0" }];
        
        // Command Logic
        if (cmd.trim() === "hello") {
          out.push({ text: "Hello, developer!", color: "#ff0" });
        } else {
          out.push({ text: `Unknown command: ${cmd}`, color: "#f00" });
        }
        
        return { ...t, output: out };
      })
    );
  };

  const formatUrl = (input) => {
    return input.startsWith("http") ? input : `https://${input}`;
  };

  return (
    <div className="tab-panel">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        const displayClass = isActive ? "active-view" : "hidden-view";

        // New Tab UI
        if (tab.type === "new") {
          return (
            <div key={tab.id} className={displayClass}>
              <div className="new-tab-center">
                <input
                  className="address-bar-large"
                  placeholder="Where to?"
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

        // Terminal UI
        if (tab.type === "terminal") {
          return (
            <div key={tab.id} className={`terminal-view ${displayClass}`}>
              <div className="terminal-output" ref={outputRef}>
                {tab.output.map((line, i) => (
                  <div key={i} style={{ color: line.color }}>{line.text}</div>
                ))}
              </div>
              <div className="terminal-input-row">
                <span>$</span>
                <input
                  autoFocus={isActive}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
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

      {/* Global Address Bar (visible for browser tabs) */}
      <div className="footer-address-bar">
        <input
          className="address-bar"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              window.baldnet?.navigate(formatUrl(address));
            }
          }}
        />
      </div>
    </div>
  );
}

export default TabPanel;