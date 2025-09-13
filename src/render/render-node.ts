import p5 from "p5";
import { Position, ZeroPosition } from "./position";
import { RenderAction } from "./render-action";

export interface IRenderNode {
    drawNode(p: p5): void;
    moveBy(x: number, y: number): void;
    moveTo(x: number, y: number): void;
    get x(): number;
    get y(): number;
}

export abstract class RenderNode implements IRenderNode {
    private _renderActions = new Map<number, RenderAction>();
    protected readonly position: Position = ZeroPosition();

    public drawNode(p: p5): void {
        const renderActions = [...this._renderActions.values()];

        renderActions.forEach(renderAction => renderAction.push(p));

        this.draw(p);

        renderActions.forEach(renderAction => renderAction.pop(p));
    }

    public updateNode(p: p5): void {
        const renderActions = [...this._renderActions.values()];

        renderActions.forEach(renderAction => renderAction.update(p));

        this.update(p);
    }

    protected abstract draw(p: p5): void;
    protected update(p: p5): void {

    }

    public moveBy(x: number, y: number): void {
        this.position.x += x;
        this.position.y += y;
    }

    public moveTo(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
    }

    public get x(): number {
        return this.position.x;
    }

    public get y(): number {
        return this.position.y;
    }

    public clearRenderActions(): void {
        this._renderActions.clear();
    }

    public addRenderAction(renderAction: RenderAction): number {
        if (this._renderActions.size === 0) {
            this._renderActions.set(0, renderAction);
            return 0;
        }

        const keys = [...this._renderActions.keys()];
        let maxKey = -1;

        keys.forEach(key => {
            if (key > maxKey) {
                maxKey = key;
            }
        });

        if (maxKey !== this._renderActions.size - 1) {
            // If we are here, there are gaps (free numbers), so reuse them
            for (let i = 0; i <= maxKey; i++) {
                if (!this._renderActions.has(i)) {
                    this._renderActions.set(i, renderAction);
                    return i;
                }
            }
        }

        this._renderActions.set(maxKey + 1, renderAction);
        return maxKey + 1;
    }

    public removeRenderAction(key: number): boolean {
        return this._renderActions.delete(key);
    }
}