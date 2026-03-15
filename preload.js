const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    platform: process.platform,
    openFolder: () => ipcRenderer.invoke("open-folder"),
});