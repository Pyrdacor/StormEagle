import p5, { Image } from "p5";
import { Position } from "./render/position";
import { MovingSprite } from "./render/sprite";
import { Size } from "./render/size";
import { Movement, movementLeft, movementRight } from "./movement";
import { isOnScreen } from "./render/utils";
import { DirectionX, DirectionY } from "./render/direction";
import { Enemy } from "./enemies";
import { SpaceShip } from "./space-ship";
import { Animation } from "./render/animation";

export enum ProjectileType {
    Plasma
}

export interface ProjectileSettings {
    /**
     * This just controls if you can hold space to
     * shoot automatically. There is still a delay
     * when projectiles are spawned. Some weak early
     * projectile types need manual single firing.
     */
    allowPermaFire: boolean;
    width: number;
    speed: number;
    damage: number;
    fireDelay?: number;
    movement: [Movement, Movement]; // first: from player, second: from enemy
}

export enum ProjectileSource {
    Player,
    Enemy
}

export type ProjectileCollisionTest = (projectile: Projectile) => void;

export const defaultFireDelay = 250; // ms
const defaultProgression = [movementRight, movementLeft] as [Movement, Movement];

export const projectileSettings: ProjectileSettings[] = [
    // Plasma
    {
        allowPermaFire: false,
        width: 72,
        speed: 16,
        damage: 5,
        movement: defaultProgression,
    }
];

export class Projectile extends MovingSprite {
    constructor(
        private readonly _sourceObject: SpaceShip | Enemy,
        private readonly _type: ProjectileType,
        private readonly _source: ProjectileSource,
        directionX: DirectionX,
        directionY: DirectionY,
        image: Image,
        position: Position,
        size: Size
    ) {
        super(image, position, size, directionX, directionY);
    }

    override draw(p: p5): void {
        // Note: Projectile graphis always point right and/or down.
        this.flipHorizontally = this.directionX === DirectionX.Left;
        this.flipVertically = this.directionY === DirectionY.Up;

        super.draw(p);
    }

    public get type(): ProjectileType {
        return this._type;
    }

    public get source(): ProjectileSource {
        return this._source;
    }

    public get sourceObject(): SpaceShip | Enemy {
        return this._sourceObject;
    }
}

export class Explosions {
    private _explosions: Animation[] = [];

    constructor(private readonly _image: Image) {

    }

    public spawn(position: Position, scale = 1.0): Animation {
        const width = this._image.width * scale;
        const height = this._image.height * scale;

        position.x -= width / 2;
        position.y -= height / 2;

        const explosion = new Animation(this._image, 212, 212, 60, width, height, 7);
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
        this._explosions.forEach(explosion => explosion.draw(p));
    }
}