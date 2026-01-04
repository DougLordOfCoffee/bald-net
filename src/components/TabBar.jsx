import { useState } from "react";

function TabBar({ tabs, setTabs, activeTabId, onActivate, onClose, onAdd }) {
  const [draggingTabId, setDraggingTabId] = useState(null);
  const [editingTabId, setEditingTabId] = useState(null);

  const reorderTabs = (fromId, toId) => {
    if (fromId === toId) return;
    const fromIndex = tabs.findIndex((t) => t.id === fromId);
    const toIndex = tabs.findIndex((t) => t.id === toId);

    const updated = [...tabs];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setTabs(updated);
  };

  return (
    <div className="tab-bar">
      <div className="tabs-container">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${activeTabId === tab.id ? "active" : ""}`}
            draggable
            onDragStart={() => setDraggingTabId(tab.id)}
            onDragOver={(e) => {
              e.preventDefault();
              draggingTabId && draggingTabId !== tab.id && reorderTabs(draggingTabId, tab.id);
            }}
            onDragEnd={() => setDraggingTabId(null)}
            onClick={() => onActivate(tab.id)}
            onDoubleClick={() => setEditingTabId(tab.id)}
          >
            {editingTabId === tab.id ? (
              <input
                className="tab-edit-input"
                value={tab.title}
                autoFocus
                onChange={(e) =>
                  setTabs(tabs.map((t) => (t.id === tab.id ? { ...t, title: e.target.value } : t)))
                }
                onBlur={() => setEditingTabId(null)}
                onKeyDown={(e) => e.key === "Enter" && setEditingTabId(null)}
              />
            ) : (
              <span className="tab-title">{tab.title}</span>
            )}
            
            <span className="close" onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}>
              ×
            </span>
          </div>
        ))}
        
        <div className="tab add" onClick={onAdd}>+</div>

        <div className="tab-tools">
          <button onClick={() => window.baldnet?.back()}>◀</button>
          <button onClick={() => window.baldnet?.forward()}>▶</button>
          <button onClick={() => window.baldnet?.refresh()}>⟳</button>
        </div>
      </div>
    </div>
  );
}

export default TabBar;