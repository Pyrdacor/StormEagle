import { Image } from "p5";

export type ImageLoader = (path: string) => Promise<Image>;