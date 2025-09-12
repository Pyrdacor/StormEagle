import p5, { Image } from "p5";
import { Position } from "./render/position";
import { MovingSprite } from "./render/sprite";
import { Size } from "./render/size";
import { defaultFireDelay, Projectiles, ProjectileSettings, projectileSettings, ProjectileSource, ProjectileType } from "./projectiles";
import { Movement, movementSineLeft } from "./movement";
import { isOnScreen } from "./render/utils";
import { AI } from "./ai/ai";
import { defaultAI } from "./ai/schemes/default.ai";
import { intersectsWithRect, Rect } from "./render/rect";
import { Explosions } from "./explosions";

export enum EnemyType {
    Spaceship
}

export type EnemyCollisionTest = (enemy: Enemy) => void;

// NOTE: The origin is relative to the enemy area
type ProjectileOriginProvider = (projectileSettings: ProjectileSettings, enemySettings: EnemySettings, height: number) => Position

export interface EnemySettings {
    primaryProjectile?: ProjectileType;
    primaryProjectileOriginProvider?: ProjectileOriginProvider;
    secondaryProjectile?: ProjectileType;
    secondaryProjectileOriginProvider?: ProjectileOriginProvider;
    projectileScale?: number;
    width: number;
    speed: number;
    energy: number;
    shield: number;
    boss?: true;
    touchDamage: number;
    projectileDamageMultiplicator?: number;
    additionalFireDelay?: number;
    movement: Movement;
    ai?: AI;
    // Of the image, not of the sized enemy!
    collisionAreas?: Rect[];
}

export const enemySettings: EnemySettings[] = [
    // Enemy spaceship
    {
        primaryProjectile: ProjectileType.Plasma,
        primaryProjectileOriginProvider: (projectileInfo, settings, height) => ({
            x: -projectileInfo.width * (settings.projectileScale ?? 1) + 20,
            y: height / 2 + 37
        }),
        projectileScale: 0.6,
        width: 160,
        speed: 1,
        energy: 10,
        shield: 0,
        touchDamage: 5,
        projectileDamageMultiplicator: 0.25,
        additionalFireDelay: 1500,
        movement: movementSineLeft(50, 300),
        collisionAreas: [{
            x: 0,
            y: 200,
            width: 748,
            height: 552
        }, {
            x: 748,
            y: 0,
            width: 686,
            height: 752
        }]
    }
];

export class Enemy extends MovingSprite {
    private _primaryWeaponActive = true;
    private _lastShootTimePrimary = 0;
    private _lastShootTimeSecondary = 0;
    private _energy = 0;
    private _shield = 0;

    constructor(
        private readonly _projectiles: Projectiles,
        private readonly _type: EnemyType,
        image: Image,
        position: Position,
        size?: Size
    ) {
        super(image, position, size);

        const settings = enemySettings[_type];
        this._energy = settings.energy;
        this._shield = settings.shield;
    }

    public damage(damage: number): void {
        // TODO: add touch damage for enemies (if so limit only it by time)

        if (damage <= 0) return;

        const shieldDamage = Math.min(damage, this._shield);

        this._shield -= shieldDamage;

        damage -= shieldDamage;

        this._energy -= damage;

        if (this._energy <= 0) {
            this._energy = 0;
        }
    }

    public update(p: p5): void {
        const ai = enemySettings[this._type].ai ?? defaultAI;

        ai.update(p, this);
    }

    public shoot(): boolean {
        if (!this.hasWeapon) return false;

        const settings = enemySettings[this._type];
        const projectileType = this.isPrimaryWeaponActive
            ? settings.primaryProjectile
            : settings.secondaryProjectile;
        const projectileInfo = projectileSettings[projectileType];
        const fireDelay = (projectileInfo.fireDelay ?? defaultFireDelay) +
            settings.additionalFireDelay;
        const now = Date.now();
        const lastShootTime = this.isPrimaryWeaponActive
            ? this._lastShootTimePrimary
            : this._lastShootTimeSecondary;

        if (lastShootTime + fireDelay > now) {
            return false;
        }

        const projectileOrigin = (this.isPrimaryWeaponActive
            ? settings.primaryProjectileOriginProvider?.(projectileInfo, settings, this.height)
            : settings.secondaryProjectileOriginProvider?.(projectileInfo, settings, this.height)) ?? {
            x: -projectileInfo.width * (settings.projectileScale ?? 1),
            y: this.height / 2
        };

        if (this.isPrimaryWeaponActive) {
            this._lastShootTimePrimary = now;
        } else {
            this._lastShootTimeSecondary = now;
        }
        this._projectiles.spawn(this, projectileType, {
            x: this.x + projectileOrigin.x,
            y: this.y + projectileOrigin.y
        }, ProjectileSource.Enemy, undefined, undefined,
            settings.projectileScale);

        return true;
    }

