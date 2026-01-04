const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("baldnet", {
  newTab: (id, url) => ipcRenderer.send("new-tab", id, url),
  activateTab: (id) => ipcRenderer.send("activate-tab", id),
  closeTab: (id) => ipcRenderer.send("close-tab", id),
  refresh: () => ipcRenderer.send("refresh-tab")
});
