import { z } from "zod";
import {
  AbsoluteFill,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from "remotion";
import { CompositionProps } from "../../types/constants";
import React, { Fragment, useMemo } from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { none } from "@remotion/transitions/none";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont();

export const Main = ({
  video,
  caption,
  fps,
}: z.infer<typeof CompositionProps>) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const captionToTransition = useMemo(() => {
    const captionNewFormat: {
      captionType: string;
      duration: number;
      durationInFrames: number;
      text: string;
      words: { frame: number; text: string }[];
    }[] = [];
    let runningFrame = 0;
    caption.map((cap, idx) => {
      let tempFrame = runningFrame;
      let newFrame = runningFrame;
      if (idx > 0) {
        const prevCap = caption[idx - 1];
        const duration = cap.startSeconds - prevCap.endSeconds;
        const durationInFrames = Math.ceil(duration * fps);
        captionNewFormat.push({
          captionType: "text",
          duration,
          durationInFrames,
          text: "",
          words: [],
        });
        tempFrame += durationInFrames;
        newFrame += durationInFrames;
      }

      const duration = cap.endSeconds - cap.startSeconds;
      const durationInFrames = Math.ceil(duration * fps);
      const words: { frame: number; text: string }[] = [];

      cap.text.split(" ").map((word) => {
        words.push({
          frame: tempFrame,
          text: word,
        });
        tempFrame +=
          (newFrame + durationInFrames - runningFrame) /
          cap.text.split(" ").length;
      });
      runningFrame += durationInFrames;

      captionNewFormat.push({
        captionType: "text",
        duration,
        durationInFrames,
        text: cap.text,
        words,
      });
    });
    return captionNewFormat;
  }, [caption]);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          fontFamily,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              textAlign: "center",
              position: "absolute",
              bottom: "20%",
              width: "90%",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
            }}
          >
            <TransitionSeries>
              {captionToTransition.map((cap, idx: number) => (
                <Fragment key={idx}>
                  {cap.captionType === "separator" ? (
                    <TransitionSeries.Transition
                      presentation={none()}
                      timing={linearTiming({
                        durationInFrames: cap.durationInFrames,
                      })}
                    />
                  ) : (
                    <TransitionSeries.Sequence
                      durationInFrames={cap.durationInFrames}
                    >
                      <div
                        style={{
                          textAlign: "center",
                          width: "100%",
                        }}
                      >
                        {cap.words.map((word, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: "60px",
                              color: `${frame >= word.frame ? "blue" : "black"}`,
                              fontWeight: "bold",
                            }}
                          >
                            {word.text}{" "}
                          </span>
                        ))}
                      </div>
                    </TransitionSeries.Sequence>
                  )}
                </Fragment>
              ))}
            </TransitionSeries>
          </div>
        </div>
        <Video style={{ height, width }} src={staticFile(video)} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
