import { Container } from "pixi.js";

export default class IdleManager {
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly timeoutMs: number;
  private readonly onIdleCallback: () => void;
  private isPaused: boolean = false;

  constructor(timeoutSeconds: number, onIdle: () => void) {
    this.timeoutMs = timeoutSeconds * 1000;
    this.onIdleCallback = onIdle;
  }

  public start(watchTarget: Container): void {
    watchTarget.interactive = true;

    const reset = () => this.resetTimer();

    watchTarget.on('pointerdown', reset);
    watchTarget.on('pointermove', reset);
    watchTarget.on('pointerup', reset);

    this.resetTimer();
  }

  public resetTimer(): void {
    if (this.isPaused) return;

    this.stopTimer();
    this.idleTimer = setTimeout(() => {
      this.onIdleCallback();
    }, this.timeoutMs);
  }

  public stopTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  public pause(): void {
    this.isPaused = true;
    this.stopTimer();
  }

  public resume(): void {
    this.isPaused = false;
    this.resetTimer();
  }
}