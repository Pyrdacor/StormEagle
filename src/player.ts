import { clampValue } from "./core-utils";

export const invincibleTime = 2000;
export const criticalEnergy = 15;

export class Player {
    private _maxEnergy = 100;
    private _maxShield = 100;
    private _energy = 25;
    private _shield = 0;
    private _damageMultiplicator = 1;

    private _lastHurtTime = 0;

    public damage(damage: number): void {
        if (damage <= 0) return;

        const shieldDamage = Math.min(damage, this._shield);

        this._shield -= shieldDamage;

        damage -= shieldDamage;

        this._energy -= damage;

        if (this._energy <= 0) {
            this._energy = 0;
            this.die();
        } else {
            this._lastHurtTime = Date.now();
        }
    }

    public die(): void {

    }

    public get energy(): number {
        return this._energy;
    }

    public get shield(): number {
        return this._shield;
    }

    public get maxEnergy(): number {
        return this._maxEnergy;
    }

    public get maxShield(): number {
        return this._maxShield;
    }

    public get damageMultiplicator(): number {
        return this._damageMultiplicator;
    }

    public set energy(value: number) {
        this._energy = clampValue(0, value, this._maxEnergy);
    }

    public set shield(value: number) {
        this._shield = clampValue(0, value, this._maxShield);
    }

    public set maxEnergy(value: number) {
        this._maxEnergy = Math.max(100, value);
    }

    public set maxShield(value: number) {
        this._maxShield = Math.max(100, value);
    }

    public set damageMultiplicator(value: number) {
        this._damageMultiplicator = Math.max(0.1, value);
    }

    public get invincible(): boolean {
        return Date.now() - this._lastHurtTime < invincibleTime;
    }
}