const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("baldnet", {
  newTab: (id, url) => ipcRenderer.send("new-tab", id, url),
  activateTab: (id) => ipcRenderer.send("activate-tab", id),
  closeTab: (id) => ipcRenderer.send("close-tab", id),
  refresh: () => ipcRenderer.send("refresh-tab"),
  hideDisplays: () => ipcRenderer.send("hide-displays"),
  back: () => ipcRenderer.send("nav-back"),
  forward: () => ipcRenderer.send("nav-forward"),
  navigate: (url) => ipcRenderer.send("navigate", url),
  maximize: () => ipcRenderer.send("window-maximize"),
  minimize: () => ipcRenderer.send("window-minimize"),
  onUrlUpdate: (cb) => {
    const handler = (_, id, url) => cb(id, url);
    ipcRenderer.on("url-updated", handler);
    return () => ipcRenderer.removeListener("url-updated", handler);
  },
  onTitleUpdate: (cb) => {
    const handler = (_, id, title) => cb(id, title);
    ipcRenderer.on("title-updated", handler);
    return () => ipcRenderer.removeListener("title-updated", handler);
  },
  onConnectionStatus: (cb) => {
    const handler = (_, id, status) => cb(id, status);
    ipcRenderer.on("connection-status", handler);
    return () => ipcRenderer.removeListener("connection-status", handler);
  },
});