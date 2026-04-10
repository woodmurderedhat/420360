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
    this.frameTime = 1000 / 60; // milliseconds per frame

    // Performance monitoring
    this.frameTimes = [];
    this.maxFrameTimeSamples = 60;
    this.avgFrameTime = 0;

    // Bind for consistent context
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
    console.log("▶️  Render loop started");
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
    console.log(`⏹️  Render loop stopped (${this.frameCount} frames rendered)`);
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
      // Track frame timing
      this.frameTimes.push(deltaTime);
      if (this.frameTimes.length > this.maxFrameTimeSamples) {
        this.frameTimes.shift();
      }

      // Calculate average frame time
      this.avgFrameTime =
        this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;

      // Calculate FPS
      if (this.avgFrameTime > 0) {
        this.fps = Math.round(1000 / this.avgFrameTime);
      }

      // Warn if frame time exceeds threshold
      if (deltaTime > 33) {
        // More than ~30ms for 60fps target
        console.warn(`⚠️  Slow frame: ${deltaTime.toFixed(2)}ms`);
      }

      // Render
      this.renderFn(deltaTime, now);\n    } catch (error) {\n      console.error(\"Render error:\", error);\n      this.stop();\n      return;\n    }\n\n    this.frameId = requestAnimationFrame(() => this._frame());\n    this.frameCount++;\n  }\n\n  /**\n   * Get current performance metrics\n   */\n  getMetrics() {\n    return {\n      fps: this.fps,\n      avgFrameTime: this.avgFrameTime.toFixed(2),\n      frameCount: this.frameCount,\n      running: this.running\n    };\n  }\n\n  /**\n   * Get performance report\n   */\n  getReport() {\n    const metrics = this.getMetrics();\n    return `FPS: ${metrics.fps} | Avg Frame: ${metrics.avgFrameTime}ms | Frames: ${metrics.frameCount}`;\n  }\n}\n\n/**\n * Animation scheduler for coordinating multiple animations\n */\nexport class AnimationScheduler {\n  constructor() {\n    this.animations = new Map();\n    this.running = false;\n    this.frameId = null;\n    this._frame = this._frame.bind(this);\n  }\n\n  /**\n   * Schedule animation\n   */\n  schedule(id, animate, duration = null) {\n    if (!id || typeof animate !== \"function\") return;\n\n    this.animations.set(id, {\n      animate,\n      startTime: performance.now(),\n      duration,\n      progress: 0\n    });\n\n    if (!this.running) {\n      this.start();\n    }\n  }\n\n  /**\n   * Cancel animation\n   */\n  cancel(id) {\n    return this.animations.delete(id);\n  }\n\n  /**\n   * Start scheduler\n   */\n  start() {\n    if (this.running) return;\n    this.running = true;\n    this._frame();\n  }\n\n  /**\n   * Stop scheduler\n   */\n  stop() {\n    this.running = false;\n    if (this.frameId) {\n      cancelAnimationFrame(this.frameId);\n      this.frameId = null;\n    }\n  }\n\n  /**\n   * Internal frame processing\n   */\n  _frame() {\n    if (!this.running) return;\n\n    const toDelete = [];\n    const now = performance.now();\n\n    for (const [id, animation] of this.animations) {\n      const elapsed = now - animation.startTime;\n\n      // Calculate progress\n      if (animation.duration) {\n        animation.progress = Math.min(elapsed / animation.duration, 1);\n        if (animation.progress >= 1) {\n          animation.animate(1);\n          toDelete.push(id);\n          continue;\n        }\n      }\n\n      try {\n        animation.animate(animation.progress, elapsed);\n      } catch (error) {\n        console.error(`Animation ${id} error:`, error);\n        toDelete.push(id);\n      }\n    }\n\n    // Clean up completed animations\n    toDelete.forEach((id) => this.animations.delete(id));\n\n    if (this.animations.size > 0) {\n      this.frameId = requestAnimationFrame(() => this._frame());\n    } else {\n      this.stop();\n    }\n  }\n\n  /**\n   * Get active animation count\n   */\n  getActive() {\n    return this.animations.size;\n  }\n}\n"