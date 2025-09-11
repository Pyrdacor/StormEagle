import { IRenderNode, RenderNode } from "./renderNode";
import p5, { Image } from "p5";

export interface ISprite extends IRenderNode {
    get width(): number;
    get height(): number;
}

export class Sprite extends RenderNode {
    private readonly image: any;
    private _width: number;
    private _height: number;

    constructor(image: Image, width?: number, height?: number) {
        super();

        this.image = image;

        this._width = width ?? image.width;

        if (width && !height) {
            const ratio = image.height / image.width;
            this._height = width * ratio;
        } else {
            this._height = height ?? image.height;
        }
    }

    public override draw(p: p5): void {
        p.image(this.image, this.position.x, this.position.y, this._width, this._height);
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }
}