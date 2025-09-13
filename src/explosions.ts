import p5, { Image } from "p5";
import { Position } from "./render/position";
import { Animation } from "./render/animation";

export class Explosions {
    private _explosions: Animation[] = [];

    constructor(private readonly _image: Image) {

    }

    public spawn(position: Position, scale = 1.0): Animation {
        const frameCount = 7;
        const width = (this._image.width / frameCount) * scale;
        const height = this._image.height * scale;

        position.x -= width / 2;
        position.y -= height / 2;

        const explosion = new Animation(this._image, 212, 212, 70, width, height, frameCount);
        explosion.moveTo(position.x, position.y);

        this._explosions.push(explosion);

        return explosion;
    }

    public update(p: p5): void {
        const explosionsToRemove = new Set<number>();

        this._explosions.forEach((explosion, index) => {
            explosion.update(p);

            if (explosion.finished) {
                explosionsToRemove.add(index);
            }
        });

        if (explosionsToRemove.size > 0) {
            this._explosions = this._explosions.filter((_, index) => !explosionsToRemove.has(index));
        }
    }

    public draw(p: p5): void {
        this._explosions.forEach(explosion => explosion.drawNode(p));
    }
}