const url = require("url");
const path = require("path");

/* Configs */

const config = {
    mainWindowConfig: {
        windowSettings: {
            height: 600,
            width: 800,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                backgroundThrottling: false,
            }
        },
        filePath: process.env.ELECTRON_START_URL || url.format({
            pathname: path.join(__dirname, '../../index.html'),
            protocol: 'file:',
            slashes: true,
          })
    }
}

module.exports = config