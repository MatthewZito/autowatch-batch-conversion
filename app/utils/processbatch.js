require ("hazardous");
const _ = require("lodash");
const ffmpeg = require("fluent-ffmpeg");

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

/**
 * @param {Array} videos The current batch of videos to be processed.
 * @param {Object} selectedWindow The given window in which to run processes.
 * @summary Maps batch of videos to metadata probe process so as to be run in parallel. 
 * @description Allocates each item in batch to ffmpeg probe subprocess for metadata harvesting. Each 
 *     subprocess is then wrapped in an unresolved promise. These promises are allocated into an array;
 *     once resolved, the promises' data is broadcast via IPC.
 * NOTE: Parallelism: true, Throttling: true
 */
const processBatchMetadata = (videos, selectedWindow) => {
    const batch = _.map(videos, video => {
        return new Promise((resolve, reject) => {
            ffmpeg.setFfprobePath(ffprobePath);
            ffmpeg.setFfmpegPath(ffmpegPath);
            ffmpeg.ffprobe(video.path, (err, metadata) => {
                resolve({
                    ...video,
                    duration: metadata.format.duration,
                    format: "avi"
                });
            });
        });
    });

    return Promise.all(batch)
        .then((results) => {
            selectedWindow.webContents.send("metadata:complete", results);
        });
}

/**
 * @param {Array} videos The current batch of videos to be processed.
 * @param {Object} selectedWindow The given window in which to run processes.
 * @summary Maps batch of videos to format conversion process in parallel, asynchronously. 
 * @description Allocates each item in batch to ffmpeg conversion subprocess. All subprocesses are
 *     instantiated in parallel, and returned asynchronously by way of ffmeg's `end` evenlistener.
 * NOTE: Parallelism: true, Throttling: false
 */
const processBatchConversion = (videos, selectedWindow) => {
    _.each(videos, video => {
        const outputDir = video.path.split(video.name)[0];
        const outputFileName = video.name.split(".")[0]
        const outputPath = `${outputDir}${outputFileName}.${video.format}`;
        return ffmpeg(video.path)
            .output(outputPath)
            .on("progress", ({ timemark }) => {
                // IPC: stream progress 
                selectedWindow.webContents.send("conversion:progress", { video, timemark });

            })
            .on("end", () => {
                // IPC: send converted file
                selectedWindow.webContents.send("conversion:end", { video, outputPath });
            })
            .run();
    });
}


module.exports = {
    processBatchMetadata,
    processBatchConversion
};