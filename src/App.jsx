import { useState, useEffect, useRef } from "react";

function App() {
  const STORAGE_KEY = "baldnet-tabs";
  const outputRef = useRef(null);
  const [draggingTab, setDraggingTab] = useState(null);

  const [tabs, setTabs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : [
          { id: "dome", title: "The Dome", type: "browser", url: "https://the-bald-chat.web.app" },
          { id: "astrominer", title: "Astro-Miner", type: "browser", url: "https://randydomke.github.io/Astrominer" },
          { id: "terminal", title: "Terminal", type: "terminal", output: [] },
        ];
  });

  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("baldnet-active") || tabs[0]?.id
  );
  const [editingTabId, setEditingTabId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    localStorage.setItem("baldnet-active", activeTab);
  }, [tabs, activeTab]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [tabs]);

  /** ---------- TAB MANAGEMENT ---------- */

  const reorderTabs = (fromId, toId) => {
    if (fromId === toId) return;
    const fromIndex = tabs.findIndex(t => t.id === fromId);
    const toIndex = tabs.findIndex(t => t.id === toId);

    const updated = [...tabs];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setTabs(updated);
  };

  const addTab = () => {
    const id = `tab-${Date.now()}`;
    setTabs([...tabs, { id, title: "New Tab", type: "new" }]);
    setActiveTab(id);
  };

  const closeTab = (tabId) => {
    const remaining = tabs.filter(t => t.id !== tabId);
    setTabs(remaining);
    if (activeTab === tabId && remaining.length) {
      setActiveTab(remaining[0].id);
      window.baldnet?.activateTab(remaining[0].id);
    }
    window.baldnet?.closeTab(tabId);
  };

  const activateTab = (tabId) => {
    setActiveTab(tabId);
    window.baldnet?.activateTab(tabId);
  };

  /** ---------- TERMINAL ---------- */

  const handleCommand = (tabId, cmd) => {
    setTabs(tabs =>
      tabs.map(t => {
        if (t.id !== tabId) return t;
        const out = [...(t.output || []), { text: `> ${cmd}`, color: "#0f0" }];
        if (cmd === "hello") out.push({ text: "Hello, developer!", color: "#ff0" });
        else out.push({ text: `Unknown command: ${cmd}`, color: "#f00" });
        return { ...t, output: out };
      })
    );
  };

  /** ---------- RENDER ---------- */

  return (
    <div className="baldnet">
      <div className="tab-bar">
        <div className="tabs-container">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              draggable
              onDragStart={() => setDraggingTab(tab.id)}
              onDragOver={e => {
                e.preventDefault();
                draggingTab && draggingTab !== tab.id && reorderTabs(draggingTab, tab.id);
              }}
              onDragEnd={() => setDraggingTab(null)}
              onClick={() => activateTab(tab.id)}
              onDoubleClick={() => setEditingTabId(tab.id)}
            >
              {editingTabId === tab.id ? (
                <input
                  value={tab.title}
                  onChange={e =>
                    setTabs(tabs.map(t => t.id === tab.id ? { ...t, title: e.target.value } : t))
                  }
                  onBlur={() => setEditingTabId(null)}
                  onKeyDown={e => e.key === "Enter" && setEditingTabId(null)}
                  autoFocus
                />
              ) : (
                tab.title
              )}
              <span className="close" onClick={e => { e.stopPropagation(); closeTab(tab.id); }}>
                X
              </span>
            </div>
          ))}
          <div className="tab add" onClick={addTab}>+</div>
        </div>
      </div>

      <div className="tab-panel">
        {tabs.map(tab => {
          if (tab.type === "new") {
            return (
              <div key={tab.id} className={activeTab === tab.id ? "active" : "hidden"}>
                <input
                  className="address-bar"
                  placeholder="Enter URL…"
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      const url = e.target.value.startsWith("http")
                        ? e.target.value
                        : `https://${e.target.value}`;
                      setTabs(tabs.map(t =>
                        t.id === tab.id ? { ...t, type: "browser", url, title: url } : t
                      ));
                      window.baldnet?.newTab(tab.id, url);
                    }
                  }}
                />
              </div>
            );
          }

          if (tab.type === "terminal") {
            return (
              <div key={tab.id} className={activeTab === tab.id ? "active" : "hidden"}>
                <div ref={outputRef}>
                  {tab.output.map((l, i) => (
                    <div key={i} style={{ color: l.color }}>{l.text}</div>
                  ))}
                </div>
                <input
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      handleCommand(tab.id, e.target.value);
                      e.target.value = "";
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
