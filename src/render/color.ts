export class Color {
    constructor(private _r: number, private _g: number, private _b: number, private _a: number = 255) {

    }

    public get r() {
        return this._r;
    }

    public get g() {
        return this._g;
    }

    public get b() {
        return this._b;
    }

    public get a() {
        return this._a;
    }

    public equals(color: Color, includeAlpha = true): boolean {
        if (includeAlpha && color.a !== this.a) return false;

        return color.r === this.r &&
            color.g === this.g &&
            color.b === this.b;
    }
}