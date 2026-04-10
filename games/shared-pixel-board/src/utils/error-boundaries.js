/**
 * Error Boundaries and Resilience Utilities
 * Provides try-catch patterns, error context tracking, and graceful degradation
 */

/**
 * Safely execute code with fallback
 */
export function safeExecute(fn, fallback = null, context = "") {
  try {
    const result = fn();
    return result !== undefined ? result : fallback;
  } catch (error) {
    console.error(`Error in ${context}:`, error);
    return fallback;
  }
}

/**
 * Async version with timeout
 */
export async function safeExecuteAsync(fn, timeout = 5000, context = "") {
  return Promise.race([
    Promise.resolve().then(() => fn()),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout in ${context}`)), timeout)
    )
  ]).catch((error) => {
    console.error(`Async error in ${context}:`, error);
    return null;
  });
}

/**
 * Validate object against schema
 */
export function validateObject(obj, schema, context = "") {
  if (!obj || typeof obj !== "object") {
    console.warn(`${context}: Invalid object`, obj);
    return false;
  }

  for (const [key, type] of Object.entries(schema)) {
    if (type === "required" && !(key in obj)) {
      console.warn(`${context}: Missing required field "${key}"`);
      return false;
    }
    if (key in obj && typeof obj[key] !== type && type !== "required") {
      console.warn(
        `${context}: Field "${key}" has wrong type (expected ${type}, got ${typeof obj[key]})`
      );
      return false;
    }
  }

  return true;
}

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff(
  fn,
  maxRetries = 3,
  initialDelay = 100,
  context = ""
) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = initialDelay * Math.pow(2, i);
      console.warn(`${context}: Retry ${i + 1} after ${delay}ms`, error.message);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(
    `${context}: Failed after ${maxRetries} retries: ${lastError.message}`
  );
}

/**
 * Create error context for debugging
 */
export function createErrorContext(error, metadata = {}) {
  return {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...metadata
  };
}

/**
 * Log error to reporting service (stub for future implementation)
 */
export function reportError(error, context = "") {
  const errorContext = createErrorContext(error, { context });
  console.error("📊 Error Report:", errorContext);

  // Future: Send to error tracking service
  // fetch('/api/errors', {
  //   method: 'POST',
  //   body: JSON.stringify(errorContext)
  // }).catch(err => console.error('Failed to report error', err));
}

/**
 * Cleanup handler for graceful shutdown
 */
export function createCleanupHandler(handlers = []) {
  return function cleanup() {
    console.log("🧹 Cleaning up resources...");
    handlers.forEach((handler) => {
      try {
        handler();
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    });
  };
}

/**
 * Monitor performance with automatic reporting
 */
export function monitorPerformance(name, fn) {
  const start = performance.now();
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        if (duration > 100) {
          console.warn(`⏱️  ${name} took ${duration.toFixed(2)}ms`);
        }
      });
    }
    const duration = performance.now() - start;
    if (duration > 100) {
      console.warn(`⏱️  ${name} took ${duration.toFixed(2)}ms`);
    }
    return result;
  } catch (error) {
    console.error(`${name} failed:`, error);
    throw error;
  }
}
