import p5, { Image } from "p5";
import { Sprite } from "./sprite";

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
        private _repeatCount?: number // inf for unlimited
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
        const frame = this._atlas.get(column * this._frameWidth, row * this._frameHeight, this._frameWidth, this._frameHeight);

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
