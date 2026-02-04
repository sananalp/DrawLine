import { Application, utils } from 'pixi.js';
import GameLayout from "./layouts/GameLayout";
import UILayout from './layouts/UILayout';
import Scene from "./utils/Scene";
import IdleManager from './utils/IdleManager';

const app = new Application({
  resizeTo: window,
  backgroundColor: 0x545454,
  antialias: true,
});

app.view.style.position = "absolute";
document.body.appendChild(app.view);

const scene = new Scene(app);
const event = new utils.EventEmitter();
const gameLayout = new GameLayout(app, scene, event);
const uiLayout = new UILayout(app, scene);

const idle = new IdleManager(3, () => {
  uiLayout.handMoveStop();
  uiLayout.showEndScreen();
});

idle.start(scene.game);

event.on('onRedTextAligned', (pos) => {
  uiLayout.handMove(pos.x, pos.y);
});
event.on('onStartPlaying', () => {
  uiLayout.handMoveStop();
  idle.pause();
});
event.on('onCarCrash', () => {
  uiLayout.failPopup();
  gameLayout.alignCars();
});
event.on('onAttemptEnd', () => {
  gameLayout.alignCars();
  uiLayout.showEndScreen();
  idle.pause();
});

scene.resize();
await uiLayout.init();
await gameLayout.init();

window.addEventListener('resize', () => {
  scene.resize();
  uiLayout.update();
  gameLayout.update();
});
