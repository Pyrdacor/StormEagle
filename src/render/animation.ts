import p5, { Image } from "p5";
import { Sprite } from "./sprite";
import { Position, ZeroPosition } from "./position";
import { Size } from "./size";
import { DirectionX, DirectionY } from "./direction";
import { Movement } from "../movement";

export class Animation extends Sprite {
    private readonly _framesPerRow: number;
    private readonly _frameCount: number;
    private _currentFrame = 0;
    private _frameStartTime = 0;
    private _finished = false;

    constructor(
        private readonly _atlas: Image,
        private readonly _frameWidth: number,
        private readonly _frameHeight: number,
        private readonly _frameTime: number,
        width?: number,
        height?: number,
        frameCount?: number,
        private _repeatCount?: number, // use inf for infinite animation
        private readonly _atlasOffset?: Position
    ) {
        super(_atlas, width ?? _frameWidth, height ?? _frameHeight);

        if (_frameWidth <= 0 || _frameHeight <= 0) throw new Error('Invalid frame size');

        if (_atlas.width % _frameWidth !== 0 || _atlas.height % _frameHeight !== 0) console.warn('Frame size not exactly fitting image');

        this._framesPerRow = _atlas.width / _frameWidth;
        const maxFrames = this._framesPerRow * (_atlas.height / _frameHeight);

        if (frameCount == undefined) {
            this._frameCount = maxFrames;
        } else if (frameCount <= 0 || frameCount > maxFrames) {
            throw new Error('Invalid frame count');
        } else {
            this._frameCount = frameCount;
        }
    }

    public get finished(): boolean {
        return this._finished;
    }

    public update(p: p5): void {
        if (this._finished) return;

        if (this._frameStartTime === 0) {
            this._frameStartTime = Date.now();
        } else {
            const now = Date.now();
            let elapsed = now - this._frameStartTime;
            const frameIndex = this._currentFrame;

            while (elapsed >= this._frameTime) {
                elapsed -= this._frameTime;
                this._currentFrame = (this._currentFrame + 1) % this._frameCount;

                if (this._currentFrame < frameIndex) {
                    // Looped
                    if (this._repeatCount == undefined) {
                        this._finished = true;
                        return;
                    } else if (Number.isFinite(this._repeatCount)) {
                        if (--this._repeatCount <= 0) {
                            this._finished = true;
                            return;
                        }
                    }
                }
            }

            this._frameStartTime = now - elapsed;
        }

        super.update(p);
    }

    protected override draw(p: p5): void {
        if (this._finished) return;

        const column = this._currentFrame % this._framesPerRow;
        const row = Math.floor(this._currentFrame / this._framesPerRow);
        const offset = this._atlasOffset ?? ZeroPosition();
        const frame = this._atlas.get(offset.x + column * this._frameWidth, offset.y + row * this._frameHeight, this._frameWidth, this._frameHeight);

        if (this.flipHorizontally || this.flipVertically) {
            p.push();
            const scaleX = this.flipHorizontally ? -1 : 1;
            const scaleY = this.flipVertically ? -1 : 1;
            p.scale(scaleX, scaleY, 0);
            const x = this.flipHorizontally ? -this.x - this.width : this.x;
            const y = this.flipVertically ? -this.y - this.height : this.y;
            p.image(frame, x, y, this.width, this.height);
            p.pop();
        } else {
            p.image(frame, this.x, this.y, this.width, this.height);
        }
    }
}


export class MovingAnimation extends Animation {
    private _startPosition: Position;
    private _lastPosition: Position;
    private _directionX = DirectionX.Right;
    private _directionY = DirectionY.Down;

    constructor(
        atlas: Image,
        frameWidth: number,
        frameHeight: number,
        frameTime: number,
        position: Position,
        size?: Size,
        frameCount?: number,
        repeatCount?: number,
        atlasOffset?: Position,
        directionX = DirectionX.Right,
        directionY = DirectionY.Down
    ) {
        super(atlas, frameWidth, frameHeight, frameTime, size?.width, size?.height, frameCount, repeatCount, atlasOffset);

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