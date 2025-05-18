/**
 * worker-manager.js - Manages Web Workers for the Generative Art Studio
 * Handles worker creation, task distribution, and result handling
 */

// Maximum number of workers to create
const MAX_WORKERS = navigator.hardwareConcurrency || 4;

// Worker pool
let workers = [];
let isInitialized = false;

// Task queue and tracking
let taskQueue = [];
let taskCallbacks = new Map();
let taskCounter = 0;

/**
 * Initialize the worker pool
 */
function initWorkers() {
    if (isInitialized) return;
    
    // Check if Web Workers are supported
    if (!window.Worker) {
        console.warn('Web Workers are not supported in this browser. Falling back to main thread processing.');
        return;
    }
    
    // Create workers
    const workerCount = Math.min(MAX_WORKERS, 4); // Limit to 4 workers max
    for (let i = 0; i < workerCount; i++) {
        try {
            const worker = new Worker('js/worker.js'); // Adjusted path for GitHub Pages
            
            // Set up message handler
            worker.onmessage = handleWorkerMessage;
            worker.onerror = handleWorkerError;
            
            // Add to pool
            workers.push({
                worker,
                busy: false
            });
        } catch (error) {
            console.error('Error creating worker:', error);
        }
    }
    
    isInitialized = true;
    console.log(`Initialized ${workers.length} workers`);
    
    // Process any queued tasks
    processQueue();
}

/**
 * Handle messages from workers
 * @param {MessageEvent} e - The message event
 */
function handleWorkerMessage(e) {
    const { type, result, taskId } = e.data;
    
    // Find the worker that sent this message
    const workerInfo = workers.find(w => w.worker === e.target);
    if (workerInfo) {
        workerInfo.busy = false;
    }
    
    // Get the callback for this task
    if (taskId && taskCallbacks.has(taskId)) {
        const { resolve, reject } = taskCallbacks.get(taskId);
        
        if (type === 'error') {
            reject(new Error(e.data.message));
        } else {
            resolve(result);
        }
        
        // Remove the callback
        taskCallbacks.delete(taskId);
    }
    
    // Process next task in queue
    processQueue();
}

/**
 * Handle worker errors
 * @param {ErrorEvent} error - The error event
 */
function handleWorkerError(error) {
    console.error('Worker error:', error);
    
    // Find the worker that had an error
    const workerInfo = workers.find(w => w.worker === error.target);
    if (workerInfo) {
        workerInfo.busy = false;
    }
    
    // Process next task in queue
    processQueue();
}

/**
 * Process the task queue
 */
function processQueue() {
    if (taskQueue.length === 0) return;
    
    // Find an available worker
    const availableWorker = workers.find(w => !w.busy);
    if (!availableWorker) return;
    
    // Get the next task
    const task = taskQueue.shift();
    availableWorker.busy = true;
    
    // Send the task to the worker
    availableWorker.worker.postMessage({
        type: task.type,
        data: task.data,
        taskId: task.id
    }, task.transferables || []);
}

/**
 * Add a task to the queue
 * @param {string} type - The task type
 * @param {Object} data - The task data
 * @param {Array} transferables - Transferable objects
 * @returns {Promise} A promise that resolves with the task result
 */
function addTask(type, data, transferables = []) {
    return new Promise((resolve, reject) => {
        // Create a unique task ID
        const taskId = taskCounter++;
        
        // Add the task to the queue
        taskQueue.push({
            id: taskId,
            type,
            data,
            transferables
        });
        
        // Store the callbacks
        taskCallbacks.set(taskId, { resolve, reject });
        
        // Process the queue
        processQueue();
    });
}

/**
 * Generate Voronoi cells using a worker
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} numPoints - Number of Voronoi points
 * @param {string} seed - Random seed
 * @returns {Promise<Object>} A promise that resolves with the Voronoi cell data
 */
function generateVoronoiCells(width, height, numPoints, seed) {
    // Initialize workers if needed
    if (!isInitialized) initWorkers();
    
    // If no workers are available, fall back to main thread
    if (workers.length === 0) {
        // Implement fallback here
        return Promise.reject(new Error('No workers available'));
    }
    
    // Add the task to the queue
    return addTask('voronoi', { width, height, numPoints, seed });
}

/**
 * Generate noise texture using a worker
 * @param {number} width - Texture width
 * @param {number} height - Texture height
 * @param {number} scale - Noise scale
 * @param {string} seed - Random seed
 * @returns {Promise<Uint8ClampedArray>} A promise that resolves with the noise texture data
 */
function generateNoiseTexture(width, height, scale, seed) {
    // Initialize workers if needed
    if (!isInitialized) initWorkers();
    
    // If no workers are available, fall back to main thread
    if (workers.length === 0) {
        // Implement fallback here
        return Promise.reject(new Error('No workers available'));
    }
    
    // Add the task to the queue
    return addTask('noise', { width, height, scale, seed });
}

/**
 * Terminate all workers
 */
function terminateWorkers() {
    workers.forEach(workerInfo => {
        workerInfo.worker.terminate();
    });
    
    workers = [];
    isInitialized = false;
    console.log('All workers terminated');
}

// Export worker functions
export {
    initWorkers,
    generateVoronoiCells,
    generateNoiseTexture,
    terminateWorkers
};
