import p5, { Image } from "p5";
import { Game } from "./game";
import { P5 } from "./constants";

const audioContext = new AudioContext();
const game = new Game(audioContext);

function getCanvasSize(): { width: number; height: number } {
    let width = window.innerWidth;
    let height = window.innerHeight;

    const ratio = 16.0 / 10.0;
    const windowRatio = width / height;

    if (windowRatio > ratio) {
        // wider, add black to the sides
        width = ratio * height;
    } else {
        // higher
        height = width / ratio;
    }

    return { width, height };
}

export function windowResized(p: p5): void {
    const { width, height } = getCanvasSize();

    p.resizeCanvas(width, height, false);
}

export async function setup(p: p5): Promise<void> {
    const { width, height } = getCanvasSize();

    const canvas = p.createCanvas(width, height, P5.P2D, undefined);
    canvas.parent("app");

    p.frameRate(60);
    p.angleMode('degrees');

    // Configuring the canvas
    p.background("black", 255);

    const loadImage = async (path: string): Promise<Image> => {
        return await p.loadImage(path, undefined, (err: unknown) => console.error(`Failed to load image '${path}': ${err}`));
    }

    const loadSound = async (path: string): Promise<AudioBuffer> => {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer, undefined, (err: unknown) => console.error(`Failed to load sound '${path}': ${err}`));
    }

    await game.load(loadImage, loadSound);

    game.setup(p);
}

export function keyPressed(p: p5, event: KeyboardEvent): void {
    game.keyPressed(p, event);
}

export function keyReleased(p: p5): void {
}

export function draw(p: p5): void {
    game.update(p);
    game.render(p);
}
