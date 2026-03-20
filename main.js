const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const { startServer, setMusicPath } = require("./server/index"); 

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 800,
        minHeight: 600,
        titleBarStyle: "hiddenInset",
        backgroundColor: "#0f0f0f",
        icon: path.join(__dirname, "icon.ico"),
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
        },
    });

    win.loadFile("index.html");
};

ipcMain.handle("open-folder", async () => {
    const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
    });
    
    if (result.canceled) return [];

    const folderPath = result.filePaths[0];
    setMusicPath(folderPath);  

    const files = fs.readdirSync(folderPath);

    const audioFiles = files
        .filter(file => /\.(mp3|flac|wav|ogg|m4a)$/i.test(file))
        .map(file => ({
            name: file.replace(/\.[^/.]+$/, ""),
            path: `${folderPath}\\${file}`,
        }));

    return audioFiles;
});

app.whenReady().then(() => {
    startServer(""); 
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});