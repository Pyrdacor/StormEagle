import p5, { Image } from "p5";
import { StarField } from "./render/star-field";
import { ImageLoader, SoundLoader } from "./loaders";
import { AsteroidField } from "./render/asteroid-field";
import { Direction } from "./render/direction";
import { P5 } from './constants';
import { SpaceShip } from "./space-ship";
import { projectileSettings, Projectile, Projectiles, ProjectileType, ProjectileSource } from "./projectiles";
import { Enemies, Enemy, EnemyType } from "./enemies";
import { Player } from "./player";
import { intersectsWithRect } from "./render/rect";
import { Explosions } from "./explosions";
import { SoundManager, SoundType } from "./sound/sound-manager";
import { Sound } from "./sound/sound";
import { Music } from "./sound/music";

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
    private _soundManager: SoundManager | undefined = undefined;

    constructor(private readonly _audioContext: AudioContext) {

    }

    public async load(imageLoader: ImageLoader, soundLoader: SoundLoader): Promise<void> {
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

        this._soundManager = await SoundManager.create(this._audioContext, soundLoader);
    }

    public setup(p: p5): void {
        this._starFields.push(new StarField(p.width, p.height, 100, 2));
        this._starFields.push(new StarField(p.width, p.height, 30, 3));
        this._asteroidFields.push(new AsteroidField(p.width, p.height, 8, 200, this._asteroidImage));

        this.playMusic(0);
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
        if (event.key === ' ') {
            if (projectileSettings[this._spaceShip.projectileType].allowPermaFire || !event.repeat) {
                this._spaceShip.shoot();
            }
        } else if (event.key === 'e' && this._enemies) { // TODO: REMOVE LATER
            const enemySize = this._enemies.getEnemySize(EnemyType.Spaceship);
            this._enemies.spawn(EnemyType.Spaceship, {
                x: p.width,
                y: Math.random() * p.height - enemySize.height
            });
        } else if (event.key === '+') {
            this._soundManager.volume += 0.1;
        } else if (event.key === '-') {
            this._soundManager.volume -= 0.1;
        } else if (event.key === 'm') {
            if (this._soundManager.volume > 0) {
                this._soundManager.volume = 0;
            } else {
                this._soundManager.volume = 1;
            }
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

        this._enemies.update(p, this, (enemy) => this.testEnemyCollision(enemy));
        this._projectiles.update(p, (projectile) => this.testProjectileCollision(projectile));
        this._explosions.update(p);
    }

    private gameOver(): void {
        this._enemies.clear();
        this._projectiles.clear();

        const shipArea = this._spaceShip.area;
        this._explosions.spawn({ x: shipArea.x + shipArea.width / 2, y: shipArea.y + shipArea.height / 2 }, 0.8);
        this._spaceShip.visible = false;
        this.playSound(SoundType.Die);
    }

    private testProjectileCollision(projectile: Projectile): void {
        if (projectile.source === ProjectileSource.Enemy) {
            if (!this._spaceShip) return;
            if (this._player.invincible || !this._spaceShip.visible) return;

            if (this._spaceShip.collisionAreas.some(area => intersectsWithRect(projectile.area, area))) {
                this._player.damage((projectile.sourceObject as Enemy).getProjectileDamage(projectile.type));
                if (this._player.energy > 0) {
                    this._spaceShip.enableHurtMode(true);
                } else {
                    this.gameOver();
                }
            }
        } else {
            if (!this._enemies) return;

            const playerDamage = projectileSettings[projectile.type].damage * this._player.damageMultiplicator;
            this._enemies.getEnemies(enemy => enemy.testCollision([projectile.area])).forEach(enemy => enemy.damage(playerDamage));
        }
    }

    private testEnemyCollision(enemy: Enemy): void {
        if (!this._spaceShip) return;
        if (this._player.invincible || !this._spaceShip.visible) return;

        if (enemy.testCollision(this._spaceShip.collisionAreas)) {
            this._player.damage(enemy.touchDamage);
            if (this._player.energy > 0) {
                this._spaceShip.enableHurtMode(true);
            } else {
                this.gameOver();
            }
        }
    }

    public playSound(soundType: SoundType): Sound {
        const sound = this._soundManager.getSound(soundType);

        sound.play();

        return sound;
    }

    public playMusic(level: number): Music {
        const music = this._soundManager.getMusic(level);

        music.play();

        return music;
    }

    public render(p: p5): void {
        p.background(0, 255);

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

        // hud
        p.noFill();
        p.stroke(255);
        p.strokeWeight(2);
        const r = 0.01 * p.width;
        const barWidth = 0.1 * p.width;
        const barHeight = 0.04 * p.height;
        p.rect(0, 0, barWidth + 4, barHeight + 4, r, r, r, r);
        p.rect(barWidth + 4, 0, barWidth + 4, barHeight + 4, r, r, r, r);

        const partWidth = 0.1 * barWidth;
        p.noStroke();
        p.fill(64, 192, 255, 224);

        for (let i = 0; i < 10; i++) {
            if (this._player.energy >= i * 10 + 1) {
                const lr = i === 0 ? r : 0;
                const rr = i === 9 ? r : 0;
                p.rect(2 + i * partWidth, 2, partWidth - 2, barHeight, lr, rr, rr, lr);
            }
        }

        let textWidth = p.textWidth('Energy');
        p.text('Energy', (barWidth + 2) / 2 - textWidth / 2, barHeight + 8, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);

        p.fill(240, 240, 192, 224);

        for (let i = 0; i < 10; i++) {
            if (this._player.shield >= i * 10 + 1) {
                const lr = i === 0 ? r : 0;
                const rr = i === 9 ? r : 0;
                p.rect(barWidth + 6 + i * partWidth, 2, partWidth - 2, barHeight, lr, rr, rr, lr);
            }
        }

        textWidth = p.textWidth('Shield');
        p.text('Shield', barWidth + 4 + (barWidth + 2) / 2 - textWidth / 2, barHeight + 8, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    }
}
