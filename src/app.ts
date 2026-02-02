import { Application, utils } from 'pixi.js';
import GameLayout from "./layouts/GameLayout";
import UILayout from './layouts/UILayout';
import Scene from "./utils/Scene";

const app = new Application({
  resizeTo: window,
  backgroundAlpha: 1,
  antialias: true,
  backgroundColor: 0x545454,
});

document.body.appendChild(app.view);

const scene = new Scene(app);
const event = new utils.EventEmitter();
const gameLayout = new GameLayout(app, scene, event);
const uiLayout = new UILayout(app, scene);

event.on('ENEMY_DIED', (pos) => {
  uiLayout.handMove(pos.x, pos.y);
});

await uiLayout.init();
await gameLayout.init();

window.addEventListener('resize', () => {
  gameLayout.update();
  uiLayout.update();
});
