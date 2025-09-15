import p5, { Image } from "p5";
import { Position } from "./render/position";
import { MovingAnimation } from "./render/animation";
import { Size } from "./render/size";
import { Movement, movementSineLeft } from "./movement";
import { isOnScreen } from "./render/utils";

export enum PowerupType {
    Energy,
    Shield,
    Weapon,
    Speed,
    EnergyExtension,
    ShieldExtension,
    DamageMultiplicator,
    Invincibility,
    KillAllEnemies, // no bosses
    ForceField, // push back when shield is on
}

interface PowerupImageInfo {
    atlasY: number;
    frameCount: number;
}

const powerupImageInfos: PowerupImageInfo[] = [
    {
        // Energy
        atlasY: 0,
        frameCount: 4,
    },
    {
        // Shield
        atlasY: 188,
        frameCount: 4,
    },
    {
        // Weapon
        atlasY: 0, // TODO
        frameCount: 0, // TODO
    },
    // TODO ...
];

const powerupMovement: Movement = movementSineLeft(10, 80);
export type PowerupCollisionTest = (powerup: Powerup) => boolean;

export interface PowerupSettings {
    /**
     * Meaning depends on the powerup type.
     * Can be the weapon index, speed/energy/shield increase, etc.
     */
    value: number;
    duration?: number; // optional, if not given the duration is not used or is infinite
}

const powerupSettings: PowerupSettings[] = [
    {
        // Energy
        value: 50,
    },
    {
        // Shield
        value: 50,
    },
    // TODO ...
];

export class Powerup extends MovingAnimation {
    constructor(
        private readonly _type: PowerupType,
        image: Image,
        frameWidth: number,
        frameHeight: number,
        frameTime: number,
        position: Position,
        size: Size
    ) {
        const powerupImageInfo = powerupImageInfos[_type];

        super(image, frameWidth, frameHeight, frameTime, position, size, powerupImageInfo.frameCount, Infinity, { x: 0, y: powerupImageInfo.atlasY });
    }

    public get type(): PowerupType {
        return this._type;
    }

    public get value(): number {
        return powerupSettings[this._type].value;
    }

    public get duration(): number | undefined {
        return powerupSettings[this._type].duration;
    }
}

export class Powerups {
    private _powerups: Powerup[] = [];

    constructor(private readonly _atlas: Image) {

    }

    public spawn(type: PowerupType, position: Position): Powerup {
        const width = 80;
        const height = 80;

        position.x -= width / 2;
        position.y -= height / 2;

        const powerup = new Powerup(type, this._atlas, 188, 188, 50, position, { width, height });
        powerup.moveTo(position.x, position.y);

        this._powerups.push(powerup);

        return powerup;
    }

    public clear(): void {
        this._powerups = [];
    }

    public update(p: p5, testCollision: PowerupCollisionTest): void {
        const powerupsToRemove = new Set<number>();

        this._powerups.forEach((powerup, index) => {
            powerup.update(p);
            powerup.move(powerupMovement, 1.0);

            if (testCollision(powerup) || !isOnScreen(p, powerup.area)) {
                powerupsToRemove.add(index);
            }
        });

        if (powerupsToRemove.size > 0) {
            this._powerups = this._powerups.filter((_, index) => !powerupsToRemove.has(index));
        }
    }

    public draw(p: p5): void {
        this._powerups.forEach(powerup => powerup.drawNode(p));
    }
}