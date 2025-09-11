import p5, { Image } from "p5";

export function imageRotated(p: p5, img: Image, x: number, y: number, rotation: number, width?: number, height?: number) {
    const w = width ?? img.width;
    const h = height ?? img.height;
    p.imageMode('center');
    p.push();
    p.translate(x + w / 2, y + h / 2, 0);
    p.rotate(rotation, [1, 0, 0]);
    p.image(img, 0, 0, w, h);
    p.pop();
    p.imageMode('corner');
}