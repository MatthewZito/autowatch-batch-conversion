const electron = require("electron");
const { BrowserWindow, app } = electron;

class MainWindow extends BrowserWindow {
    constructor(config) {
        super(config.windowSettings);
        /* Parent Class Extensions */
        this.loadURL(config.filePath);
    }

}

module.exports = MainWindow