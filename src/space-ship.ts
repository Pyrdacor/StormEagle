import p5, { Image } from "p5";
import { defaultFireDelay, Projectiles, projectileSettings, ProjectileSource, ProjectileType } from "./projectiles";
import { ISprite, Sprite } from "./render/sprite";
import { Rect } from "./render/rect";
import { AlphaBlinkAction, RenderActionState, TintBlinkAction } from "./render/render-action";
import { criticalEnergy, invincibleTime, Player } from "./player";
import { Color } from "./render/color";

// Of the image, not of the sized spaceship!
const collisionAreas: Rect[] = [
    {
        x: 0,
        y: 0,
        width: 562,
        height: 691
    }, {
        x: 562,
        y: 64,
        width: 816,
        height: 501
    },
];

export class SpaceShip implements ISprite {
    private readonly _sprite: Sprite;
    private _collisionAreas: Rect[] = [];
    private _projectileType: ProjectileType = ProjectileType.Plasma;
    private _lastShootTime = 0;
    private _hurtModeActionState: RenderActionState<AlphaBlinkAction>;
    private _criticalEnergyModeActionState: RenderActionState<TintBlinkAction>;
    public visible = true;

    constructor(image: Image, player: Player, private readonly _projectiles: Projectiles) {
        this._sprite = new Sprite(image, 256);
        this._hurtModeActionState = new RenderActionState(this._sprite, () => new AlphaBlinkAction(255, 128, 100));
        this._criticalEnergyModeActionState = new RenderActionState(this._sprite, () => new TintBlinkAction(
            new Color(255, 255, 255),
            new Color(255, 64, 80),
            200
        ));
        this._hurtModeActionState.chainAction(this._criticalEnergyModeActionState, undefined, () => player.energy < criticalEnergy);

        this.updateCollisionAreas();
    }

    public drawNode(p: p5): void {
        if (this.visible) {
            this._sprite.drawNode(p);
        }
    }

    public updateNode(p: p5): void {
        this._hurtModeActionState.update();
        this._sprite.updateNode(p);
    }

    public moveBy(x: number, y: number): void {
        this._sprite.moveBy(x, y);
        this.updateCollisionAreas();
    }

    public moveTo(x: number, y: number): void {
        this._sprite.moveTo(x, y);
        this.updateCollisionAreas();
    }

    public shoot(): void {
        const fireDelay = projectileSettings[this._projectileType].fireDelay ?? defaultFireDelay;
        const now = Date.now();

        if (this._lastShootTime + fireDelay > now) {
            return;
        }

        this._lastShootTime = now;
        this._projectiles.spawn(this, this._projectileType, {
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

    public get area(): Rect {
        return this._sprite.area;
    }

    public get collisionAreas(): Rect[] {
        return this._collisionAreas;
    }

    private updateCollisionAreas(): void {
        const scaling = this._sprite.scaling;
        this._collisionAreas = collisionAreas.map(ca => ({
            x: this.x + ca.x * scaling.width,
            y: this.y + ca.y * scaling.height,
            width: ca.width * scaling.width,
            height: ca.height * scaling.height
        }));
    }

    public enableHurtMode(enable: boolean): void {
        this._criticalEnergyModeActionState.enableAction(false);
        this._hurtModeActionState.enableAction(enable, invincibleTime);
    }

    public enableCriticalEnergyMode(enable: boolean): void {
        if (this._hurtModeActionState.enabled) return;

        this._criticalEnergyModeActionState.enableAction(enable);
    }
}