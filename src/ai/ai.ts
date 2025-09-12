import { p5 } from "p5";
import { Enemy } from "../enemies";
import { MovementAI } from "./movement-ai";
import { AttackAI } from "./attack-ai";

export class AI {
    constructor(
        private readonly _movementAI: MovementAI,
        private readonly _attackAI: AttackAI
    ) {

    }

    public update(p: p5, enemy: Enemy): void {
        this._attackAI.update(p, enemy);
        this._movementAI.update(p, enemy);
    }
}