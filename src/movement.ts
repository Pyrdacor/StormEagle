import { Position } from "./render/position";

const TWO_PI = 2 * Math.PI;

export type Movement = (lastPositions: [Position, Position], startPosition: Position, speed: number) => Position;

export const movementNone: Movement = ([_, { x, y }]) => ({ x, y });
export const movementRight: Movement = ([a, b], _, speed) => ({ x: b.x + speed, y: b.y });
export const movementLeft: Movement = ([a, b], _, speed) => ({ x: b.x - speed, y: b.y });
export const movementSineRight = (amplitude: number, waveLength: number): Movement => ([a, b], s, speed) => ({
    x: b.x + speed, y: s.y - amplitude * Math.sin(TWO_PI * (b.x - s.x + speed) / waveLength)
});
export const movementSineLeft = (amplitude: number, waveLength: number): Movement => ([a, b], s, speed) => ({
    x: b.x - speed, y: s.y - amplitude * Math.sin(TWO_PI * (b.x - s.x - speed) / waveLength)
});