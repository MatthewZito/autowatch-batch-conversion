import { ADD_VIDEO, ADD_VIDEOS, REMOVE_VIDEO, REMOVE_ALL_VIDEOS, VIDEO_PROGRESS, VIDEO_COMPLETE } from "./types";

/** 
* @summary Unfortunate workaround to prevent node module collisions with webpack. 
* @see https://github.com/electron/electron/issues/7300
* @see https://stackoverflow.com/questions/43966353/electron-angular-fs-existssync-is-not-a-function
*/
const { ipcRenderer } = window.require("electron");

/* Action Handlers */

/**
 * @param {Array} videos The current batch of videos being processed.
 * @summary Listens for probe completion and sends dataful video batch via IPC for processing. 
 */
export const addVideos = videos => dispatch => {
    ipcRenderer.send("videos:added", videos);
    ipcRenderer.on("metadata:complete", (event, datafulVideos) => {
        dispatch({ type: ADD_VIDEOS, payload: datafulVideos });
    });
};

/**
 * @summary Begin video conversion.
 * @description  Instructs main window object to begin conversions; listens to 
 *     main window object for conversion process state.
 */
export const convertVideos = (videos) => (dispatch, getState) => {
    ipcRenderer.send("conversion:init", videos);
    ipcRenderer.on("conversion:end", (event, { video, outputPath }) => {
        dispatch({ type: VIDEO_COMPLETE, payload: { ...video, outputPath } });
    });
    ipcRenderer.on("conversion:progress", (event, { video, timemark }) => {
        dispatch({ type: VIDEO_PROGRESS, payload: { ...video, timemark }});
    });
};

// IPC: open folder wherein new file resides
export const showInFolder = outputPath => dispatch => {
    ipcRenderer.send("folder:open", outputPath);
};

export const addVideo = video => {
    return {
        type: ADD_VIDEO,
        payload: { ...video }
    };
};

export const setFormat = (video, format) => {
    return {
        type: ADD_VIDEO,
        payload: { ...video, format, err: "" }
    };
};

export const removeVideo = video => {
    return {
        type: REMOVE_VIDEO,
        payload: video
    };
};

export const removeAllVideos = () => {
    return {
        type: REMOVE_ALL_VIDEOS
    };
};
