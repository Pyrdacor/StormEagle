import p5, { Image } from "p5";
import { defaultFireDelay, Projectiles, projectileSettings, ProjectileSource, ProjectileType } from "./projectiles";
import { ISprite, Sprite } from "./render/sprite";

export class SpaceShip implements ISprite {
    private readonly _sprite: Sprite;
    private _projectileType: ProjectileType = ProjectileType.Plasma;
    private _lastShootTime = 0;

    constructor(image: Image, private readonly _projectiles: Projectiles) {
        this._sprite = new Sprite(image, 256);
    }

    public draw(p: p5): void {
        this._sprite.draw(p);
    }

    public moveBy(x: number, y: number): void {
        this._sprite.moveBy(x, y);
    }

    public moveTo(x: number, y: number): void {
        this._sprite.moveTo(x, y);
    }

    public shoot(): void {
        const fireDelay = projectileSettings[this._projectileType].fireDelay ?? defaultFireDelay;
        const now = new Date().getTime();

        if (this._lastShootTime + fireDelay > now) {
            return;
        }

        this._lastShootTime = now;
        this._projectiles.spawn(this._projectileType, {
            x: this.x + this.width, // TODO: maybe shoot from cannons and not the nose
            y: this.y + this.height / 2 + 10 // TODO: adjust
        }, ProjectileSource.Player);
    }

    public setProjectileType(projectileType: ProjectileType): void {
        this._projectileType = projectileType;
    }

    public get projectileType(): ProjectileType {
        return this._projectileType;
    }

    public get x(): number {
        return this._sprite.x;
    }

    public get y(): number {
        return this._sprite.y;
    }

    public get width(): number {
        return this._sprite.width;
    }

    public get height(): number {
        return this._sprite.height;
    }
}