import { Application, Container, Text, TextStyle } from "pixi.js";

type ScreenType = "tallMobile" | "classicMobile" | "foldInner" | "tablet" | "ultraWideMobile";
type Orientation = "portrait" | "landscape";

export default class Scene {
  app: Application;
  game: Container;
  ui: Container;
  screenType: ScreenType;
  DESIGN_WIDTH: number = 0;
  DESIGN_HEIGHT: number = 0;
  debugText?: Text;

  constructor(app: Application) {
    this.app = app;
    this.screenType = this.detectScreenType();

    this.game = new Container();
    this.ui = new Container();

    this.app.stage.addChild(this.game);
    this.app.stage.addChild(this.ui);

    if (process.env.NODE_ENV === "development") {
      this.createDebugText();
      window.addEventListener('resize', () => this.updateDebugText());
    }
  }

  getOrientation(): Orientation {
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  }

  detectScreenType(): ScreenType {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const minDim = Math.min(w, h);
    const maxDim = Math.max(w, h);
    const ratio = minDim / maxDim;

    if (ratio <= 0.58) return "tallMobile";
    if (ratio <= 0.68) return "classicMobile";
    if (ratio <= 0.78) return "foldInner";
    if (ratio <= 0.95) return "tablet";
    return "ultraWideMobile";
  }

  setProperty(element: any, path: string, values: Record<string, any>): void {
    const value = values[this.screenType];
    if (value === undefined) return;

    const keys = path.split(".");
    let obj: Record<string, any> = element;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (obj[key] === undefined) return;
      obj = obj[key];
    }

    const lastKey = keys[keys.length - 1];
    obj[lastKey] = value;
  }

  setPropertyPortrait(element: any, path: string, values: Record<string, any>): void {
    if (this.getOrientation() === "portrait") {
      const portraitValues: Record<string, any> = {};
      for (const key in values) portraitValues[key] = values[key];

      this.setProperty(element, path, portraitValues);
      this.screenType = this.detectScreenType();
    }
  }

  setPropertyLandscape(element: any, path: string, values: Record<string, any>): void {
    if (this.getOrientation() === "landscape") {
      const landscapeValues: Record<string, any> = {};
      for (const key in values) landscapeValues[key] = values[key];

      this.setProperty(element, path, landscapeValues);
      this.screenType = this.detectScreenType();
    }
  }

  createDebugText(): void {
    const style = new TextStyle({
      fontFamily: "Arial",
      fontSize: 64,
      fill: 0xffffff,
      align: "right",
    });

    this.debugText = new Text("", style);
    this.debugText.alpha = 0.8;

    this.app.stage.addChild(this.debugText);

    this.updateDebugText();
  }

  updateDebugText(): void {
    if (!this.debugText) return;

    const orientation = this.getOrientation();
    const screenType = this.screenType;

    this.debugText.text = `${orientation}\n${screenType}`;

    const padding = 10;
    this.debugText.anchor.set(0, 0);
    this.debugText.x = padding;
    this.debugText.y = padding;
  }
}
