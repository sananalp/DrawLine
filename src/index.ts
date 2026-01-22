import { Application } from 'pixi.js';

const app = new Application({
  width: 300,
  height: 250,
  backgroundColor: 0xff0000
});

document.body.appendChild(app.view);