import { Easing, Tween, update } from '@tweenjs/tween.js';
import { Application, Sprite } from 'pixi.js';
import ctaAtlas from '../assets/images/cta-atlas/ctaAtlas.json';
import ctaImage from '../assets/images/cta-atlas/ctaAtlas.png';
import CustomSprite from '../utils/CustomSprite';
import Scene from '../utils/Scene';

export default class UILayout {
  private app: Application;
  private scene: Scene;
  private failSprite: Sprite = new Sprite();
  private tutorHand: Sprite = new Sprite();
  private ctaButton: Sprite = new Sprite();

  constructor(app: Application, scene: Scene) {
    this.app = app;
    this.scene = scene;
  }

  public async init() {
    await this.createCtaSprites();

    this.update();
  }

  public update() {
    
  }

  private async createCtaSprites() {
    // this.failSprite = await CustomSprite.create(ctaImage, ctaAtlas, 'fail.png');
    // this.ctaButton = await CustomSprite.create(ctaImage, ctaAtlas, 'ctaButton.png');
    this.tutorHand = await CustomSprite.create(ctaImage, ctaAtlas, 'hand.png');
    // this.tutorHand.anchor.set(-0.1, -0.25);

    // this.scene.ui.addChild(this.failSprite, this.tutorHand, this.ctaButton);
  }

  public handMove(xPos: number, yPos: number) {
    const tween = new Tween(this.tutorHand);
    
    this.scene.setPropertyPortrait(this.tutorHand, "position", { tallMobile: { x: 100, y: 1300 } });
    this.scene.setPropertyLandscape(this.tutorHand, "position", { tallMobile: { x: 600, y: 600 } });

    tween
      .to({ x: xPos, y: yPos }, 1000)
      .easing(Easing.Quadratic.Out)
      // .start();

    this.app.ticker.add(() => {
      update(performance.now());
    });
  }
}