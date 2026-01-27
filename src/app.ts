import { Application } from 'pixi.js';
import Game from "./game/Game";
import Scene from "./utils/Scene";

const app = new Application({
  resizeTo: window,
  backgroundAlpha: 1,
  antialias: true,
  backgroundColor: 0x545454,
});

document.body.appendChild(app.view);

const scene = new Scene(app);
const game = new Game(app, scene);

await game.init();

window.addEventListener('resize', () => game.update());
