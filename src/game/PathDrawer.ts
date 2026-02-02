import { Sprite } from 'pixi.js';
import { Application, Graphics, InteractionEvent, LINE_CAP, Point } from 'pixi.js';
import Scene from '../utils/Scene';
import { Easing, Tween } from '@tweenjs/tween.js';

export default class PathDrawer {
  private app: Application;
  private scene: Scene;
  private graphics: Graphics;
  private drawing: boolean = false;
  private isConnected: boolean = false;
  private firstPoint: Point | null = null;
  private readonly smoothFactor: number = 0.1;
  private path: Point[] = [];
  private road: Point[] = [];
  private speed: number = 3;
  private currentIndex: number = 0;
  private actionSprite: Sprite = new Sprite();
  private targetSprite: Sprite = new Sprite();
  private lineColor: number = 0x000000;
  
  public get Road() : Point[] {
    return this.road;
  }
  public get IsConnected() : boolean {
    return this.isConnected;
  }
  public get ActionSprite() : Sprite {
    return this.actionSprite;
  }
  
  

  constructor(app: Application, scene: Scene) {
    this.app = app;
    this.scene = scene;

    this.graphics = new Graphics();
    this.scene.game.addChild(this.graphics);
  }

  public setupInteraction(actionSprite: Sprite, targetSprite: Sprite, lineColor: number): void {
    this.scene.game.interactive = true;

    this.scene.game.hitArea = this.app.screen;

    this.actionSprite = actionSprite
    this.targetSprite = targetSprite;
    this.lineColor = lineColor;

    this.actionSprite.interactive = true;
    this.targetSprite.interactive = true;

    this.actionSprite.on('pointerdown', this.onPointerDown, this);
    this.scene.game.on('pointermove', this.onPointerMove, this);
    this.targetSprite.on('pointerup', this.onPointerUp, this);
    this.actionSprite.on('pointerup', this.onPointerUpOutside, this);
    this.actionSprite.on('pointerupoutside', this.onPointerUpOutside, this);
  }

  public setPath(path: Point[]): void {
    this.road = path;
    this.currentIndex = 0;

    if (path.length > 0) {
      this.actionSprite.position.copyFrom(path[0]);
    }
  }

  public prepareSpeed(arriveTimeSec: number): void {
    const totalLength = this.getPathLength(this.road);

    // пикселей в тик (delta = 1)
    this.speed = totalLength / (arriveTimeSec * 60);

    this.currentIndex = 0;
  }

  private getPathLength(path: Point[]): number {
    let length = 0;

    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }

    return length;
  }

  public moveSprite(delta: number): void {
    if (this.currentIndex >= this.road.length) {
      this.app.ticker.remove(this.moveSprite, this);
      return;
    }

    const target = this.road[this.currentIndex];

    const dx = target.x - this.actionSprite.x;
    const dy = target.y - this.actionSprite.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const step = this.speed * delta;

    // если за кадр доходим до точки — встаём точно в неё
    if (distance <= step) {
      this.actionSprite.position.copyFrom(target);
      this.currentIndex++;
      return;
    }

    const nx = dx / distance;
    const ny = dy / distance;

    this.actionSprite.anchor.set(0.5);
    this.actionSprite.rotation = Math.atan2(dy, dx) + Math.PI / 2;

    this.actionSprite.x += nx * step;
    this.actionSprite.y += ny * step;
  }

  private onPointerDown(e: InteractionEvent): void {
    this.drawing = true;
    this.firstPoint = e.data.global.clone();

    this.path = [];
    this.path.push(this.firstPoint.clone());
  }

  private onPointerMove(e: InteractionEvent): void {
    if (!this.drawing || !this.firstPoint) return;

    const currentPoint: Point = e.data.global;

    const smoothedX = this.firstPoint.x + (currentPoint.x - this.firstPoint.x) * this.smoothFactor;
    const smoothedY = this.firstPoint.y + (currentPoint.y - this.firstPoint.y) * this.smoothFactor;

    this.graphics.lineStyle({ width: 30, color: this.lineColor, alpha: 1, cap: LINE_CAP.ROUND });
    this.graphics.moveTo(this.firstPoint.x, this.firstPoint.y);
    this.graphics.lineTo(smoothedX, smoothedY);

    this.firstPoint.set(smoothedX, smoothedY);

    const newPoint = new Point(smoothedX, smoothedY);
    this.path.push(newPoint);
  }

  private onPointerUp(): void {
    if(this.path.length < 1) return;

    this.drawing = false;
    this.firstPoint = null;
    this.isConnected = true;
    this.setPath(this.path);
    this.path.push(this.targetSprite.position.clone());
  }

  private onPointerUpOutside(): void {
    this.drawing = false;
    this.firstPoint = null;
    this.path = [];
    
    if(!this.isConnected) this.clear();
  }

  public clear(): void {
    this.graphics.clear();
  }

  public destroy(): void {
    this.actionSprite.off('pointerdown', this.onPointerDown, this);
    this.scene.game.off('pointermove', this.onPointerMove, this);
    this.targetSprite.off('pointerup', this.onPointerUp, this);
    this.actionSprite.off('pointerup', this.onPointerUpOutside, this);
    this.actionSprite.off('pointerupoutside', this.onPointerUpOutside, this);

    this.graphics.destroy();
  }
}
