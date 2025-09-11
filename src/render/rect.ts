import { Position } from "./position";
import { Size } from "./size";

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function intersectsWithRect(thisRect: Rect, rect: Rect): boolean {
    return thisRect.x < rect.x + rect.width &&
        thisRect.x + thisRect.width > rect.x &&
        thisRect.y < rect.y + rect.height &&
        thisRect.y + thisRect.height > rect.y;
}

export function containsRect(thisRect: Rect, rect: Rect): boolean {
    return thisRect.x <= rect.x && thisRect.x + thisRect.width >= rect.x + rect.width &&
        thisRect.y <= rect.y && thisRect.y + thisRect.height >= rect.y + rect.height;
}

export function containsPosition(thisRect: Rect, position: Position): boolean {
    return thisRect.x <= position.x && thisRect.x + thisRect.width > position.x &&
        thisRect.y <= position.y && thisRect.y + thisRect.height > position.y;
}

export function getRectPosition(thisRect: Rect): Position {
    return {
        x: thisRect.x,
        y: thisRect.y
    };
}

export function getRectSize(thisRect: Rect): Size {
    return {
        width: thisRect.width,
        height: thisRect.height
    };
}