import p5 from "p5";
import "./styles.scss";

import { draw, keyPressed, keyReleased, mouseClicked, setup, windowResized } from "./lifecycle";

const sketch = (p: p5) => {
    p.setup = () => setup(p);
    p.windowResized = () => windowResized(p);
    p.draw = () => draw(p);
    p.keyPressed = (event: KeyboardEvent) => keyPressed(p, event);
    p.keyReleased = (event: KeyboardEvent) => keyReleased(p, event);
    p.mouseClicked = (event: MouseEvent) => mouseClicked(p, event);
};

new p5(sketch);
