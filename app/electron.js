const electron = require("electron");
const MainWindow = require("./templates/MainWindow.js");
const config = require("./config/window-configurations.js");
const { processBatchMetadata, processBatchConversion } = require("./utils/processbatch.js");
const { app, ipcMain, shell } = electron;

let mainWindow;

function renderPrimaryWindow() {
    mainWindow = new MainWindow(config.mainWindowConfig);
 
    mainWindow.once("ready-to-show", () => mainWindow.show());
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.on("ready", renderPrimaryWindow);

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
  
app.on("activate", function () {
    if (mainWindow === null) {
        renderPrimaryWindow();
    }
});

// process metadata for view whenever new video is added
ipcMain.on("videos:added", (event, videos) => {
    processBatchMetadata(videos, mainWindow);
    
});

ipcMain.on("conversion:init", (event, videos) => {
    processBatchConversion(videos, mainWindow);
});

ipcMain.on("folder:open", (event, outputPath) => {
    shell.showItemInFolder(outputPath);
});
