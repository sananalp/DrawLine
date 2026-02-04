import { Application, Container, Graphics, LINE_CAP, Rectangle, Sprite, Text, TextStyle, utils } from 'pixi.js';
import carAtlas from '../assets/images/car-atlas/carAtlas.json';
import carImage from '../assets/images/car-atlas/carAtlas.png';
import CustomSprite from '../utils/CustomSprite';
import PathDrawer from '../game/PathDrawer';
import Scene from '../utils/Scene';
import GameLogic from '../game/GameLogic';

export default class GameLayout {
  private app: Application;
  private scene: Scene;
  private event: utils.EventEmitter;
  private parkingLines: Container = new Container();
  private redCar: Sprite = new Sprite();
  private yellowCar: Sprite = new Sprite();
  private greenCar: Sprite = new Sprite();
  private blueCar: Sprite = new Sprite();
  private yellowText: Text = new Text();
  private redText: Text = new Text();
  private redParkingSlot: Sprite = new Sprite();
  private yellowParkingSlot: Sprite = new Sprite();
  private hitArea: Rectangle = new Rectangle(0, 0, 0, 0);
  private debugGraphics = new Graphics();
  private gameLogic: GameLogic | null = null;

  constructor(app: Application, scene: Scene, event: utils.EventEmitter) {
    this.app = app;
    this.scene = scene;
    this.event = event;
  }

  public async init() {
    this.createParkingLine();
    this.createLetters();
    await this.createCars();

    this.update();
  }

  public update() {
    this.alignParkingLines();
    this.alignLetters();
    this.alignCars();
  }

  private createParkingLine() {
    for (let i = 0; i < 5; i++) {
      const box = new Graphics()
        .beginFill(0xFFFFFF)
        .drawRect(0, 0, 30, 100)
        .endFill();

      const capsule = new Graphics()
        .lineStyle({ width: 25, color: 0xFFFFFF, cap: LINE_CAP.ROUND })
        .moveTo(0, 0)
        .lineTo(50, 0);

      const parkingLineContainer = new Container();
      parkingLineContainer.addChild(box, capsule);

      this.parkingLines.addChild(parkingLineContainer);
    }

    this.scene.game.addChild(this.parkingLines);
  }

  private createLetters() {
    const textStyle = new TextStyle({
      fontFamily: 'Calibri',
      fontSize: 225,
      fontWeight: 'bold',
    });

    this.yellowText = new Text('P', textStyle);
    this.redText = new Text('P', textStyle.clone());

    this.scene.game.addChild(this.yellowText, this.redText);
  }

  private async createCars() {
    this.redCar = await CustomSprite.create(carImage, carAtlas, "redCar.png");
    this.yellowCar = await CustomSprite.create(carImage, carAtlas, "yellowCar.png");
    this.greenCar = await CustomSprite.create(carImage, carAtlas, "greenCar.png");
    this.blueCar = await CustomSprite.create(carImage, carAtlas, "blueCar.png");

    this.greenCar.anchor.set(0.5);
    this.blueCar.anchor.set(0.5);
    this.greenCar.angle = 180;
    this.blueCar.angle = 180;

    const red = new Graphics()
      .beginFill(0xFF0000)
      .drawRect(0, 0, 30, 100)
      .endFill();
    const yellow = new Graphics()
      .beginFill(0xFFFF00)
      .drawRect(0, 0, 30, 100)
      .endFill();

    this.redParkingSlot = new Sprite(this.app.renderer.generateTexture(red));
    this.yellowParkingSlot = new Sprite(this.app.renderer.generateTexture(yellow));
    this.redParkingSlot.anchor.set(0.5);
    this.yellowParkingSlot.anchor.set(0.5);
    this.redParkingSlot.alpha = 0.5;
    this.yellowParkingSlot.alpha = 0.5;

    const pathDrawer1 = new PathDrawer(this.app, this.scene, this.event);
    const pathDrawer2 = new PathDrawer(this.app, this.scene, this.event);

    pathDrawer1.setupInteraction(this.redCar, this.redParkingSlot, 0xd1191f);
    pathDrawer2.setupInteraction(this.yellowCar, this.yellowParkingSlot, 0xffc841);

    this.gameLogic = new GameLogic(this.app, pathDrawer1, pathDrawer2, this.event);

    this.scene.game.addChild(this.redCar, this.yellowCar, this.greenCar, this.blueCar, this.redParkingSlot, this.yellowParkingSlot);
  }

