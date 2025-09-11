import p5, { Image } from "p5";
import { Position } from "./render/position";
import { Sprite } from "./render/sprite";
import { Size } from "./render/size";

export enum ProjectileType {
    Plasma
}

export enum ProjectileSource {
    Player,
    Enemy
}

type ProjectileProgression = (lastPositions: [Position, Position], speed: number) => Position;
type ProjectileCollisionTest = (projectile: Projectile) => void;

const projectileSizes: number[] = [
    72
];

const projectileSpeeds: number[] = [
    16
];

const projectileProgressions: ProjectileProgression[] = [
    ([a, b], speed) => ({ x: b.x + speed, y: b.y })
];

export class Projectile extends Sprite {
    private _lastPosition: Position;

    constructor(
        private readonly _type: ProjectileType,
        private readonly _source: ProjectileSource,
        image: Image,
        position: Position,
        size?: Size
    ) {
        super(image, size?.width, size?.height);

        this.moveTo(position.x, position.y);
        this._lastPosition = { x: position.x, y: position.y };
    }

    public override moveBy(x: number, y: number): void {
        this._lastPosition = { x: this.x, y: this.y };
        super.moveBy(x, y);
    }

    public override moveTo(x: number, y: number): void {
        this._lastPosition = { x: this.x, y: this.y };
        super.moveTo(x, y);
    }

    public move(progression: ProjectileProgression): void {
        const newPosition = progression([this._lastPosition, { x: this.x, y: this.y }], projectileSpeeds[this._type]);
        this.moveTo(newPosition.x, newPosition.y);
    }

    public get type(): ProjectileType {
        return this._type;
    }

    public get source(): ProjectileSource {
        return this._source;
    }

    public get lastPosition(): Position {
        return this._lastPosition;
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
    public spawn(type: ProjectileType, position: Position, source: ProjectileSource): Projectile {
        const image = this._images.get(type);
        const width = projectileSizes[type];
        const height = image.height * width / image.width;

        position.y -= height / 2;

        const projectile = new Projectile(type, source, image, position, { width, height });

        this._projectiles.push(projectile);

        return projectile;
    }

    public update(p: p5, testCollision: ProjectileCollisionTest): void {
        const projectilesToRemove = new Set<number>();

        this._projectiles.forEach((projectile, index) => {
            projectile.move(projectileProgressions[projectile.type]);

            testCollision(projectile);

            if (projectile.x >= p.width) {
                projectilesToRemove.add(index);
            }
        });

        if (projectilesToRemove.size > 0) {
            this._projectiles = this._projectiles.filter((_, index) => !projectilesToRemove.has(index));
        }
    }

    public draw(p: p5): void {
        this._projectiles.forEach(projectile => projectile.draw(p));
    }
}