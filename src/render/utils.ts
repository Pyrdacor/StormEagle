import p5, { Image } from "p5";
import { intersectsWithRect, Rect } from "./rect";
import { Position } from "./position";
import { Color } from "./color";

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

export function isOnScreen(p: p5, rect: Rect): boolean {
    const screenArea: Rect = {
        x: 0,
        y: 0,
        width: p.width,
        height: p.height
    };

    return intersectsWithRect(screenArea, rect);
}

export function fill(p: p5, color: Color, treatZeroAlphaAsNoFill = false): void {
    if (!treatZeroAlphaAsNoFill || color.a !== 0) {
        p.fill(color.r, color.g, color.b, color.a);
    } else {
        p.noFill();
    }
}

export function stroke(p: p5, color: Color, treatZeroAlphaAsNoStroke = false): void {
    if (!treatZeroAlphaAsNoStroke || color.a !== 0) {
        p.stroke(color.r, color.g, color.b, color.a);
    } else {
        p.noStroke();
    }
}

export function tint(p: p5, color: Color, treatZeroAlphaAsNoTint = false): void {
    if (!treatZeroAlphaAsNoTint || color.a !== 0) {
        p.tint(color.r, color.g, color.b, color.a);
    } else {
        p.noTint();
    }
}

export function drawText(p: p5, position: Position, text: string | number, fillColor: Color, strokeColor?: Color, strokeWeight?: number): void {
    fill(p, fillColor, true);

    if (strokeColor) {
        stroke(p, strokeColor, true);
    }

    if (strokeWeight != undefined) {
        p.strokeWeight(strokeWeight);
    }

    const boundsSize = p.textBounds(text.toString(), 0, 0, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER) as { w: number, h: number };
    const x = position.x - boundsSize.w / 2;
    const y = position.y - boundsSize.h / 2;

    p.text(text, x, y, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
}