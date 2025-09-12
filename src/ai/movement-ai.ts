import { p5 } from "p5";
import { Enemy } from "../enemies";

export abstract class MovementAI {
    public abstract update(p: p5, enemy: Enemy): void;
}