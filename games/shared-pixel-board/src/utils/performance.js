/**
 * Performance Monitoring and Debugging Utilities
 * Tracks metrics, memory usage, and performance bottlenecks
 */

/**
 * Performance profiler for method timing
 */
export class Profiler {
  constructor(name = "Profiler") {
    this.name = name;
    this.marks = new Map();
    this.measures = new Map();
  }

  /**
   * Mark a point in time
   */
  mark(label) {
    const key = `${this.name}::${label}`;
    if (typeof performance !== "undefined" && performance.mark) {
      try {
        performance.mark(key);
      } catch (e) {
        console.warn(`Failed to mark ${key}:`, e);
      }
    }
    this.marks.set(label, performance.now());
  }

  /**
   * Measure between two marks
   */
  measure(label, startMark, endMark = label) {
    if (!this.marks.has(startMark)) {
      console.warn(`Mark not found: ${startMark}`);
      return null;
    }

    const startTime = this.marks.get(startMark);
    const endTime = this.marks.get(endMark) || performance.now();
    const duration = endTime - startTime;

    this.measures.set(label, duration);

    const key = `${this.name}::${label}`;
    if (typeof performance !== "undefined" && performance.measure) {
      try {
        performance.measure(key, `${this.name}::${startMark}`, `${this.name}::${endMark}`);
      } catch (e) {
        // Silently fail if marks don't exist in performance API
      }
    }

    return duration;
  }

  /**
   * Get measure duration
   */
  getDuration(label) {
    return this.measures.get(label);
  }

  /**
   * Get all measures as report
   */
  getReport() {
    const entries = Array.from(this.measures.entries()).sort(
      ([, a], [, b]) => b - a
    );
    return entries.map(([label, duration]) =>
      `${label}: ${duration.toFixed(2)}ms`
    ).join("\n");
  }

  /**
   * Clear all marks and measures
   */
  clear() {
    this.marks.clear();
    this.measures.clear();
  }
}

/**
 * Memory usage tracker
 */
export class MemoryTracker {
  constructor(name = "Memory") {
    this.name = name;
    this.snapshots = [];
    this.hasPerformanceMemory =
      typeof performance !== "undefined" &&
      performance.memory;
  }

  /**
   * Take memory snapshot
   */
  snapshot(label = "snapshot") {
    const snapshot = {
      label,
      timestamp: Date.now(),
      time: performance.now()
    };

    if (this.hasPerformanceMemory) {
      snapshot.usedJSHeapSize = performance.memory.usedJSHeapSize;
      snapshot.totalJSHeapSize = performance.memory.totalJSHeapSize;
      snapshot.jsHeapSizeLimit = performance.memory.jsHeapSizeLimit;
    }

    this.snapshots.push(snapshot);
    return snapshot;
  }

  /**
   * Get memory delta between two snapshots
   */
  getDelta(startLabel, endLabel) {
    const start = this.snapshots.find((s) => s.label === startLabel);
    const end = this.snapshots.find((s) => s.label === endLabel);

    if (!start || !end) {
      return null;
    }

    if (!this.hasPerformanceMemory) {
      return { timeDelta: end.time - start.time };
    }

    return {
      timeDelta: end.time - start.time,
      heapDelta: end.usedJSHeapSize - start.usedJSHeapSize,
      heapPercent:
        ((end.usedJSHeapSize - start.usedJSHeapSize) / start.usedJSHeapSize * 100).toFixed(2)
    };
  }

  /**
   * Get memory report
   */
  getReport() {
    if (!this.hasPerformanceMemory || this.snapshots.length === 0) {
      return "Memory tracking not available";
    }

    const latest = this.snapshots[this.snapshots.length - 1];
    return [
      `Used: ${(latest.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      `Total: ${(latest.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      `Limit: ${(latest.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
    ].join(" | ");
  }

  /**
   * Clear snapshots
   */
  clear() {
    this.snapshots = [];
  }
}

/**
 * Performance monitor coordinator
 */
export class PerformanceMonitor {
  constructor(name = "App") {
    this.name = name;
    this.profiler = new Profiler(name);
    this.memory = new MemoryTracker(name);
    this.metrics = new Map();
  }

  /**
   * Track custom metric
   */
  trackMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push({
      value,
      timestamp: performance.now()
    });
  }

  /**
   * Get metric average
   */
  getMetricAverage(name) {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b.value, 0);
    return sum / values.length;
  }

  /**
   * Get performance summary
   */
  getSummary() {
    return {
      profiler: this.profiler.getReport(),
      memory: this.memory.getReport(),
      customMetrics: Array.from(this.metrics.entries()).reduce(
        (acc, [name, values]) => ({
          ...acc,
          [name]: {
            count: values.length,
            avg: (values.reduce((a, b) => a + b.value, 0) / values.length).toFixed(2)
          }
        }),
        {}
      )
    };
  }

  /**
   * Print summary to console
   */
  printSummary() {
    console.log(`📊 Performance Summary: ${this.name}`);
    console.log(this.getSummary());
  }

  /**
   * Reset all tracking
   */
  reset() {
    this.profiler.clear();
    this.memory.clear();
    this.metrics.clear();
  }
}
