import { Application, Graphics, Point, Sprite } from "pixi.js";
import PathDrawer from "./PathDrawer";
import Scene from "../utils/Scene";

export default class GameLogic {
  private app: Application;
  // private scene: Scene;
  private pathDrawer1: PathDrawer;
  private pathDrawer2: PathDrawer;

  constructor(app: Application, scene: Scene, a: PathDrawer, b: PathDrawer) {
    this.app = app;
    // this.scene = scene;
    this.pathDrawer1 = a;
    this.pathDrawer2 = b;

    app.stage.interactive = true;
    app.stage.on('pointerup', this.checkConnectedLines, this);
  }

  private checkConnectedLines() {
    if (this.cutPathsAtFirstIntersection(this.pathDrawer1.Road, this.pathDrawer2.Road)) {

      const ARRIVE_TIME = 3; // секунды

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
    }
  }

  private getSegmentIntersection(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    const x4 = p4.x, y4 = p4.y;

    const denom =
      (x1 - x2) * (y3 - y4) -
      (y1 - y2) * (x3 - x4);

    if (denom === 0) return null; // параллельны или совпадают

    const px =
      ((x1 * y2 - y1 * x2) * (x3 - x4) -
        (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;

    const py =
      ((x1 * y2 - y1 * x2) * (y3 - y4) -
        (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

    // Проверка, что точка внутри ОБОИХ отрезков
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
          // ✂️ Обрезаем pathA
          pathA.splice(i + 1);
          pathA.push(intersection);

          // ✂️ Обрезаем pathB
          pathB.splice(j + 1);
          pathB.push(intersection.clone());

          return true; // нашли первое пересечение — выходим
        }
      }
    }

    return false; // пересечений нет
  }
}