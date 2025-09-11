import p5 from "p5";
import { Position, ZeroPosition } from "./position";

export interface IRenderNode {
    draw(p: p5): void;
    moveBy(x: number, y: number): void;
    moveTo(x: number, y: number): void;
    get x(): number;
    get y(): number
}

export abstract class RenderNode implements IRenderNode {
    protected readonly position: Position = ZeroPosition();

    public abstract draw(p: p5): void;

    public moveBy(x: number, y: number): void {
        this.position.x += x;
        this.position.y += y;
    }

    public moveTo(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
    }

    public get x(): number {
        return this.position.x;
    }

    public get y(): number {
        return this.position.y;
    }
}