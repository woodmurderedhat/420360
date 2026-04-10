/**
 * Advanced Render Loop Management
 * Provides frame-synchronized rendering with FPS tracking and performance monitoring
 */

/**
 * Render loop manager with frame timing
 */
export class RenderLoopManager {
  constructor(renderFn) {
    if (typeof renderFn !== "function") {
      throw new Error("RenderLoopManager: renderFn must be a function");
    }

    this.renderFn = renderFn;
    this.running = false;
    this.frameId = null;
    this.frameCount = 0;
    this.lastTime = 0;
    this.fps = 60;
    this.targetFps = 60;
    this.frameTime = 1000 / 60;

    // Performance monitoring
    this.frameTimes = [];
    this.maxFrameTimeSamples = 60;
    this.avgFrameTime = 0;

    this._frame = this._frame.bind(this);
  }

  /**
   * Start render loop
   */
  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this._frame();
  }

  /**
   * Stop render loop
   */
  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  /**
   * Internal frame function
   */
  _frame() {
    if (!this.running) return;

    const now = performance.now();
    const deltaTime = now - this.lastTime;
    this.lastTime = now;

    try {
      this.frameTimes.push(deltaTime);
      if (this.frameTimes.length > this.maxFrameTimeSamples) {
        this.frameTimes.shift();
      }

      this.avgFrameTime =
        this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;

      if (this.avgFrameTime > 0) {
        this.fps = Math.round(1000 / this.avgFrameTime);
      }

      if (deltaTime > 33) {
        console.warn(`Slow frame: ${deltaTime.toFixed(2)}ms`);
      }

      this.renderFn(deltaTime, now);
    } catch (error) {
      console.error("Render error:", error);
      this.stop();
      return;
    }

    this.frameId = requestAnimationFrame(() => this._frame());
    this.frameCount++;
  }

  /**
   * Get current performance metrics
   */
  getMetrics() {
    return {
      fps: this.fps,
      avgFrameTime: this.avgFrameTime.toFixed(2),
      frameCount: this.frameCount,
      running: this.running
    };
  }

  /**
   * Get performance report string
   */
  getReport() {
    const m = this.getMetrics();
    return `FPS: ${m.fps} | Avg Frame: ${m.avgFrameTime}ms | Frames: ${m.frameCount}`;
  }
}

/**
 * Animation scheduler for coordinating multiple animations
 */
export class AnimationScheduler {
  constructor() {
    this.animations = new Map();
    this.running = false;
    this.frameId = null;
    this._frame = this._frame.bind(this);
  }

  /**
   * Schedule an animation by id
   */
  schedule(id, animate, duration = null) {
    if (!id || typeof animate !== "function") return;

    this.animations.set(id, {
      animate,
      startTime: performance.now(),
      duration,
      progress: 0
    });

    if (!this.running) {
      this.start();
    }
  }

  /**
   * Cancel animation by id
   */
  cancel(id) {
    return this.animations.delete(id);
  }

  /**
   * Start scheduler
   */
  start() {
    if (this.running) return;
    this.running = true;
    this._frame();
  }

  /**
   * Stop scheduler
   */
  stop() {
    this.running = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  /**
   * Internal frame processing
   */
  _frame() {
    if (!this.running) return;

    const toDelete = [];
    const now = performance.now();

    for (const [id, animation] of this.animations) {
      const elapsed = now - animation.startTime;

      if (animation.duration) {
        animation.progress = Math.min(elapsed / animation.duration, 1);
        if (animation.progress >= 1) {
          animation.animate(1);
          toDelete.push(id);
          continue;
        }
      }

      try {
        animation.animate(animation.progress, elapsed);
      } catch (error) {
        console.error(`Animation ${id} error:`, error);
        toDelete.push(id);
      }
    }

    toDelete.forEach((id) => this.animations.delete(id));

    if (this.animations.size > 0) {
      this.frameId = requestAnimationFrame(() => this._frame());
    } else {
      this.stop();
    }
  }

  /**
   * Get active animation count
   */
  getActive() {
    return this.animations.size;
  }
}
