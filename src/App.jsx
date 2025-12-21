import { useState, useRef, useEffect } from "react";
function App() {

    const STORAGE_KEY = "baldnet-tabs";
    const iframeRef = useRef(null);
    const [tabs, setTabs] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved
            ? JSON.parse(saved)
            : [
                {
                    id: "dome",
                    title: "The Dome",
                    type: "iframe",
                    url: "https://the-bald-chat.web.app"
                },
                {
                    id: "astrominer",
                    title: "Astro-Miner",
                    type: "iframe",
                    url: "https://randydomke.github.io/Astrominer"
                }
            ];
    });

    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem("baldnet-active") || "dome";
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
        localStorage.setItem("baldnet-active", activeTab);
    }, [tabs, activeTab]);



    return (
        <div className="baldnet">
            <div className="tab-bar">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.title}
                            <span
                              className="close"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newTabs = tabs.filter(t => t.id !== tab.id);
                                setTabs(newTabs);
                            
                                if (activeTab === tab.id && newTabs.length > 0) {
                                  setActiveTab(newTabs[0].id);
                                }
                              }}
                            >
                              X
                            </span>
                    </div>
                ))}



                <div
                    className="tab add"
                    onClick={() => {
                        const id = `tab-${Date.now()}`;
                        setTabs([
                            ...tabs,
                            { id, title: "New Tab", type: "new" }
                        ]);
                        setActiveTab(id);
                    }}
                >
                    +
                </div>
                <span
                  className="refresh"
                  onClick={(e) => {
                    e.stopPropagation(); // don’t activate tab
                    // Force a re-render of this iframe by changing a "reload" counter
                    setTabs(tabs => 
                      tabs.map(t => t.id === tab.id
                        ? { ...t, reloadCounter: (t.reloadCounter || 0) + 1 }
                        : t
                      )
                    );
                  }}
                >
                  🔄
                </span>

            </div>

            <div className="tab-panel">
                {tabs.map(tab => {
                    if (tab.type === "iframe") {
                        return (
                            <iframe
                              key={`${tab.id}-${tab.reloadCounter || 0}`} // changing key forces React to reload iframe
                              src={tab.url}
                              className={`iframe-app ${activeTab === tab.id ? "active" : "hidden"}`}
                              sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                              allow="fullscreen; gamepad; autoplay"
                            />

                        );
                    }

                    if (tab.type === "new") {
                        return (
                            <div
                                key={tab.id}
                                className={`new-tab ${activeTab === tab.id ? "active" : "hidden"}`}
                            >
                                <input
                                    className="address-bar"
                                    placeholder="Enter a URL..."
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            const url = e.target.value.startsWith("http")
                                                ? e.target.value
                                                : `https://${e.target.value}`;

                                            setTabs(tabs =>
                                                tabs.map(t =>
                                                    t.id === tab.id
                                                        ? { ...t, type: "iframe", url, title: url }
                                                        : t
                                                )
                                            );
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
