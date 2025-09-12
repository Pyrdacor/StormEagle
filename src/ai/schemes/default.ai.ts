import { p5 } from "p5";
import { Enemy, enemySettings } from "../../enemies";
import { AI } from "../ai";
import { MovementAI } from "../movement-ai";
import { AttackAI } from "../attack-ai";

export class DefaultMovementAI extends MovementAI {
    public override update(p: p5, enemy: Enemy): void {
        // Just move without logic
        const settings = enemySettings[enemy.type];
        enemy.move(settings.movement, settings.speed);
    }
}

export class DefaultAttackAI extends AttackAI {
    public override update(p: p5, enemy: Enemy): void {
        // Just shoot periodically
        if (enemy.canShoot) {
            enemy.shoot();
        }
    }
}

export const defaultAI: AI = new AI(new DefaultMovementAI(), new DefaultAttackAI());