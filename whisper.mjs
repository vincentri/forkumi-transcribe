import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAPI_KEY,
});

async function main() {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(
      "/Users/vincent/Bootcamp/code/remotion/public/audio.mp3"
    ),
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["word"],
  });

  console.log(transcription);
}
main();
