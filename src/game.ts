import p5, { Image } from "p5";
import { StarField } from "./render/star-field";
import { ImageLoader, SoundLoader } from "./loaders";
import { AsteroidField } from "./render/asteroid-field";
import { Direction } from "./render/direction";
import { P5 } from './constants';
import { SpaceShip } from "./space-ship";
import { projectileSettings, Projectile, Projectiles, ProjectileType, ProjectileSource } from "./projectiles";
import { Enemies, Enemy, EnemyType } from "./enemies";
import { criticalEnergy, Player } from "./player";
import { intersectsWithRect } from "./render/rect";
import { Explosions } from "./explosions";
import { SoundManager, SoundType } from "./sound/sound-manager";
import { Sound } from "./sound/sound";
import { Music } from "./sound/music";
import { drawText, fill } from "./render/utils";
import { Color } from "./render/color";
import { Powerup, Powerups, PowerupType } from "./powerups";

export class Game {
    private readonly _player = new Player();
    private _started = false;
    private _speed: number = 5;
    private _projectiles: Projectiles | undefined = undefined;
    private _explosions: Explosions | undefined = undefined;
    private _powerups: Powerups | undefined = undefined;
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
        this._spaceShip = new SpaceShip(spaceshipImage, this._player, this._projectiles);
        this._asteroidImage = await imageLoader('./assets/asteroid.png');
        this._powerups = new Powerups(await imageLoader('./assets/powerups.png'));

        this._soundManager = await SoundManager.create(this._audioContext, soundLoader);
    }

    public async setup(p: p5): Promise<void> {
        this._starFields.push(new StarField(p.width, p.height, 100, 2));
        this._starFields.push(new StarField(p.width, p.height, 30, 3));
        this._asteroidFields.push(new AsteroidField(p.width, p.height, 8, 200, this._asteroidImage));
    }

    public start(p: p5): void {
        if (this._started) return;

        this._soundManager.init().then(() => this.playMusic(0));
        this._spaceShip.moveTo(0.1 * p.width, 0.5 * p.height - 0.5 * this._spaceShip.width);

        this._started = true;
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
        if (!this._started) {
            if (event.code === 'Escape') return; // do not allow this to start game

            this.start(p);
            return;
        }

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
        } else if (event.key === 'p' && this._powerups) { // TODO: REMOVE LATER
            this._powerups.spawn(Math.random() < 0.5 ? PowerupType.Energy : PowerupType.Shield, {
                x: p.width / 2,
                y: Math.random() * p.height - 80
            });
        }
    }

    public keyReleased(p: p5, event: KeyboardEvent): void {

    }

    public mouseClicked(p: p5, event: MouseEvent): void {
        if (!this._started) {
            this.start(p);
            return;
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
        this._powerups.update(p, (powerup) => this.testPowerupCollision(powerup));
    }

    private gameOver(): void {
        this._enemies.clear();
        this._projectiles.clear();
        this._powerups.clear();

        const shipArea = this._spaceShip.area;
        this._explosions.spawn({ x: shipArea.x + shipArea.width / 2, y: shipArea.y + shipArea.height / 2 }, 0.8);
        this._spaceShip.visible = false;
        this.playSound(SoundType.Die);
    }

    private testProjectileCollision(projectile: Projectile): boolean {
        if (projectile.source === ProjectileSource.Enemy) {
            if (!this._spaceShip) return false;
            if (this._player.invincible || !this._spaceShip.visible) return false;

            if (this._spaceShip.collisionAreas.some(area => intersectsWithRect(projectile.area, area))) {
                this._player.damage((projectile.sourceObject as Enemy).getProjectileDamage(projectile.type));
                if (this._player.energy > 0) {
                    this._spaceShip.enableHurtMode(true);
                    return true;
                } else {
                    this.gameOver();
                    return false;
                }
            }

            return false;
        } else {
            if (!this._enemies) return false;

            const playerDamage = projectileSettings[projectile.type].damage * this._player.damageMultiplicator;
            const hitEnemies = this._enemies.getEnemies(enemy => enemy.testCollision([projectile.area]));

            if (hitEnemies.length === 0) return false;

            let hitEnemy = hitEnemies[0];

            for (let i = 1; i < hitEnemies.length; i++) {
                if (hitEnemies[i].x < hitEnemy.x) {
                    hitEnemy = hitEnemies[i];
                }
            }

            hitEnemy.damage(playerDamage);

            return true;
        }
    }

    private testPowerupCollision(powerup: Powerup): boolean {
        if (!this._spaceShip) return false;
        if (!this._spaceShip.visible) return false;

        if (this._spaceShip.collisionAreas.some(area => intersectsWithRect(powerup.area, area))) {
            this.consumePowerup(powerup);
            return true;
        }

        return false;
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

    private consumePowerup(powerup: Powerup): void {
        this.playSound(SoundType.Powerup);
        switch (powerup.type) {
            case PowerupType.Energy:
                this._player.energy += powerup.value;
                if (this._player.energy >= criticalEnergy) {
                    this._spaceShip.enableCriticalEnergyMode(false);
                }
                break;
            case PowerupType.Shield:
                this._player.shield += powerup.value;
                break;
            case PowerupType.EnergyExtension:
                this._player.maxEnergy += powerup.value;
                break;
            case PowerupType.ShieldExtension:
                this._player.maxShield += powerup.value;
                break;
            case PowerupType.DamageMultiplicator:
                // TODO: Increase or use max?
                this._player.damageMultiplicator = Math.max(this._player.damageMultiplicator, powerup.value);
                break;
            // TODO ...
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

        if (!this._started) {
            p.textSize(24);
            drawText(p, { x: p.width / 2, y: p.height / 2 }, 'Click or key to start', new Color(255, 255, 255));
            return;
        }

        this._starFields.forEach(starField => starField.draw(p));
        this._asteroidFields.forEach(asteroidField => asteroidField.draw(p));

        if (this._powerups) {
            this._powerups.draw(p);
        }

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

        this.drawHud(p);
    }

    private drawHud(p: p5): void {
        p.noFill();
        p.stroke(255);
        p.strokeWeight(2);
        const r = 0.01 * p.width;
        const barWidth = 0.1 * p.width;
        const barHeight = 0.04 * p.height;
        p.rect(0, 0, barWidth + 4, barHeight + 4, r, r, r, r);
        p.rect(barWidth + 4, 0, barWidth + 4, barHeight + 4, r, r, r, r);

        const partWidth = 0.1 * barWidth;
        let color = new Color(64, 192, 255, 224);
        p.noStroke();
        p.textSize(16);
        fill(p, color);

        for (let i = 0; i < 10; i++) {
            if (this._player.energy >= i * 10 + 1) {
                const lr = i === 0 ? r : 0;
                const rr = i === 9 ? r : 0;
                p.rect(2 + i * partWidth, 2, partWidth - 2, barHeight, lr, rr, rr, lr);
            }
        }

        drawText(p, { x: (barWidth + 2) / 2, y: barHeight + 16 }, 'Energy', color);

        color = new Color(240, 240, 192, 224);
        fill(p, color);

        for (let i = 0; i < 10; i++) {
            if (this._player.shield >= i * 10 + 1) {
                const lr = i === 0 ? r : 0;
                const rr = i === 9 ? r : 0;
                p.rect(barWidth + 6 + i * partWidth, 2, partWidth - 2, barHeight, lr, rr, rr, lr);
            }
        }

        drawText(p, { x: barWidth + 4 + (barWidth + 2) / 2, y: barHeight + 16 }, 'Shield', color);
    }
}
