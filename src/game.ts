import p5, { Image } from "p5";
import { Sprite } from "./render/sprite";
import { StarField } from "./render/starField";
import { ImageLoader } from "./misc";
import { AsteroidField } from "./render/asteroidField";
import { Direction } from "./render/direction";
import { P5 } from './constants';
import { SpaceShip } from "./space-ship";
import { Projectile, Projectiles, ProjectileType } from "./projectiles";

export class Game {
    private _speed: number = 5;
    private _projectiles: Projectiles | undefined = undefined;
    private _spaceShip: SpaceShip | undefined = undefined;
    private _asteroidImage: Image | undefined = undefined;
    private _starFields: StarField[] = [];
    private _asteroidFields: AsteroidField[] = [];

    public async load(imageLoader: ImageLoader): Promise<void> {
        this._projectiles = new Projectiles(new Map([
            [ProjectileType.Plasma, await imageLoader('./assets/plasma_projectile.png')]
        ]));
        this._spaceShip = new SpaceShip(await imageLoader('./assets/spaceship.png'), this._projectiles);
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

    public keyPressed(p: p5, keyCode: number): void {
        // Space key
        if (keyCode === 32) {
            this._spaceShip.shoot();
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
        }

        this._starFields.forEach((starField, index) => starField.update(0.3 * (index + 1)));
        this._asteroidFields.forEach((asteroidField, index) => asteroidField.update(4 * (index + 1)));

        this._projectiles.update(p, (projectile) => this.testCollision(projectile));
    }

    private testCollision(projectile: Projectile): void {
        const lastPosition = projectile.lastPosition;
        const position = { x: projectile.x, y: projectile.y };

        // TODO
    }

    public render(p: p5): void {
        p.background(0);

        this._starFields.forEach(starField => starField.draw(p));
        this._asteroidFields.forEach(asteroidField => asteroidField.draw(p));

        if (this._spaceShip) {
            this._spaceShip.draw(p);
        }

        if (this._projectiles) {
            this._projectiles.draw(p);
        }
    }
}
