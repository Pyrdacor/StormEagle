import p5 from "p5";
import "./styles.scss";

import { draw, keyPressed, keyReleased, setup, windowResized } from "./lifecycle";

// Creating the sketch itself
const sketch = (p: p5) => {
    p.setup = () => setup(p);
    p.windowResized = () => windowResized(p);
    p.draw = () => draw(p);
    p.keyPressed = (event: KeyboardEvent) => keyPressed(p, event);
    p.keyReleased = () => keyReleased(p);
};

new p5(sketch);
