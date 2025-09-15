import p5 from "p5";
import { RenderNode } from "./render-node";
import { Color } from "./color";
import { tint } from "./utils";

export interface RenderAction {
    push(p: p5): void;
    pop(p: p5): void;
    update(p: p5): void;
}

interface ConditionalRenderActionState {
    actionState: RenderActionState<any>;
    autoRemoveAfter?: number;
    condition?: () => boolean;
}

export class RenderActionState<T extends RenderAction> {
    private _actionIndex?: number;
    private _removeTime?: number;
    private readonly _chainedActions: ConditionalRenderActionState[] = [];

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

            this.enableNextChainedAction();
        }
    }

    public chainAction<T extends RenderAction>(next: RenderActionState<T>, autoRemoveAfter?: number, condition?: () => boolean): void {
        this._chainedActions.push({ actionState: next, autoRemoveAfter, condition });
        console.log(this._chainedActions);
    }

    public update(): void {
        if (this._removeTime != undefined && Date.now() >= this._removeTime) {
            this.enableAction(false);
            this._removeTime = undefined;
        }
    }

    private enableNextChainedAction(): void {
        if (this._chainedActions.length === 0) return;

        const [action, ...following] = this._chainedActions;

        if (!action.condition()) return;

        (following ?? []).forEach(chainedAction => action.actionState.chainAction(
            chainedAction.actionState,
            chainedAction.autoRemoveAfter,
            chainedAction.condition
        ));

        action.actionState.enableAction(true, action.autoRemoveAfter);
    }

    public get enabled(): boolean {
        return this._actionIndex != undefined;
    }
}

export class TintBlinkAction implements RenderAction {
    private _lastBlinkTime = 0;
    private _color: Color;

    constructor(
        private readonly _offColor: Color,
        private readonly _onColor: Color,
        private readonly _delay: number
    ) {
        this._color = _offColor;
    }

    public push(p: p5): void {
        tint(p, this._color);
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
                this.toggleColor();
                this._lastBlinkTime += this._delay;
            }
        }
    }

    private toggleColor(): void {
        if (this._color.equals(this._offColor)) {
            this._color = this._onColor;
        } else {
            this._color = this._offColor;
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