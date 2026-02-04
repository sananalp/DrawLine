import { Easing, Tween, update, remove } from '@tweenjs/tween.js';
import { Application, BaseTexture, Graphics, Sprite, Texture } from 'pixi.js';
import ctaAtlas from '../assets/images/cta-atlas/ctaAtlas.json';
import ctaImage from '../assets/images/cta-atlas/ctaAtlas.png';
import logoImage from '../assets/images/gameLogo.png';
import CustomSprite from '../utils/CustomSprite';
import Scene from '../utils/Scene';

export default class UILayout {
  private app: Application;
  private scene: Scene;
  private failSprite: Sprite = new Sprite();
  private tutorHand: Sprite = new Sprite();
  private ctaButton: Sprite = new Sprite();
  private logoSprite: Sprite = new Sprite();
  private darkLayer: Sprite = new Sprite();
  private moveTween: Tween<any> | null = null;
  private fadeTween: Tween<any> | null = null;

  constructor(app: Application, scene: Scene) {
    this.app = app;
    this.scene = scene;
  }

  public async init() {
    await this.createCtaSprites();

    this.app.ticker.add(() => {
      update(performance.now());
    });

    this.update();
  }

  public update() {
    this.scene.setPropertyPortrait(this.failSprite, "position", { tallMobile: {x: 550, y: 1010} });
    this.scene.setPropertyLandscape(this.failSprite, "position", { tallMobile: {x: 1010, y: 550} });
    this.scene.setPropertyPortrait(this.ctaButton, 'position', { tallMobile: { x: 550, y: 1400 } });
    this.scene.setPropertyPortrait(this.logoSprite, 'position', { tallMobile: { x: 550, y: 700 } });
    this.scene.setPropertyLandscape(this.ctaButton, 'position', { tallMobile: { x: 950, y: 910 } });
    this.scene.setPropertyLandscape(this.logoSprite, 'position', { tallMobile: { x: 950, y: 350 } });
    this.scene.setProperty(this.darkLayer, 'scale', { tallMobile: { x: 10, y: 10 } });
  }

  private async createCtaSprites() {
    this.failSprite = await CustomSprite.create(ctaImage, ctaAtlas, 'fail.png');
    this.ctaButton = await CustomSprite.create(ctaImage, ctaAtlas, 'ctaButton.png');
    this.tutorHand = await CustomSprite.create(ctaImage, ctaAtlas, 'hand.png');
    this.logoSprite = Sprite.from(logoImage);


    this.failSprite.anchor.set(0.5);
    this.failSprite.scale.set(0.5);
    this.failSprite.angle = -15;
    this.failSprite.alpha = 0;
    this.ctaButton.alpha = 0;
    this.logoSprite.alpha = 0;
    this.tutorHand.anchor.set(-0.1, -0.25);

    const darkLayerGraphics = new Graphics()
      .beginFill(0x000000)
      .drawRect(0, 0, this.scene.DESIGN_WIDTH, this.scene.DESIGN_HEIGHT)
      .endFill();

    this.darkLayer = new Sprite(this.app.renderer.generateTexture(darkLayerGraphics));
    this.darkLayer.alpha = 0;
    this.darkLayer.anchor.set(0.5);
    this.ctaButton.anchor.set(0.5);
    this.logoSprite.anchor.set(0.5);

    this.scene.ui.addChild(this.failSprite, this.tutorHand, this.darkLayer, this.ctaButton, this.logoSprite);
  }

  public showEndScreen() {
    const appearTween = new Tween(this.darkLayer)
      .to({ alpha: 0.55 }, 500)
      .delay(500)

    const ctaTween = new Tween({ s: 0, a: 0 })
      .to({ s: 1, a: 1 }, 500)
      .easing(Easing.Bounce.Out)
      .onUpdate((obj) => {
        this.ctaButton.scale.set(obj.s);
        this.ctaButton.alpha = obj.a;
      })
      .onComplete(() => {
        this.ctaButton.anchor.set(0.5);

        new Tween(this.ctaButton.scale)
          .to({ x: 1.1, y: 1.1 }, 500)
          .easing(Easing.Back.Out)
          .repeat(Infinity)
          .repeatDelay(500)
          .yoyo(true)
          .start();
      });

    const logoTween = new Tween({ s: 0, a: 0 })
      .to({ s: 0.4, a: 1 }, 500)
      .easing(Easing.Bounce.Out)
      .onUpdate((obj) => {
        this.logoSprite.scale.set(obj.s);
        this.logoSprite.alpha = obj.a;
      });

    appearTween.chain(logoTween);
    logoTween.chain(ctaTween);
    appearTween.start();
  }

  public failPopup() {
    this.failSprite.alpha = 0;
    this.failSprite.anchor.set(0.5);

    const showTween = new Tween({ s: 0, a: 0 })
      .to({ s: 0.5, a: 1 }, 1000)
      .easing(Easing.Bounce.Out)
      .onUpdate((obj) => {
        this.failSprite.scale.set(obj.s);
        this.failSprite.alpha = obj.a;
      });

    const hideTween = new Tween(this.failSprite)
      .to({ alpha: 0 }, 500)
      .delay(100)
    showTween.chain(hideTween);
    showTween.start();
  }

  public handMoveStop() {
    if (this.moveTween) {
      this.moveTween.stop();
    }
    if (this.fadeTween) {
      this.fadeTween.stop();
    }

    this.fadeTween = new Tween(this.tutorHand)
      .to({ alpha: 0 }, 500)
      .delay(200);

    this.fadeTween.start();
  }

  public handMove(xPos: number, yPos: number) {
    this.scene.setPropertyPortrait(this.tutorHand, "position", { tallMobile: { x: 300, y: 1300 } });
    this.scene.setPropertyLandscape(this.tutorHand, "position", { tallMobile: { x: 520, y: 800 } });

    if (this.moveTween) {
      this.moveTween.stop();
    }
    if (this.fadeTween) {
      this.fadeTween.stop();
    }

    const startX = this.tutorHand.x;
    const startY = this.tutorHand.y;
    this.tutorHand.alpha = 1;

    this.moveTween = new Tween(this.tutorHand.position)
      .to({ x: xPos, y: yPos }, 1500)
      .easing(Easing.Quadratic.Out)
      .onStart(() => {
        this.tutorHand.position.set(startX, startY);
        this.tutorHand.alpha = 1;
      });

    this.fadeTween = new Tween(this.tutorHand)
      .to({ alpha: 0 }, 500)
      .delay(200);

    this.moveTween.chain(this.fadeTween);
    this.fadeTween.chain(this.moveTween);

    this.moveTween.start();
  }
}