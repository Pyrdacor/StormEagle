import { Image } from "p5";

export type ImageLoader = (path: string) => Promise<Image>;
export type SoundLoader = (path: string) => Promise<AudioBuffer>;
