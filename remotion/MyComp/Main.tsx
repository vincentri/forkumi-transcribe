import { staticFile, useCurrentFrame, useVideoConfig, Video } from "remotion";
import React, { useMemo } from "react";
import { loadFont } from "@remotion/google-fonts/Montserrat";
const canvas = require("canvas");

const { fontFamily } = loadFont();

// Define types for caption and segment data
interface Word {
  word: string;
  start: number;
  end: number;
}

interface Segment {
  text: string;
  words: Word[];
  start: number;
  end: number;
}

interface MainProps {
  video: string;
  caption: Word[];
  fps: number;
  fontSize: number;
}

export const Main: React.FC<MainProps> = ({
  video,
  caption,
  fps,
  fontSize = 30,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const pauseThreshold = 0.5; // 1 second pause to separate segments
  const maxWidth = 1080; // maximum width for each segment

  // Calculate text width with type annotations
  const calculateTextWidth = (
    text: string,
    fontFamily: string = "Arial"
  ): number => {
    const { createCanvas } = canvas;
    const canvasInstance = createCanvas(1, 1);
    const context = canvasInstance.getContext("2d")!;
    context.font = `${fontSize}px ${fontFamily}`;
    return context.measureText(text).width;
  };

  // Calculate segments and memoize the result
  const calculateSegments = useMemo<Segment[]>(() => {
    const segments: Segment[] = [];
    let currentSegment: Word[] = [];
    let lastEndTime = 0;

    caption.forEach((word) => {
      if (word.start - lastEndTime > pauseThreshold) {
        if (currentSegment.length > 0) {
          const segmentText = currentSegment.map((w) => w.word).join(" ");
          const segmentWidth = calculateTextWidth(segmentText, fontFamily);

          if (segmentWidth > maxWidth) {
            let tempSegment: Word[] = [];
            let tempWidth = 0;

            currentSegment.forEach((w) => {
              const wordWidth = calculateTextWidth(w.word, fontFamily);
              if (tempWidth + wordWidth > maxWidth) {
                segments.push({
                  text: tempSegment.map((w) => w.word).join(" "),
                  words: tempSegment,
                  start: tempSegment[0].start,
                  end: tempSegment[tempSegment.length - 1].end,
                });
                tempSegment = [w];
                tempWidth = wordWidth;
              } else {
                tempSegment.push(w);
                tempWidth += wordWidth;
              }
            });

            if (tempSegment.length > 0) {
              segments.push({
                text: tempSegment.map((w) => w.word).join(" "),
                words: tempSegment,
                start: tempSegment[0].start,
                end: tempSegment[tempSegment.length - 1].end,
              });
            }
          } else {
            segments.push({
              text: segmentText,
              words: currentSegment,
              start: currentSegment[0].start,
              end: currentSegment[currentSegment.length - 1].end,
            });
          }
        }

        currentSegment = [];
      }

      currentSegment.push(word);
      lastEndTime = word.end;
    });

    if (currentSegment.length > 0) {
      const segmentText = currentSegment.map((w) => w.word).join(" ");
      const segmentWidth = calculateTextWidth(segmentText, fontFamily);

      if (segmentWidth > maxWidth) {
        let tempSegment: Word[] = [];
        let tempWidth = 0;

        currentSegment.forEach((w) => {
          const wordWidth = calculateTextWidth(w.word, fontFamily);
          if (tempWidth + wordWidth > maxWidth) {
            segments.push({
              text: tempSegment.map((w) => w.word).join(" "),
              words: tempSegment,
              start: tempSegment[0].start,
              end: tempSegment[tempSegment.length - 1].end,
            });
            tempSegment = [w];
            tempWidth = wordWidth;
          } else {
            tempSegment.push(w);
            tempWidth += wordWidth;
          }
        });

        if (tempSegment.length > 0) {
          segments.push({
            text: tempSegment.map((w) => w.word).join(" "),
            words: tempSegment,
            start: tempSegment[0].start,
            end: tempSegment[tempSegment.length - 1].end,
          });
        }
      } else {
        segments.push({
          text: segmentText,
          words: currentSegment,
          start: currentSegment[0].start,
          end: currentSegment[currentSegment.length - 1].end,
        });
      }
    }

    // Adjust words within segments where start and end times are the same
    const adjustedSegments = segments.map((segment) => {
      const adjustedWords = segment.words.map((word) => {
        if (word.start === word.end) {
          return {
            ...word,
            start: word.start - 0.001,
          };
        }
        return word;
      });

      return {
        ...segment,
        words: adjustedWords,
      };
    });

    return adjustedSegments;
  }, [caption]);

  // Determine current segment based on frame
  const currentSegment = useMemo<Segment | null>(() => {
    const currentTime = frame / fps;
    return (
      calculateSegments.find(
        (s) => s.start <= currentTime && s.end >= currentTime
      ) || null
    );
  }, [frame, fps, calculateSegments]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Video style={{ height, width }} src={staticFile(video)} />
      {currentSegment && (
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "black",
            fontSize,
            fontFamily,
            width: "90%",
            fontWeight: "bold",
          }}
        >
          {currentSegment.words.map((word) => (
            <span
              key={word.start}
              style={{
                color: word.start <= frame / fps ? "blue" : "black",
              }}
            >
              {word.word + " "}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
