import p5 from "p5";
import "./styles.scss";

import { draw, keyPressed, keyReleased, setup, windowResized as windowResized2 } from "./lifecycle";

// Creating the sketch itself
const sketch = (p: p5) => {
    p.setup = () => setup(p);
    p.windowResized = () => windowResized2(p);
    p.draw = () => draw(p);
    p.keyPressed = () => keyPressed(p);
    p.keyReleased = () => keyReleased(p);
};

new p5(sketch);
