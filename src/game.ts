import p5, { Image } from "p5";
import { StarField } from "./render/star-field";
import { ImageLoader } from "./misc";
import { AsteroidField } from "./render/asteroid-field";
import { Direction } from "./render/direction";
import { P5 } from './constants';
import { SpaceShip } from "./space-ship";
import { projectileSettings, Projectile, Projectiles, ProjectileType, ProjectileSource } from "./projectiles";
import { Enemies, Enemy, EnemyType } from "./enemies";
import { Player } from "./player";
import { intersectsWithRect } from "./render/rect";
import { Explosions } from "./explosions";

export class Game {
    private readonly _player = new Player();
    private _speed: number = 5;
    private _projectiles: Projectiles | undefined = undefined;
    private _explosions: Explosions | undefined = undefined;
    private _enemies: Enemies | undefined = undefined;
    private _spaceShip: SpaceShip | undefined = undefined;
    private _asteroidImage: Image | undefined = undefined;
    private _starFields: StarField[] = [];
    private _asteroidFields: AsteroidField[] = [];

    public async load(imageLoader: ImageLoader): Promise<void> {
        this._projectiles = new Projectiles(new Map([
            [ProjectileType.Plasma, await imageLoader('./assets/plasma_projectile.png')]
        ]));
        this._explosions = new Explosions(await imageLoader('./assets/explosion.png'));
        this._enemies = new Enemies(new Map([
            [EnemyType.Spaceship, await imageLoader('./assets/enemy_spaceship.png')]
        ]), this._projectiles, this._explosions);
        const spaceshipImage = await imageLoader('./assets/spaceship.png');
        this._spaceShip = new SpaceShip(spaceshipImage, this._projectiles);
        this._asteroidImage = await imageLoader('./assets/asteroid.png');
    }

    public setup(p: p5): void {
        this._starFields.push(new StarField(p.width, p.height, 100, 2));
        this._starFields.push(new StarField(p.width, p.height, 30, 3));
        this._asteroidFields.push(new AsteroidField(p.width, p.height, 8, 200, this._asteroidImage));
    }

    private isDirectionKeyDown(p: p5, direction: Direction): boolean {
        switch (direction) {
            case Direction.Left:
                return p.keyIsDown(P5.LEFT_ARROW) || p.keyIsDown('a');
            case Direction.Up:
                return p.keyIsDown(P5.UP_ARROW) || p.keyIsDown('w');
            case Direction.Right:
                return p.keyIsDown(P5.RIGHT_ARROW) || p.keyIsDown('d');
            case Direction.Down:
                return p.keyIsDown(P5.DOWN_ARROW) || p.keyIsDown('s');
        }
    }

    public keyPressed(p: p5, event: KeyboardEvent): void {
        if (event.code === 'Space') {
            if (projectileSettings[this._spaceShip.projectileType].allowPermaFire || !event.repeat) {
                this._spaceShip.shoot();
            }
        } else if (event.code === 'KeyE' && this._enemies) { // TODO: REMOVE LATER
            const enemySize = this._enemies.getEnemySize(EnemyType.Spaceship);
            this._enemies.spawn(EnemyType.Spaceship, {
                x: p.width,
                y: Math.random() * p.height - enemySize.height
            });
        }
    }

    public update(p: p5): void {
        if (this._spaceShip) {
            if (this.isDirectionKeyDown(p, Direction.Up) && !this.isDirectionKeyDown(p, Direction.Down) && this._spaceShip.y > 0) {
                this._spaceShip.moveBy(0, -this._speed);
            } else if (this.isDirectionKeyDown(p, Direction.Down) && !this.isDirectionKeyDown(p, Direction.Up) && this._spaceShip.y + this._spaceShip.height < p.height) {
                this._spaceShip.moveBy(0, this._speed);
            }
            if (this.isDirectionKeyDown(p, Direction.Left) && !this.isDirectionKeyDown(p, Direction.Right) && this._spaceShip.x > 0) {
                this._spaceShip.moveBy(-this._speed, 0);
            } else if (this.isDirectionKeyDown(p, Direction.Right) && !this.isDirectionKeyDown(p, Direction.Left) && this._spaceShip.x + this._spaceShip.width < p.width) {
                this._spaceShip.moveBy(this._speed, 0);
            }
            if (p.keyIsDown('Space') && projectileSettings[this._spaceShip.projectileType].allowPermaFire) {
                this._spaceShip.shoot();
            }

            this._spaceShip.updateNode(p);
        }

        this._starFields.forEach((starField, index) => starField.update(0.3 * (index + 1)));
        this._asteroidFields.forEach((asteroidField, index) => asteroidField.update(4 * (index + 1)));

        this._enemies.update(p, (enemy) => this.testEnemyCollision(enemy));
        this._projectiles.update(p, (projectile) => this.testProjectileCollision(projectile));
        this._explosions.update(p);
    }

    private testProjectileCollision(projectile: Projectile): void {
        if (projectile.source === ProjectileSource.Enemy) {
            if (!this._spaceShip) return;
            if (this._player.invincible) return;

            if (this._spaceShip.collisionAreas.some(area => intersectsWithRect(projectile.area, area))) {
                this._player.damage((projectile.sourceObject as Enemy).getProjectileDamage(projectile.type));
                this._spaceShip.enableHurtMode(true);
            }
        } else {
            if (!this._enemies) return;

            const playerDamage = projectileSettings[projectile.type].damage * this._player.damageMultiplicator;
            this._enemies.getEnemies(enemy => enemy.testCollision([projectile.area])).forEach(enemy => enemy.damage(playerDamage));
        }
    }

    private testEnemyCollision(enemy: Enemy): void {
        if (!this._spaceShip) return;
        if (this._player.invincible) return;

        if (enemy.testCollision(this._spaceShip.collisionAreas)) {
            this._player.damage(enemy.touchDamage);
            this._spaceShip.enableHurtMode(true);
        }
    }

    public render(p: p5): void {
        p.background(0);

        this._starFields.forEach(starField => starField.draw(p));
        this._asteroidFields.forEach(asteroidField => asteroidField.draw(p));

        if (this._enemies) {
            this._enemies.draw(p);
        }

        if (this._explosions) {
            this._explosions.draw(p);
        }

        if (this._spaceShip) {
            this._spaceShip.drawNode(p);
        }

        if (this._projectiles) {
            this._projectiles.draw(p);
        }
    }
}