  private alignParkingLines() {
    this.parkingLines.children.forEach((line, index) => {
      const lineContainer = line as Container;
      this.scene.setPropertyPortrait(line, "position", { tallMobile: { x: index * 250, y: 0 } });
      this.scene.setPropertyLandscape(line, "position", { tallMobile: { x: index * 300, y: 0 } });

      this.scene.setPropertyPortrait(lineContainer.children[0], "scale", { tallMobile: { x: 1, y: 10 } });
      this.scene.setPropertyLandscape(lineContainer.children[0], "scale", { tallMobile: { x: 1, y: 5 } });
      this.scene.setProperty(lineContainer.children[0], "position", { tallMobile: { x: 50, y: 0 } });
      this.scene.setPropertyPortrait(lineContainer.children[1], "position", { tallMobile: { x: 40, y: 1000 } });
      this.scene.setPropertyLandscape(lineContainer.children[1], "position", { tallMobile: { x: 40, y: 500 } });
    });

    this.scene.setPropertyPortrait(this.parkingLines, "position", { tallMobile: { x: -25, y: -150 } });
    this.scene.setPropertyLandscape(this.parkingLines, "position", { tallMobile: { x: 300, y: -150 } });
  }

  private alignLetters() {
    this.yellowText.style.fill = 0xffc841;
    this.redText.style.fill = 0xd1191f;

    this.scene.setPropertyPortrait(this.yellowText, "position", { tallMobile: { x: 350, y: 550 } });
    this.scene.setPropertyLandscape(this.yellowText, "position", { tallMobile: { x: 755, y: 50 } });
    this.scene.setPropertyPortrait(this.redText, "position", { tallMobile: { x: 605, y: 550 } });
    this.scene.setPropertyLandscape(this.redText, "position", { tallMobile: { x: 1060, y: 50 } });

    this.event.emit('onRedTextAligned', this.redText.position);
  }

  public alignCars() {
    this.scene.setPropertyPortrait(this.redCar, "position", { tallMobile: { x: 250, y: 1250 } });
    this.scene.setPropertyLandscape(this.redCar, "position", { tallMobile: { x: 500, y: 750 } });
    this.scene.setPropertyPortrait(this.yellowCar, "position", { tallMobile: { x: 650, y: 1250 } });
    this.scene.setPropertyLandscape(this.yellowCar, "position", { tallMobile: { x: 1250, y: 750 } });
    this.scene.setProperty(this.redCar, "scale", { tallMobile: { x: 0.8, y: 0.8 } });
    this.scene.setProperty(this.yellowCar, "scale", { tallMobile: { x: 0.8, y: 0.8 } });

    this.debugGraphics.clear();
    this.scene.setPropertyPortrait(this.hitArea, "x", { tallMobile: 0 });
    this.scene.setPropertyPortrait(this.hitArea, "y", { tallMobile: this.scene.DESIGN_HEIGHT - 1345 });
    this.scene.setPropertyPortrait(this.hitArea, "width", { tallMobile: this.scene.DESIGN_WIDTH });
    this.scene.setPropertyPortrait(this.hitArea, "height", { tallMobile: this.scene.DESIGN_HEIGHT - 975 });
    
    this.scene.setPropertyLandscape(this.hitArea, "x", { tallMobile: 0 });
    this.scene.setPropertyLandscape(this.hitArea, "y", { tallMobile: 60 });
    this.scene.setPropertyLandscape(this.hitArea, "width", { tallMobile: this.scene.DESIGN_WIDTH});
    this.scene.setPropertyLandscape(this.hitArea, "height", { tallMobile: this.scene.DESIGN_HEIGHT - 115 });

    this.gameLogic?.setHitArea(this.hitArea);

    this.debugGraphics.lineStyle(5, 0xFF0000, 1);
    this.debugGraphics.drawShape(this.hitArea);
    this.scene.game.addChild(this.debugGraphics);

    this.scene.setPropertyPortrait(this.greenCar, "position", { tallMobile: { x: 165, y: 700 } });
    this.scene.setPropertyLandscape(this.greenCar, "position", { tallMobile: { x: 515, y: 180 } });
    this.scene.setProperty(this.greenCar, "scale", { tallMobile: { x: 0.8, y: 0.8 } });

    this.scene.setPropertyPortrait(this.blueCar, "position", { tallMobile: { x: 915, y: 700 } });
    this.scene.setPropertyLandscape(this.blueCar, "position", { tallMobile: { x: 1415, y: 180 } });
    this.scene.setProperty(this.blueCar, "scale", { tallMobile: { x: 0.8, y: 0.8 } });

    this.scene.setPropertyPortrait(this.redParkingSlot, "position", { tallMobile: { x: 665, y: 700 } });
    this.scene.setPropertyLandscape(this.redParkingSlot, "position", { tallMobile: { x: 1115, y: 180 } });
    this.scene.setPropertyPortrait(this.redParkingSlot, "scale", { tallMobile: { x: 8, y: 4 } });
    this.scene.setPropertyLandscape(this.redParkingSlot, "scale", { tallMobile: { x: 9, y: 4 } });
    
    this.scene.setPropertyPortrait(this.yellowParkingSlot, "position", { tallMobile: { x: 412, y: 700 } });
    this.scene.setPropertyLandscape(this.yellowParkingSlot, "position", { tallMobile: { x: 815, y: 180 } });
    this.scene.setPropertyPortrait(this.yellowParkingSlot, "scale", { tallMobile: { x: 8, y: 4 } });
    this.scene.setPropertyLandscape(this.yellowParkingSlot, "scale", { tallMobile: { x: 9, y: 4 } });
  }
}