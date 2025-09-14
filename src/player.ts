export const invincibleTime = 2000;

export class Player {
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

    public get damageMultiplicator(): number {
        return this._damageMultiplicator;
    }

    public get invincible(): boolean {
        return Date.now() - this._lastHurtTime < invincibleTime;
    }
}