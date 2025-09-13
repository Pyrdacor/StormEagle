import { Position } from "./position";
import { IRenderNode, RenderNode } from "./render-node";
import p5, { Image } from "p5";
import { Size } from "./size";
import { Movement } from "../movement";
import { Rect } from "./rect";
import { DirectionX, DirectionY } from "./direction";

export interface ISprite extends IRenderNode {
    get width(): number;
    get height(): number;
    get area(): Rect;
}

export class Sprite extends RenderNode {
    private readonly _image: Image;
    private _width: number;
    private _height: number;
    protected flipHorizontally = false;
    protected flipVertically = false;

    constructor(image: Image, width?: number, height?: number) {
        super();

        this._image = image;

        this._width = width ?? image.width;

        if (width && !height) {
            const ratio = image.height / image.width;
            this._height = width * ratio;
        } else {
            this._height = height ?? image.height;
        }
    }

    protected override draw(p: p5): void {
        if (this.flipHorizontally || this.flipVertically) {
            p.push();
            const scaleX = this.flipHorizontally ? -1 : 1;
            const scaleY = this.flipVertically ? -1 : 1;
            p.scale(scaleX, scaleY, 0);
            const x = this.flipHorizontally ? -this.x - this.width : this.x;
            const y = this.flipVertically ? -this.y - this.height : this.y;
            p.image(this._image, x, y, this.width, this.height);
            p.pop();
        } else {
            p.image(this._image, this.x, this.y, this.width, this.height);
        }
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public get area(): Rect {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    public get scaling(): Size {
        return {
            width: this.width / this._image.width,
            height: this.height / this._image.height
        };
    }
}

export class MovingSprite extends Sprite {
    private _startPosition: Position;
    private _lastPosition: Position;
    private _directionX = DirectionX.Right;
    private _directionY = DirectionY.Down;

    constructor(
        image: Image,
        position: Position,
        size?: Size,
        directionX = DirectionX.Right,
        directionY = DirectionY.Down
    ) {
        super(image, size?.width, size?.height);

        this.moveTo(position.x, position.y);

        this._startPosition = { x: position.x, y: position.y };
        this._lastPosition = { x: position.x, y: position.y };
        this._directionX = directionX;
        this._directionY = directionY;
    }

    public override moveBy(x: number, y: number): void {
        this._lastPosition = { x: this.x, y: this.y };
        super.moveBy(x, y);

        if (x !== 0) {
            this._directionX = x < 0 ? DirectionX.Left : DirectionX.Right;
        }
        if (y !== 0) {
            this._directionY = y < 0 ? DirectionY.Up : DirectionY.Down;
        }
    }

    public override moveTo(x: number, y: number): void {
        this._lastPosition = { x: this.x, y: this.y };
        super.moveTo(x, y);

        const diffX = x - this._lastPosition.x;
        const diffY = y - this._lastPosition.y;

        if (diffX !== 0) {
            this._directionX = diffX < 0 ? DirectionX.Left : DirectionX.Right;
        }
        if (diffY !== 0) {
            this._directionY = diffY < 0 ? DirectionY.Up : DirectionY.Down;
        }
    }

    public move(movement: Movement, speed: number): void {
        const newPosition = movement([this._lastPosition, { x: this.x, y: this.y }], this._startPosition, speed);

        this.moveTo(newPosition.x, newPosition.y);
    }

    public get lastPosition(): Position {
        return this._lastPosition;
    }

    public get directionX(): DirectionX {
        return this._directionX;
    }

    public get directionY(): DirectionY {
        return this._directionY;
    }
}