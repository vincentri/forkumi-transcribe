import { z } from "zod";
export const COMP_NAME = "MyComp";

export const CompositionProps = z.object({
  video: z.string(),
  fps: z.number(),
  caption: z.array(
    z.object({
      word: z.string(),
      start: z.number(),
      end: z.number(),
    })
  ),
});

export const DURATION_IN_FRAMES = 500;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 30;
