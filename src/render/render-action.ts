import p5 from "p5";
import { RenderNode } from "./render-node";

export interface RenderAction {
    push(p: p5): void;
    pop(p: p5): void;
    update(p: p5): void;
}

export class RenderActionState<T extends RenderAction> {
    private _actionIndex?: number;
    private _removeTime?: number;

    constructor(
        private readonly _renderNode: RenderNode,
        private readonly _actionFactory: () => T,
        initiallyEnabled = false
    ) {
        if (initiallyEnabled) {
            this.enableAction(true);
        }
    }

    public enableAction(enable: boolean, autoRemoveAfter?: number) {
        if (enable && this._actionIndex == undefined) {
            this._actionIndex = this._renderNode.addRenderAction(this._actionFactory());
            if (autoRemoveAfter != undefined) {
                this._removeTime = Date.now() + autoRemoveAfter;
            }
        } else if (!enable && this._actionIndex != undefined) {
            this._renderNode.removeRenderAction(this._actionIndex);
            this._actionIndex = undefined;
        }
    }

    public update(): void {
        if (this._removeTime != undefined && Date.now() >= this._removeTime) {
            this.enableAction(false);
            this._removeTime = undefined;
        }
    }
}

export class AlphaBlinkAction implements RenderAction {
    private _lastBlinkTime = 0;
    private _alpha: number;

    constructor(
        private readonly _offAlpha: number,
        private readonly _onAlpha: number,
        private readonly _delay: number
    ) {
        this._alpha = _offAlpha;
    }

    public push(p: p5): void {
        p.tint(255, this._alpha);
    }

    public pop(p: p5): void {
        p.noTint();
    }

    public update(_: p5): void {
        const now = Date.now();

        if (this._lastBlinkTime === 0) {
            this._lastBlinkTime = now;
        } else {
            while (now - this._lastBlinkTime >= this._delay) {
                this.toggleAlpha();
                this._lastBlinkTime += this._delay;
            }
        }
    }

    private toggleAlpha(): void {
        if (this._alpha === this._offAlpha) {
            this._alpha = this._onAlpha;
        } else {
            this._alpha = this._offAlpha;
        }
    }
}