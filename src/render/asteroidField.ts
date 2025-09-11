import { Position } from "./position";
import { Color } from "./color";
import p5, { Image } from "p5";
import { imageRotated } from "./utils";
import { intersectsWithRect, Rect } from "./rect";

interface Asteroid {
    position: Position;
    width: number;
    height: number;
    rotation: number;
    tint: Color;
    rotationSpeed: number;
}

export class AsteroidField {
    private readonly _asteroids: Asteroid[] = [];
    private readonly _freeAsteroidIndices = new Set<number>();
    private readonly _imageRatio: number;

    constructor(
        private readonly _width: number,
        private readonly _height: number,
        asteroidCount: number,
        baseAsteroidSize: number,
        private readonly _asteroidImage: Image
    ) {
        this._imageRatio = this._asteroidImage.height / this._asteroidImage.width;
        this.spawnAsteroids(asteroidCount, baseAsteroidSize);
    }

    public update(moveSpeed: number) {
        this._asteroids.forEach((asteroid, index) => {
            if (this._freeAsteroidIndices.has(index)) {
                this._freeAsteroidIndices.delete(index);
                this.respawn(this._asteroids[index]);
            } else {
                asteroid.position.x -= moveSpeed;

                if (asteroid.position.x + asteroid.width * 2 <= 0) {
                    this._freeAsteroidIndices.add(index);
                } else {
                    asteroid.rotation += asteroid.rotationSpeed;
                }
            }
        });
    }

    public draw(p: p5): void {
        this._asteroids.forEach(asteroid => this.drawAsteroid(p, asteroid));
    }

    private drawAsteroid(p: p5, asteroid: Asteroid): void {
        //p5.tint(asteroid.tint.r, asteroid.tint.g, asteroid.tint.b, 255);
        imageRotated(p, this._asteroidImage, asteroid.position.x, asteroid.position.y,
            asteroid.rotation, asteroid.width, asteroid.height);
        //p5.tint(255, 255);
    }

    private spawnAsteroids(count: number, baseAsteroidSize: number): void {
        const sectionCount = 16;
        const xSectionCount = Array.from({ length: sectionCount }, () => 0);
        const ySectionCount = Array.from({ length: sectionCount }, () => 0);
        const asteroidRects: Rect[] = [];

        for (let i = 0; i < count; i++) {
            const width = baseAsteroidSize / 2 + Math.random() * baseAsteroidSize;
            const height = width * this._imageRatio;

            const sectionSum = i;
            let tries = 0;

            const getPosition = () => {
                let xSection: number;
                let ySection: number;

                if (sectionSum === 0) {
                    xSection = Math.floor(Math.random() * sectionCount);
                    ySection = Math.floor(Math.random() * sectionCount);
                } else {
                    let xSectionThresholds = xSectionCount.map(c => (sectionSum - c) / sectionSum);
                    let ySectionThresholds = ySectionCount.map(c => (sectionSum - c) / sectionSum);
                    const xTotalCount = xSectionThresholds.reduce((prev, curr) => prev + curr);
                    const yTotalCount = ySectionThresholds.reduce((prev, curr) => prev + curr);
                    xSectionThresholds = xSectionThresholds.map(t => t / xTotalCount);
                    ySectionThresholds = ySectionThresholds.map(t => t / yTotalCount);
                    const xRandom = Math.random();
                    const yRandom = Math.random();
                    let xThreshold = 0;
                    let yThreshold = 0;
                    xSection = sectionCount - 1;
                    ySection = sectionCount - 1;

                    for (let i = 0; i < sectionCount; i++) {
                        xThreshold += xSectionThresholds[i];

                        if (xRandom < xThreshold) {
                            xSection = i;
                            break;
                        }
                    }

                    for (let i = 0; i < sectionCount; i++) {
                        yThreshold += ySectionThresholds[i];

                        if (yRandom < yThreshold) {
                            ySection = i;
                            break;
                        }
                    }
                }

                const x = ((xSection + Math.random()) * this._width / sectionCount) - width / 2;
                const y = ((ySection + Math.random()) * this._height / sectionCount) - height / 2;

                const rect: Rect = {
                    x,
                    y,
                    width,
                    height
                };

                if (asteroidRects.length > 0 && tries < 4 && asteroidRects.some(r => intersectsWithRect(rect, r))) {
                    tries++;
                    return getPosition();
                }

                return { x, y, xSection, ySection };
            }

            const { x, y, xSection, ySection } = getPosition();

            xSectionCount[xSection]++;
            ySectionCount[ySection]++;

            const asteroid = {
                position: {
                    x,
                    y,
                },
                width,
                height,
                rotation: -30.0 + Math.random() * 60.0,
                rotationSpeed: Math.random() >= 0.25 ? 0.0 : Math.random() * 3 - 1.5,
                tint: new Color(255 - Math.random() * 20, 255 - Math.random() * 20, 255 - Math.random() * 20),
            };

            this._asteroids.push(asteroid);
        }
    }

    private respawn(asteroid: Asteroid): void {
        const xDist = this._width / 8;
        const yDist = this._width / 12;
        asteroid.position.x = this._width + Math.random() * xDist;
        asteroid.position.y += Math.max(-asteroid.height / 2, Math.min(this._height + asteroid.height / 2, Math.random() * yDist - yDist / 2));
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }
}