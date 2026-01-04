const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("baldnet", {
  newTab: (url) => ipcRenderer.send("new-tab", url),
});