    public selectPrimaryWeapon(): boolean {
        this._primaryWeaponActive = true;
        return this.hasWeapon;
    }

    public selectSecondaryWeapon(): boolean {
        if (this.hasSecondaryWeapon) {
            this._primaryWeaponActive = false;
            return true;
        }

        return false;
    }

    public testCollision(areas: Rect[]): boolean {
        if (areas.length === 0) return false;

        return areas.some(area => {
            const settings = enemySettings[this.type];
            let collisionAreas = [this.area];

            if (settings.collisionAreas && settings.collisionAreas.length > 0) {
                const scaling = this.scaling;
                collisionAreas = settings.collisionAreas.map(ca => ({
                    x: this.x + ca.x * scaling.width,
                    y: this.y + ca.y * scaling.height,
                    width: ca.width * scaling.width,
                    height: ca.height * scaling.height
                }));
            };

            return collisionAreas.some(ca => intersectsWithRect(ca, area));
        });
    }

    public get type(): EnemyType {
        return this._type;
    }

    public get isPrimaryWeaponActive(): boolean {
        return this._primaryWeaponActive;
    }

    public get hasWeapon(): boolean {
        return enemySettings[this._type].primaryProjectile != undefined;
    }

    public get hasSecondaryWeapon(): boolean {
        return enemySettings[this._type].secondaryProjectile != undefined;
    }

    public get canSwitchWeapon(): boolean {
        return (this.isPrimaryWeaponActive && this.hasSecondaryWeapon) ||
            (!this._primaryWeaponActive && this.hasWeapon);
    }

    public get canShoot(): boolean {
        if (!this.hasWeapon) return false;

        const settings = enemySettings[this._type];
        const projectileType = this.isPrimaryWeaponActive
            ? settings.primaryProjectile
            : settings.secondaryProjectile;
        const fireDelay = (projectileSettings[projectileType].fireDelay ?? defaultFireDelay) +
            settings.additionalFireDelay;
        const now = Date.now();
        const lastShootTime = this.isPrimaryWeaponActive
            ? this._lastShootTimePrimary
            : this._lastShootTimeSecondary;

        if (lastShootTime + fireDelay > now) {
            return false;
        }

        return true;
    }

    public get touchDamage(): number {
        return enemySettings[this.type].touchDamage;
    }

    public getProjectileDamage(projectileType: ProjectileType): number {
        const settings = enemySettings[this._type];

        return projectileSettings[projectileType].damage * (settings.projectileDamageMultiplicator ?? 1);
    }

    public get energy(): number {
        return this._energy;
    }

    public get shield(): number {
        return this._shield;
    }
}

export class Enemies {
    private _enemies: Enemy[] = [];

    constructor(
        private readonly _images: Map<EnemyType, Image>,
        private readonly _projectiles: Projectiles,
        private readonly _explosions: Explosions
    ) {

    }

    public getEnemySize(type: EnemyType): Size {
        const image = this._images.get(type);
        const width = enemySettings[type].width;
        const height = image.height * width / image.width;

        return { width, height };
    }

    public getEnemies(filter?: (enemy: Enemy) => boolean): Enemy[] {
        if (!filter) return [...this._enemies];

        return this._enemies.filter(filter);
    }

    public spawn(type: EnemyType, position: Position): Enemy {
        const image = this._images.get(type);
        const width = enemySettings[type].width;
        const height = image.height * width / image.width;

        position.y -= height / 2;

        const enemy = new Enemy(this._projectiles, type, image, position, { width, height });

        this._enemies.push(enemy);

        return enemy;
    }

    public update(p: p5, testCollision: EnemyCollisionTest): void {
        const enemiesToRemove = new Set<number>();

        this._enemies.forEach((enemy, index) => {
            if (enemy.energy <= 0) {
                // Died
                const area = enemy.area;
                this._explosions.spawn({ x: area.x + area.width / 2, y: area.y + area.height / 2 }, 0.25);
                enemiesToRemove.add(index);
                return;
            }

            enemy.update(p);

            testCollision(enemy);

            if (!isOnScreen(p, enemy.area)) {
                enemiesToRemove.add(index);
            }
        });

        if (enemiesToRemove.size > 0) {
            this._enemies = this._enemies.filter((_, index) => !enemiesToRemove.has(index));
        }
    }

    public draw(p: p5): void {
        this._enemies.forEach(projectile => projectile.draw(p));
    }
}