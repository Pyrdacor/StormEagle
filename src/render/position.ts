export interface Position {
    x: number;
    y: number;
}

export const invalidCoordinate = Number.NaN;

export function ZeroPosition(): Position {
    return { x: 0, y: 0 };
}


export function addPositions(a: Position, b: Position): Position {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    };
}
