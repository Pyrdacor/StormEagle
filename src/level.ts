import p5 from "p5";
import { Game } from "./game";
import { Position } from "./render/position";
import { EnemyType } from "./enemies";
import { PowerupType } from "./powerups";

enum LevelEventType {
    SpawnEnemy,
    SpawnPowerup,
    PauseMovement,
    ResumeMovement,
    // TODO: EndLevel, ChangeMusic, ChangeBackground (stars, asteroids, planets, etc)
}

interface LevelEvent {
    type: LevelEventType;
    time: number;
    position?: Position; // Note: Those are between 0 and 1 in terms of the screen width and height!
    value?: number; // enemy, powerup, etc
}

interface Level {
    name: string;
    events: LevelEvent[];
}

function spawnEnemy(time: number, type: EnemyType, position: Position): LevelEvent {
    return {
        type: LevelEventType.SpawnEnemy,
        time,
        position,
        value: type
    };
}

function spawnPowerup(time: number, type: PowerupType, position: Position): LevelEvent {
    return {
        type: LevelEventType.SpawnPowerup,
        time,
        position,
        value: type
    };
}

function pauseMovement(time: number): LevelEvent {
    return {
        type: LevelEventType.PauseMovement,
        time,
    };
}

function resumeMovement(time: number): LevelEvent {
    return {
        type: LevelEventType.ResumeMovement,
        time,
    };
}

function startLevel(level: number): Level {
    const template = levels[level];

    return {
        name: template.name,
        events: [...template.events]
    };
}

function minutes(n: number): number {
    return n * 60 * 1000;
}

function seconds(n: number): number {
    return n * 1000;
}

const levels: Level[] = [
    {
        // Level 0
        name: 'Introduction',
        events: [
            spawnEnemy(seconds(8), EnemyType.Spaceship, { x: 1.0, y: 0.5 }),
            spawnEnemy(seconds(12), EnemyType.Spaceship, { x: 1.0, y: 0.25 }),
            spawnEnemy(seconds(17), EnemyType.Spaceship, { x: 1.0, y: 0.75 }),
            spawnPowerup(seconds(20), PowerupType.Energy, { x: 1.0, y: 0.5 }),
            spawnEnemy(seconds(26), EnemyType.Spaceship, { x: 1.0, y: 0.2 }),
            spawnEnemy(seconds(26), EnemyType.Spaceship, { x: 1.0, y: 0.8 }),
            spawnEnemy(seconds(28), EnemyType.Spaceship, { x: 1.0, y: 0.5 }),
            spawnPowerup(seconds(32), PowerupType.Energy, { x: 1.0, y: 0.75 }),
            spawnEnemy(seconds(39), EnemyType.Spaceship, { x: 1.0, y: 0.2 }),
            spawnEnemy(seconds(39), EnemyType.Spaceship, { x: 1.0, y: 0.8 }),
            spawnEnemy(seconds(40), EnemyType.LargeSpaceship, { x: 1.0, y: 0.5 }),
            spawnEnemy(seconds(52), EnemyType.LargeSpaceship, { x: 1.0, y: 0.25 }),
            spawnEnemy(seconds(52), EnemyType.LargeSpaceship, { x: 1.0, y: 0.75 }),
            spawnPowerup(seconds(58), PowerupType.Shield, { x: 1.0, y: 0.25 }),
            spawnEnemy(seconds(65), EnemyType.Spaceship, { x: 1.0, y: 0.2 }),
            spawnEnemy(seconds(67), EnemyType.Spaceship, { x: 1.0, y: 0.4 }),
            spawnEnemy(seconds(69), EnemyType.Spaceship, { x: 1.0, y: 0.6 }),
            spawnEnemy(seconds(71), EnemyType.Spaceship, { x: 1.0, y: 0.8 }),
            spawnEnemy(seconds(73), EnemyType.Spaceship, { x: 1.0, y: 0.6 }),
            spawnEnemy(seconds(75), EnemyType.Spaceship, { x: 1.0, y: 0.4 }),
            spawnEnemy(seconds(77), EnemyType.Spaceship, { x: 1.0, y: 0.2 }),
            spawnEnemy(seconds(84), EnemyType.LargeSpaceship, { x: 1.0, y: 0.2 }),
            spawnEnemy(seconds(86), EnemyType.LargeSpaceship, { x: 1.0, y: 0.4 }),
            spawnEnemy(seconds(90), EnemyType.Spaceship, { x: 1.0, y: 0.8 }),
            spawnEnemy(seconds(92), EnemyType.Spaceship, { x: 1.0, y: 0.6 }),
            spawnEnemy(seconds(94), EnemyType.Spaceship, { x: 1.0, y: 0.4 }),
            spawnEnemy(seconds(96), EnemyType.Spaceship, { x: 1.0, y: 0.2 }),
            spawnEnemy(seconds(98), EnemyType.Spaceship, { x: 1.0, y: 0.4 }),
            spawnEnemy(seconds(100), EnemyType.Spaceship, { x: 1.0, y: 0.6 }),
            spawnEnemy(seconds(102), EnemyType.Spaceship, { x: 1.0, y: 0.8 }),
            spawnPowerup(seconds(108), PowerupType.Energy, { x: 1.0, y: 0.5 }),
            pauseMovement(seconds(120)),
            spawnEnemy(seconds(128), EnemyType.LargeSpaceship, { x: 1.0, y: 0.2 }),
            spawnEnemy(seconds(128), EnemyType.LargeSpaceship, { x: 1.0, y: 0.4 }),
            spawnEnemy(seconds(128), EnemyType.LargeSpaceship, { x: 1.0, y: 0.6 }),
            spawnEnemy(seconds(128), EnemyType.LargeSpaceship, { x: 1.0, y: 0.8 }),
        ]
    }
];

export class LevelManager {
    private _currentLevel: Level = startLevel(0);
    private _currentLevelStartTime = 0;

    public update(p: p5, game: Game): void {
        const now = Date.now();

        if (this._currentLevelStartTime === 0) {
            this._currentLevelStartTime = now;
        }

        const levelTime = now - this._currentLevelStartTime;
        const eventsToRemove = new Set<number>();
        let index = 0;

        for (const event of this._currentLevel.events) {
            if (event.time <= levelTime) {
                this.executeLevelEvent(p, game, event);
                eventsToRemove.add(index);
            }

            index++;
        }

        this._currentLevel.events = this._currentLevel.events.filter((_, index) => !eventsToRemove.has(index));
    }

    private executeLevelEvent(p: p5, game: Game, event: LevelEvent): void {
        const realPosition = (): Position => ({
            x: event.position.x * p.width,
            y: event.position.y * p.height
        });

        switch (event.type) {
            case LevelEventType.SpawnEnemy:
                game.spawnEnemy(event.value as EnemyType, realPosition());
                break;
            case LevelEventType.SpawnPowerup:
                game.spawnPowerup(event.value as PowerupType, realPosition());
                break;
            case LevelEventType.PauseMovement:
                game.enableBackgroundMovement(false);
                break;
            case LevelEventType.ResumeMovement:
                game.enableBackgroundMovement(true);
                break;
            // TODO ...
        }
    }
}