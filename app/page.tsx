"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import React, { useMemo } from "react";
import { Main } from "../remotion/MyComp/Main";
import {
  CompositionProps,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../types/constants";
import { z } from "zod";
import { Spacing } from "../components/Spacing";
import data from "../public/video2.json";

const container: React.CSSProperties = {
  maxWidth: 768,
  margin: "auto",
  marginBottom: 20,
};

const outer: React.CSSProperties = {
  borderRadius: "var(--geist-border-radius)",
  overflow: "hidden",
  boxShadow: "0 0 200px rgba(0, 0, 0, 0.15)",
  marginBottom: 40,
  marginTop: 60,
};

const player: React.CSSProperties = {
  width: "100%",
};

const Home: NextPage = () => {
  const durationInSeconds = 40;
  const fps = 30;
  const caption = data.words;
  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
    return {
      video: "video2.mp4",
      caption,
      fps,
    };
  }, []);

  return (
    <div>
      <div style={container}>
        <div className="cinematics" style={outer}>
          <Player
            component={Main}
            inputProps={inputProps}
            durationInFrames={fps * durationInSeconds}
            fps={fps}
            compositionHeight={VIDEO_HEIGHT}
            compositionWidth={VIDEO_WIDTH}
            style={player}
            controls
            autoPlay
            loop
          />
        </div>
        {/* <RenderControls
          text={text}
          setText={setText}
          inputProps={inputProps}
        ></RenderControls> */}
        <Spacing></Spacing>
        <Spacing></Spacing>
        <Spacing></Spacing>
        <Spacing></Spacing>
      </div>
    </div>
  );
};

export default Home;
