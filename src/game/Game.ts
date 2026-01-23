import { Application, Graphics } from 'pixi.js';
import Scene from '../utils/Scene';

export default class Game {
  private app: Application;
  private scene: Scene;
  private box: Graphics;

  constructor(app: Application, scene: Scene) {
    this.app = app;
    this.scene = scene;

    this.box = new Graphics();
    this.box.beginFill(0xFFFF00);
    this.box.drawRect(0, 0, 100, 100);
    this.box.endFill();

    this.scene.game.addChild(this.box);

    this.adaptElements();
  }

  public adaptElements(): void {
    this.scene.setPropertyPortrait(this.box, "position",
      {
        tallMobile: {
          x: window.innerWidth - this.box.width,
          y: window.innerHeight - this.box.height
        },
        classicMobile: {
          x: window.innerWidth - this.box.width - 100,
          y: window.innerHeight - this.box.height - 100
        },
      });

    this.scene.setPropertyLandscape(this.box, "position",
      {
        tallMobile: { x: 0, y: 0 },
        classicMobile: { x: 0, y: 0 }
      });
  }
}