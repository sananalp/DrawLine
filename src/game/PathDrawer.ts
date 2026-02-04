import { Application, Graphics, IHitArea, InteractionEvent, LINE_CAP, Point, Rectangle, Sprite, utils } from 'pixi.js';
import Scene from '../utils/Scene';

export default class PathDrawer {
  private app: Application;
  private scene: Scene;
  private event: utils.EventEmitter;
  private lineGraphics: Graphics;
  private drawing: boolean = false;
  private isConnected: boolean = false;
  private firstPoint: Point | null = null;
  private readonly smoothFactor: number = 0.1;
  private path: Point[] = [];
  private road: Point[] = [];
  private speed: number = 0;
  private currentIndex: number = 0;
  private actionSprite: Sprite = new Sprite();
  private targetSprite: Sprite = new Sprite();
  private lineColor: number = 0x000000;

  public get Road(): Point[] {
    return this.road;
  }
  public get IsConnected(): boolean {
    return this.isConnected;
  }
  public get ActionSprite(): Sprite {
    return this.actionSprite;
  }

  constructor(app: Application, scene: Scene, event: utils.EventEmitter) {
    this.app = app;
    this.scene = scene;
    this.event = event;

    this.lineGraphics = new Graphics();
    this.scene.game.addChild(this.lineGraphics);
  }

  public setupInteraction(actionSprite: Sprite, targetSprite: Sprite, lineColor: number): void {
    this.scene.game.interactive = true;

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
    this.scene.game.on('pointerupoutside', this.onPointerUpOutside, this);
  }

  public setHitArea(hitArea: Rectangle) {
    this.scene.game.hitArea = hitArea;
    this.lineGraphics.hitArea = hitArea;
  }

  public setPosition(): void {
    this.actionSprite.position.copyFrom(this.road[0]);
    this.actionSprite.anchor.set(0.5);
  }

  public prepareSpeed(arriveTimeSec: number): void {
    const totalLength = this.getPathLength(this.road);
    this.speed = totalLength / (arriveTimeSec * this.app.ticker.FPS);
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

    if (distance <= this.speed * delta) {
      this.actionSprite.position.copyFrom(target);
      this.currentIndex++;
      return;
    }

    const nx = dx / distance;
    const ny = dy / distance;

    const targetRotation = Math.atan2(dy, dx) + Math.PI / 2;

    let rotationDiff = targetRotation - this.actionSprite.rotation;

    while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
    while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;

    const lerpSpeed = 0.15;
    this.actionSprite.rotation += rotationDiff * lerpSpeed * delta;

    this.actionSprite.x += nx * this.speed * delta;
    this.actionSprite.y += ny * this.speed * delta;
  }

  private onPointerDown(e: InteractionEvent): void {
    this.drawing = true;
    this.firstPoint = e.data.getLocalPosition(this.scene.game).clone();
    this.event.off('onRedTextAligned');
    this.event.emit('onStartPlaying');

    this.path = [];
    this.path.push(this.firstPoint.clone());
  }

  private onPointerMove(e: InteractionEvent): void {
    if (!this.drawing || !this.firstPoint) return;

    const currentPoint: Point = e.data.getLocalPosition(this.scene.game).clone();
    const hitObject = this.app.renderer.plugins.interaction.hitTest(currentPoint) as Sprite;
    const hitObjName = hitObject?.texture?.textureCacheIds[0];

    if (this.lineGraphics.hitArea && this.lineGraphics.hitArea.contains(currentPoint.x, currentPoint.y)) {
      this.drawing = true;
    } else {
      this.drawing = false;
      return;
    }

    if (this.actionSprite.texture?.textureCacheIds[0] === hitObjName || !hitObjName) {
      this.drawing = true;
    }
    else{
      this.drawing = false;
    }

    const smoothedX = this.firstPoint.x + (currentPoint.x - this.firstPoint.x) * this.smoothFactor;
    const smoothedY = this.firstPoint.y + (currentPoint.y - this.firstPoint.y) * this.smoothFactor;

    this.lineGraphics.lineStyle({ width: 30, color: this.lineColor, alpha: 1, cap: LINE_CAP.ROUND });
    this.lineGraphics.moveTo(this.firstPoint.x, this.firstPoint.y);
    this.lineGraphics.lineTo(smoothedX, smoothedY);

    this.firstPoint.set(smoothedX, smoothedY);

    const newPoint = new Point(smoothedX, smoothedY);
    this.path.push(newPoint);
  }

  private onPointerUp(): void {
    if (this.path.length < 1) return;

    this.drawing = false;
    this.firstPoint = null;
    this.actionSprite.interactive = false;
    this.isConnected = true;
    this.road = this.path;
    this.currentIndex = 0;
    this.path.push(this.targetSprite.position.clone());
  }

  private onPointerUpOutside(): void {
    this.drawing = false;
    this.firstPoint = null;
    this.path = [];

    if (!this.isConnected) this.clear();
  }

  public clear(): void {
    this.lineGraphics.clear();
  }

  public reset() {
    this.clear();
    this.path = [];
    this.road= [];
    this.drawing = false;
    this.isConnected = false;
    this.firstPoint = null;
    this.speed = 0;
    this.currentIndex = 0;
    this.actionSprite.interactive = true;

    this.actionSprite.anchor.set(0);
    this.actionSprite.rotation = 0;
  }

  public destroy(): void {
    this.actionSprite.off('pointerdown', this.onPointerDown, this);
    this.scene.game.off('pointermove', this.onPointerMove, this);
    this.targetSprite.off('pointerup', this.onPointerUp, this);
    this.actionSprite.off('pointerup', this.onPointerUpOutside, this);
    this.actionSprite.off('pointerupoutside', this.onPointerUpOutside, this);

    this.lineGraphics.destroy();
  }
}
