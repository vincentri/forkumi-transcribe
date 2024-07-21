import { Composition, getInputProps, staticFile } from "remotion";
import { Main } from "./MyComp/Main";
import {
  COMP_NAME,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../types/constants";
import { getVideoMetadata } from "@remotion/media-utils";

export const RemotionRoot: React.FC = () => {
  const { width, video, height, fps, caption, fontSize }: Record<string, any> =
    getInputProps();
  const defaultMyCompProps = { video, caption, fps, fontSize };
  return (
    <>
      <Composition
        id={COMP_NAME}
        component={Main}
        fps={fps || VIDEO_FPS}
        width={width || VIDEO_WIDTH}
        height={height || VIDEO_HEIGHT}
        defaultProps={defaultMyCompProps}
        calculateMetadata={async ({ props }) => {
          const data = await getVideoMetadata(staticFile(video));
          return {
            ...props,
            durationInFrames: Math.floor((data?.durationInSeconds || 0) * fps),
          };
        }}
      />
    </>
  );
};
