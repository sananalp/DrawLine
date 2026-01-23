import { Application } from 'pixi.js';
import Scene from "./utils/Scene";
import Game from "./game/Game";

const app = new Application({
  resizeTo: window,
  backgroundAlpha: 1,
  antialias: true,
  backgroundColor: 0x545454,
});

document.body.appendChild(app.view);

const scene = new Scene(app);
const game = new Game(app, scene);

window.addEventListener('resize', () => game.adaptElements());
