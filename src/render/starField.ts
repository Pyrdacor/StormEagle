import { Position } from "./position";
import { Color } from "./color";
import p5 from "p5";

interface Star {
    position: Position;
    size: number;
}

export class StarField {
    private _starColor: Color = new Color(255, 255, 255);
    private readonly _stars: Star[] = [];
    private readonly _freeStarIndices = new Set<number>();

    constructor(
        private readonly _width: number,
        private readonly _height: number,
        starCount: number,
        baseStarSize: number
    ) {
        this.spawnStars(starCount, baseStarSize);
    }

    public update(moveSpeed: number) {
        this._stars.forEach((star, index) => {
            if (this._freeStarIndices.has(index)) {
                this._freeStarIndices.delete(index);
                this.respawn(this._stars[index]);
            } else {
                star.position.x -= moveSpeed;

                if (star.position.x + star.size / 2 <= 0) {
                    this._freeStarIndices.add(index);
                }
            }
        });
    }

    public draw(p: p5): void {
        const col = this._starColor;
        p.fill(col.r, col.g, col.b, col.a);
        p.stroke(col.r, col.g, col.b, col.a / 4);
        this._stars.forEach(star => this.drawStar(p, star));
    }

    private drawStar(p: p5, star: Star): void {
        p.circle(star.position.x, star.position.y, star.size);
    }

    private spawnStars(count: number, baseStarSize: number): void {
        for (let i = 0; i < count; i++) {
            const star = {
                position: {
                    x: Math.random() * this._width,
                    y: Math.random() * this._height,
                },
                size: baseStarSize / 2 + Math.random() * baseStarSize
            };

            this._stars.push(star);
        }
    }

    private respawn(star: Star): void {
        star.position.x = this._width + Math.random() * this._width / 4;
        star.position.y = Math.random() * this._height;
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }
}