import { Position } from "./render/position";

const TWO_PI = 2 * Math.PI;

export type Movement = (lastPositions: [Position, Position], startPosition: Position, speed: number) => Position;

export const movementNone: Movement = ([_, { x, y }]) => ({ x, y });
export const movementBobbing = (amplitude: number): Movement => ([{ x: _, y: ay }, { x: __, y: by }], { x, y: sy }, speed) => {
    let up = by < ay;
    const min = sy - amplitude;
    const max = sy + amplitude;

    if (up && by <= min) {
        up = false;
    } else if (!up && by >= max) {
        up = true;
    }

    if (up) {
        let newY = by - speed;

        if (newY < min) {
            newY = min;
        }

        return {
            x,
            y: newY
        };
    } else {
        let newY = by + speed;

        if (newY > max) {
            newY = max;
        }

        return {
            x,
            y: newY
        };
    }
};
export const movementRight: Movement = ([_, b], __, speed) => ({ x: b.x + speed, y: b.y });
export const movementLeft: Movement = ([_, b], __, speed) => ({ x: b.x - speed, y: b.y });
export const movementSineRight = (amplitude: number, waveLength: number): Movement => ([a, b], s, speed) => ({
    x: b.x + speed, y: s.y - amplitude * Math.sin(TWO_PI * (b.x - s.x + speed) / waveLength)
});
export const movementSineLeft = (amplitude: number, waveLength: number): Movement => ([a, b], s, speed) => ({
    x: b.x - speed, y: s.y - amplitude * Math.sin(TWO_PI * (b.x - s.x - speed) / waveLength)
});