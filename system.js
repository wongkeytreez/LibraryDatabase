const { spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");
const sharp = require("sharp");
async function imagesToVideo(jpegBuffers, fps = 2) {
    return new Promise((resolve, reject) => {
        const args = [
            "-f",
            "image2pipe",
            "-framerate",
            String(fps),
            "-i",
            "-",
            "-vf",
            "scale=trunc(iw/2)*2:trunc(ih/2)*2", // <-- make width & height even
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-f",
            "matroska",
            "pipe:1",
        ];

        const ffmpeg = spawn(ffmpegPath, args, {
            stdio: ["pipe", "pipe", "inherit"],
        });

        // Feed all JPEG buffers into stdin
        for (const buf of jpegBuffers) {
            ffmpeg.stdin.write(buf);
        }
        ffmpeg.stdin.end();

        // Collect stdout as the mp4
        const chunks = [];
        ffmpeg.stdout.on("data", (chunk) => chunks.push(chunk));

        ffmpeg.on("close", (code) => {
            if (code === 0) {
                resolve(Buffer.concat(chunks));
            } else {
                reject(new Error("ffmpeg failed with code " + code));
            }
        });
    });
}
async function shrinkToTarget(inputBuffer, targetKB = 3) {
    let quality = 90;

    // read metadata
    const meta = await sharp(inputBuffer).metadata();
    let width = meta.width;
    let height = meta.height;

    // force even dimensions at the start
    width = Math.floor(width / 2) * 2;
    height = Math.floor(height / 2) * 2;

    let outBuffer = inputBuffer;

    while (true) {
        // enforce even dimensions each loop
        width = Math.max(2, Math.floor(width / 2) * 2);
        height = Math.max(2, Math.floor(height / 2) * 2);

        outBuffer = await sharp(inputBuffer)
            .resize(width, height, { fit: "inside" })
            .jpeg({ quality })
            .toBuffer();

        if (
            outBuffer.length <= targetKB * 1024 ||
            (quality <= 20 && width <= 50)
        ) {
            break;
        }

        if (outBuffer.length > targetKB * 1024) {
            if (quality > 20) {
                quality -= 10; // drop quality first
            } else {
                width = Math.round(width * 0.8);
                height = Math.round(height * 0.8);
            }
        }
    }

    return outBuffer;
}

module.exports = { imagesToVideo, shrinkToTarget };
