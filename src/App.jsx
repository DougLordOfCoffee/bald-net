import { useState, useEffect, useRef } from "react";

function App() {
  const STORAGE_KEY = "baldnet-tabs";
  const outputRef = useRef(null);

  const [tabs, setTabs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : [
          { id: "dome", title: "The Dome", type: "iframe", url: "https://the-bald-chat.web.app" },
          { id: "astrominer", title: "Astro-Miner", type: "iframe", url: "https://randydomke.github.io/Astrominer" },
          { id: "terminal", title: "Terminal", type: "terminal", output: [] },
        ];
  });

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("baldnet-active") || "dome");
  const [editingTabId, setEditingTabId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    localStorage.setItem("baldnet-active", activeTab);
  }, [tabs, activeTab]);

  // Scroll terminal to bottom on update
  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [tabs]);

  // Ctrl+K to open terminal
  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const termTab = tabs.find((t) => t.type === "terminal");
        if (termTab) setActiveTab(termTab.id);
        else {
          const id = `terminal-${Date.now()}`;
          setTabs([...tabs, { id, title: "Terminal", type: "terminal", output: [] }]);
          setActiveTab(id);
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [tabs]);

  const refreshActiveTab = () => {
    setTabs((tabs) =>
      tabs.map((t) =>
        t.id === activeTab ? { ...t, reloadCounter: (t.reloadCounter || 0) + 1 } : t
      )
    );
  };

  const closeTab = (tabId) => {
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId && newTabs.length > 0) setActiveTab(newTabs[0].id);
  };

  const addTab = () => {
    const id = `tab-${Date.now()}`;
    setTabs([...tabs, { id, title: "New Tab", type: "new" }]);
    setActiveTab(id);
  };

  const handleCommand = (tabId, cmd) => {
    setTabs((tabs) =>
      tabs.map((t) => {
        if (t.id !== tabId) return t;
        const newOutput = [...(t.output || []), { text: `> ${cmd}`, color: "#0f0" }];
        // Simple demo commands
        if (cmd === "hello") newOutput.push({ text: "Hello, developer!", color: "#ff0" });
        else if (cmd.startsWith("say ")) newOutput.push({ text: cmd.slice(4), color: "#0ff" });
        else newOutput.push({ text: `Unknown command: ${cmd}`, color: "#f00" });
        return { ...t, output: newOutput };
      })
    );
  };

  return (
    <div className="baldnet">
      <div className="tab-bar">
        <div className="tabs-container">
          {tabs.map((tab) => {
            const isEditing = tab.id === editingTabId;
            return (
              <div
                key={tab.id}
                className={`tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                onDoubleClick={() => setEditingTabId(tab.id)}
              >
                {isEditing ? (
                  <input
                    className="tab-edit-input"
                    value={tab.title}
                    onChange={(e) =>
                      setTabs(tabs.map((t) => (t.id === tab.id ? { ...t, title: e.target.value } : t)))
                    }
                    onBlur={() => setEditingTabId(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setEditingTabId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  tab.title
                )}

                <span
                  className="close"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  X
                </span>
              </div>
            );
          })}
          <div className="tab add" onClick={addTab}>
            +
          </div>
        </div>

        {/* Toolbox */}
        <div className="tab-tools">
          <button className="refresh-btn" onClick={refreshActiveTab}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="tab-panel">
        {tabs.map((tab) => {
          if (tab.type === "iframe") {
            return (
              <iframe
                key={`${tab.id}-${tab.reloadCounter || 0}`}
                src={tab.url}
                className={`iframe-app ${activeTab === tab.id ? "active" : "hidden"}`}
                sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                allow="fullscreen; gamepad; autoplay"
              />
            );
          }

          if (tab.type === "new") {
            return (
              <div key={tab.id} className={`new-tab ${activeTab === tab.id ? "active" : "hidden"}`}>
                <input
                  className="address-bar"
                  placeholder="Enter a URL..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const url = e.target.value.startsWith("http") ? e.target.value : `https://${e.target.value}`;
                      setTabs(tabs.map((t) => (t.id === tab.id ? { ...t, type: "iframe", url, title: url } : t)));
                    }
                  }}
                />
              </div>
            );
          }

          if (tab.type === "terminal") {
            return (
              <div key={tab.id} className={`terminal-tab ${activeTab === tab.id ? "active" : "hidden"}`}>
                <div className="terminal-output" ref={outputRef}>
                  {tab.output.map((line, i) => (
                    <div key={i} style={{ color: line.color || "#fff" }}>
                      {line.text}
                    </div>
                  ))}
                </div>
                <input
                  className="terminal-input"
                  placeholder="Enter command..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const cmd = e.target.value.trim();
                      e.target.value = "";
                      handleCommand(tab.id, cmd);
                    }
                  }}
                />
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

export default App;
