import { Application, Container, Graphics, LINE_CAP, Sprite, TextStyle, Text } from 'pixi.js';
import carAtlas from '../assets/images/car-atlas/carAtlas.json';
import carImage from '../assets/images/car-atlas/carAtlas.png';
import Scene from '../utils/Scene';
import CustomSprite from '../utils/CustomSprite';

export default class Game {
  private app: Application;
  private scene: Scene;
  private parkingLines: Container = new Container();
  private redCar: Sprite = new Sprite();
  private yellowCar: Sprite = new Sprite();
  private greenCar: Sprite = new Sprite();
  private blueCar: Sprite = new Sprite();
  private yellowText: Text = new Text();
  private redText: Text = new Text();

  constructor(app: Application, scene: Scene) {
    this.app = app;
    this.scene = scene;
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

    this.greenCar.anchor.set(1);
    this.blueCar.anchor.set(1);
    this.greenCar.angle = 180;
    this.blueCar.angle = 180;

    this.scene.game.addChild(this.redCar, this.yellowCar, this.greenCar, this.blueCar);
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

    this.scene.setPropertyPortrait(this.parkingLines, "position", { tallMobile: { x: -25, y: 0 } });
    this.scene.setPropertyLandscape(this.parkingLines, "position", { tallMobile: { x: 300, y: -150 } });
  }

  private alignLetters() {
    this.yellowText.style.fill = 0xffc841;
    this.redText.style.fill = 0xd1191f;

    this.scene.setPropertyPortrait(this.yellowText, "position", { tallMobile: { x: 350, y: 700 } });
    this.scene.setPropertyLandscape(this.yellowText, "position", { tallMobile: { x: 755, y: 50 } });
    this.scene.setPropertyPortrait(this.redText, "position", { tallMobile: { x: 605, y: 700 } });
    this.scene.setPropertyLandscape(this.redText, "position", { tallMobile: { x: 1060, y: 50 } });
  }

  private alignCars() {
    // this.yellowCar.position.x = 570;
    // this.yellowCar.position.y = 570;
    // this.redCar.position.x = 80;
    // this.redCar.position.y = 570;

    this.scene.setPropertyPortrait(this.greenCar, "position", { tallMobile: { x: 65, y: 700 } });
    this.scene.setPropertyLandscape(this.greenCar, "position", { tallMobile: { x: 415, y: 50 } });
    this.scene.setProperty(this.greenCar, "scale", { tallMobile: { x: 0.9, y: 0.9 } });
    
    this.scene.setPropertyPortrait(this.blueCar, "position", { tallMobile: { x: 820, y: 700 } });
    this.scene.setPropertyLandscape(this.blueCar, "position", { tallMobile: { x: 1320, y: 50 } });
    this.scene.setProperty(this.blueCar, "scale", { tallMobile: { x: 0.9, y: 0.9 } });
  }
}