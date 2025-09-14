import p5, { Image } from "p5";
import { Position } from "./render/position";
import { MovingSprite } from "./render/sprite";
import { Size } from "./render/size";
import { Movement, movementLeft, movementRight } from "./movement";
import { isOnScreen } from "./render/utils";
import { DirectionX, DirectionY } from "./render/direction";
import { Enemy } from "./enemies";
import { SpaceShip } from "./space-ship";

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

    protected override draw(p: p5): void {
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

export class Projectiles {
    private _projectiles: Projectile[] = [];

    constructor(private readonly _images: Map<ProjectileType, Image>) {

    }

    /**
     * Spawns a new projectile of the given type at the given position.
     * 
     * The x-coordinate is the left side of the projectile.
     * The y-coordinate is the vertical center of the projectile.
     */
    public spawn(sourceObject: SpaceShip | Enemy, type: ProjectileType, position: Position,
        source: ProjectileSource, directionX?: DirectionX, directionY?: DirectionY, scale = 1.0
    ): Projectile {
        const image = this._images.get(type);
        const width = projectileSettings[type].width;
        const height = image.height * width / image.width;

        position.y -= height / 2;

        directionX ??= (source === ProjectileSource.Player ? DirectionX.Right : DirectionX.Left);
        directionY ??= DirectionY.Down;

        const projectile = new Projectile(sourceObject, type, source, directionX, directionY,
            image, position, { width: width * scale, height: height * scale });

        this._projectiles.push(projectile);

        return projectile;
    }

    public clear(): void {
        this._projectiles = [];
    }

    public update(p: p5, testCollision: ProjectileCollisionTest): void {
        const projectilesToRemove = new Set<number>();

        this._projectiles.forEach((projectile, index) => {
            const settings = projectileSettings[projectile.type];
            const movement = settings.movement[projectile.source];
            projectile.move(movement, settings.speed);

            testCollision(projectile);

            if (!isOnScreen(p, projectile.area)) {
                projectilesToRemove.add(index);
            } else {
                projectile.updateNode(p);
            }
        });

        if (projectilesToRemove.size > 0) {
            this._projectiles = this._projectiles.filter((_, index) => !projectilesToRemove.has(index));
        }
    }

    public draw(p: p5): void {
        this._projectiles.forEach(projectile => projectile.drawNode(p));
    }
}