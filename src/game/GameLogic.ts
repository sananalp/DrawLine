import { Application, Point, Rectangle, Sprite, utils } from "pixi.js";
import PathDrawer from "./PathDrawer";

export default class GameLogic {
  private app: Application;
  private event: utils.EventEmitter;
  private pathDrawer1: PathDrawer;
  private pathDrawer2: PathDrawer;
  private attemptCount: number = 0;

  constructor(app: Application, a: PathDrawer, b: PathDrawer, event: utils.EventEmitter) {
    this.app = app;
    this.event = event;
    this.pathDrawer1 = a;
    this.pathDrawer2 = b;

    app.stage.interactive = true;
    app.stage.on('pointerup', this.checkConnectedLines, this);
  }

  private checkConnectedLines() {
    if (this.cutPathsAtFirstIntersection(this.pathDrawer1.Road, this.pathDrawer2.Road)) {

      const ARRIVE_TIME = 2;

      this.pathDrawer1.setPosition();
      this.pathDrawer2.setPosition();

      this.pathDrawer1.prepareSpeed(ARRIVE_TIME);
      this.pathDrawer2.prepareSpeed(ARRIVE_TIME);

      this.app.ticker.add(this.moveSpriteUpdate, this);
    }
  }

  private isTouching(a: Sprite, b: Sprite): boolean {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const radiusA = Math.max(a.width, a.height) * 0.45;
    const radiusB = Math.max(b.width, b.height) * 0.45;

    return distance <= radiusA + radiusB;
  }

  private moveSpriteUpdate(delta: number): void {
    this.pathDrawer1.moveSprite(delta);
    this.pathDrawer2.moveSprite(delta);

    if (this.isTouching(this.pathDrawer1.ActionSprite, this.pathDrawer2.ActionSprite)) {
      this.app.ticker.remove(this.moveSpriteUpdate, this);
      this.pathDrawer1.reset();
      this.pathDrawer2.reset();
      this.attemptCount++;
      if(this.attemptCount === 3)
        this.event.emit('onAttemptEnd');
      else
        this.event.emit('onCarCrash');
        
    }
  }

  public setHitArea(hitArea: Rectangle) {
    this.pathDrawer1.setHitArea(hitArea);
    this.pathDrawer2.setHitArea(hitArea);
  }

  private getSegmentIntersection(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    const x4 = p4.x, y4 = p4.y;

    const denom =
      (x1 - x2) * (y3 - y4) -
      (y1 - y2) * (x3 - x4);

    if (denom === 0) return null;

    const px =
      ((x1 * y2 - y1 * x2) * (x3 - x4) -
        (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;

    const py =
      ((x1 * y2 - y1 * x2) * (y3 - y4) -
        (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

    if (
      px < Math.min(x1, x2) || px > Math.max(x1, x2) ||
      px < Math.min(x3, x4) || px > Math.max(x3, x4) ||
      py < Math.min(y1, y2) || py > Math.max(y1, y2) ||
      py < Math.min(y3, y4) || py > Math.max(y3, y4)
    ) {
      return null;
    }

    return new Point(px, py);
  }

  private cutPathsAtFirstIntersection(pathA: Point[], pathB: Point[]): boolean {
    for (let i = 0; i < pathA.length - 1; i++) {
      const a1 = pathA[i];
      const a2 = pathA[i + 1];

      for (let j = 0; j < pathB.length - 1; j++) {
        const b1 = pathB[j];
        const b2 = pathB[j + 1];

        const intersection = this.getSegmentIntersection(a1, a2, b1, b2);

        if (intersection) {
          pathA.splice(i + 1);
          pathA.push(intersection);

          pathB.splice(j + 1);
          pathB.push(intersection.clone());

          return true;
        }
      }
    }

    return false;
  }
}