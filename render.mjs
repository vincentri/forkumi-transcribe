import fs from "node:fs";
import {
  renderMedia,
  selectComposition,
  getVideoMetadata,
  extractAudio,
} from "@remotion/renderer";
import { resolve } from "node:path";
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";
import {} from "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAPI_KEY,
});
async function transcribe(soundLocation) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(soundLocation),
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["word"],
  });

  return transcription;
}

const convertAacToMp3 = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec("libmp3lame")
      .audioBitrate(192)
      .toFormat("mp3")
      .on("end", () => {
        console.log("Conversion finished successfully.");
        resolve();
      })
      .on("error", (err) => {
        console.error("Error during conversion:", err);
        reject(err);
      })
      .save(outputPath);
  });
};

const init = async () => {
  // The composition you want to render
  const compositionId = "MyComp";
  const videoName = "video3";
  const videoSource = `/Users/vincent/Bootcamp/code/remotion/public/${videoName}.mp4`;
  const videoMetadata = await getVideoMetadata(videoSource);

  const audioFormat = `/Users/vincent/Bootcamp/code/remotion/public/${videoName}`;
  let audioOutput = resolve(
    process.cwd(),
    `${audioFormat}.${videoMetadata.audioFileExtension}`
  );

  await extractAudio({
    videoSource,
    audioOutput,
  });

  if (["aac"].includes(videoMetadata.audioFileExtension)) {
    await convertAacToMp3(audioOutput, `${audioFormat}.mp3`);
    audioOutput = `${audioFormat}.mp3`;
  }

  const captionSource = `/Users/vincent/Bootcamp/code/remotion/public/${videoName}.json`;
  let caption = "";
  try {
    caption = fs.readFileSync(captionSource, "utf8");
    console.log("Caption exist. Skip generation");
  } catch {
    console.log("Generating caption");
    const transcribeResult = await transcribe(audioOutput);
    fs.writeFileSync(
      captionSource,
      JSON.stringify(transcribeResult, null, 2),
      "utf8"
    );
  }

  try {
    caption = fs.readFileSync(captionSource, "utf8");
  } catch {
    console.log("Please generate the caption first");
    return;
  }

  const inputProps = {
    width: videoMetadata.width,
    height: videoMetadata.height,
    fps: videoMetadata.fps,
    video: `${videoName}.mp4`,
    caption: JSON.parse(caption).words,
    fontSize: 40,
  };

  // Get the composition you want to render. Pass `inputProps` if you
  // want to customize the duration or other metadata.
  const composition = await selectComposition({
    serveUrl: "./build",
    id: compositionId,
    inputProps,
  });

  // Render the video. Pass the same `inputProps` again
  // if your video is parametrized with data.
  let currentProgress = 0;
  await renderMedia({
    composition,
    serveUrl: "./build",
    codec: videoMetadata.codec,
    outputLocation: `out/${videoName}.mp4`,
    inputProps,
    concurrency: 9,
    onProgress: ({ progress }) => {
      const percentage = progress * 100;
      if (percentage == currentProgress) return;
      currentProgress = percentage;
      console.log(`Rendering is ${Math.round(currentProgress)}% complete`);
    },
  });

  console.log("Render done!");
};
init();
