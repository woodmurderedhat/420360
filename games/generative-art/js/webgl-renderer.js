/**
 * webgl-renderer.js - WebGL rendering for the Generative Art Studio
 * Provides WebGL-accelerated rendering for complex effects
 */

// WebGL context and state
let gl = null;
let canvas = null;
let isInitialized = false;
let particleProgram = null;
let gradientProgram = null;

// Shader sources
const VERTEX_SHADER_SOURCE = `
    attribute vec2 a_position;
    attribute vec4 a_color;
    attribute float a_size;

    uniform vec2 u_resolution;
    uniform float u_time;

    varying vec4 v_color;

    void main() {
        // Convert position from pixels to 0.0 to 1.0
        vec2 zeroToOne = a_position / u_resolution;

        // Convert from 0->1 to 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;

        // Convert from 0->2 to -1->+1 (clipspace)
        vec2 clipSpace = zeroToTwo - 1.0;

        // Flip Y coordinate
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

        // Set the point size
        gl_PointSize = a_size;

        // Pass color to fragment shader
        v_color = a_color;
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    precision mediump float;

    varying vec4 v_color;

    void main() {
        // Get distance from center of point
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);

        // Discard pixels outside of circle
        if (dist > 0.5) {
            discard;
        }

        // Apply soft edge
        float alpha = smoothstep(0.5, 0.4, dist);

        // Output color with soft edge
        gl_FragColor = v_color * alpha;
    }
`;

const GRADIENT_VERTEX_SHADER_SOURCE = `
    attribute vec2 a_position;

    uniform vec2 u_resolution;

    varying vec2 v_position;

    void main() {
        // Convert position from pixels to 0.0 to 1.0
        vec2 zeroToOne = a_position / u_resolution;

        // Convert from 0->1 to 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;

        // Convert from 0->2 to -1->+1 (clipspace)
        vec2 clipSpace = zeroToTwo - 1.0;

        // Flip Y coordinate
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

        // Pass position to fragment shader
        v_position = a_position / u_resolution;
    }
`;

const GRADIENT_FRAGMENT_SHADER_SOURCE = `
    precision mediump float;

    uniform vec4 u_color1;
    uniform vec4 u_color2;
    uniform vec4 u_color3;
    uniform vec2 u_resolution;
    uniform float u_time;

    varying vec2 v_position;

    void main() {
        // Create a complex gradient based on position and time
        float t = v_position.x + v_position.y + sin(u_time * 0.001) * 0.1;

        vec4 color;
        if (t < 0.5) {
            // Mix between color1 and color2
            color = mix(u_color1, u_color2, t * 2.0);
        } else {
            // Mix between color2 and color3
            color = mix(u_color2, u_color3, (t - 0.5) * 2.0);
        }

        gl_FragColor = color;
    }
`;

/**
 * Initialize WebGL renderer
 * @param {HTMLCanvasElement} targetCanvas - The canvas to render to
 * @returns {boolean} Whether initialization was successful
 */
function initWebGL(targetCanvas) {
    // Don't initialize twice
    if (isInitialized) return true;

    // Store canvas reference
    canvas = targetCanvas;

    // Try to get WebGL context
    try {
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch (e) {
        console.warn('WebGL initialization failed:', e);
        return false;
    }

    // Check if WebGL is supported
    if (!gl) {
        console.warn('WebGL not supported, falling back to Canvas 2D API');
        return false;
    }

    // Initialize shaders
    if (!initShaders()) {
        console.warn('WebGL shader initialization failed');
        return false;
    }

    isInitialized = true;
    console.log('WebGL initialized successfully');
    return true;
}

/**
 * Initialize WebGL shaders
 * @returns {boolean} Whether initialization was successful
 */
function initShaders() {
    try {
        // Create particle program
        particleProgram = createProgram(VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
        if (!particleProgram) return false;

        // Create gradient program
        gradientProgram = createProgram(GRADIENT_VERTEX_SHADER_SOURCE, GRADIENT_FRAGMENT_SHADER_SOURCE);
        if (!gradientProgram) return false;

        return true;
    } catch (e) {
        console.error('Error initializing shaders:', e);
        return false;
    }
}

/**
 * Create a WebGL program from vertex and fragment shader sources
 * @param {string} vertexShaderSource - The vertex shader source
 * @param {string} fragmentShaderSource - The fragment shader source
 * @returns {WebGLProgram} The created program
 */
function createProgram(vertexShaderSource, fragmentShaderSource) {
    // Create shaders
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return null;

    // Create program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Check if linking succeeded
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to link program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

/**
 * Create a shader from source
 * @param {number} type - The shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
 * @param {string} source - The shader source
 * @returns {WebGLShader} The created shader
 */
function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Check if compilation succeeded
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/**
 * Check if WebGL is available
 * @returns {boolean} Whether WebGL is available
 */
function isWebGLAvailable() {
    return isInitialized && gl !== null;
}

/**
 * Render particles using WebGL
 * @param {Array} particles - Array of particle objects
 * @param {number} time - Current time for animation
 */
function renderParticles(particles, time) {
    if (!isInitialized || !gl) return;

    // Use particle program
    gl.useProgram(particleProgram);

    // Get attribute locations
    const positionLocation = gl.getAttribLocation(particleProgram, 'a_position');
    const colorLocation = gl.getAttribLocation(particleProgram, 'a_color');
    const sizeLocation = gl.getAttribLocation(particleProgram, 'a_size');

    // Get uniform locations
    const resolutionLocation = gl.getUniformLocation(particleProgram, 'u_resolution');
    const timeLocation = gl.getUniformLocation(particleProgram, 'u_time');

    // Set uniforms
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, time);

    // Create buffers
    const positionBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    const sizeBuffer = gl.createBuffer();

    // Prepare data
    const positions = new Float32Array(particles.length * 2);
    const colors = new Float32Array(particles.length * 4);
    const sizes = new Float32Array(particles.length);

    // Fill data arrays
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        positions[i * 2] = p.x;
        positions[i * 2 + 1] = p.y;

        colors[i * 4] = p.r / 255;
        colors[i * 4 + 1] = p.g / 255;
        colors[i * 4 + 2] = p.b / 255;
        colors[i * 4 + 3] = p.a !== undefined ? p.a : 1.0;

        sizes[i] = p.size !== undefined ? p.size : 5.0;
    }

    // Upload position data
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Upload color data
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

    // Upload size data
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(sizeLocation);
    gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 0, 0);

    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Draw points
    gl.drawArrays(gl.POINTS, 0, particles.length);

    // Clean up
    gl.disableVertexAttribArray(positionLocation);
    gl.disableVertexAttribArray(colorLocation);
    gl.disableVertexAttribArray(sizeLocation);
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(colorBuffer);
    gl.deleteBuffer(sizeBuffer);
}

/**
 * Render a gradient using WebGL
 * @param {Array} colors - Array of colors (each with r, g, b, a properties)
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} time - Current time for animation
 * @param {number} gradientType - Type of gradient (0: linear, 1: radial, 2: conic)
 */
function renderGradient(colors, width, height, time, gradientType = 0) {
    if (!isInitialized || !gl) return;

    // Use gradient program
    gl.useProgram(gradientProgram);

    // Get attribute locations
    const positionLocation = gl.getAttribLocation(gradientProgram, 'a_position');

    // Get uniform locations
    const resolutionLocation = gl.getUniformLocation(gradientProgram, 'u_resolution');
    const timeLocation = gl.getUniformLocation(gradientProgram, 'u_time');
    const color1Location = gl.getUniformLocation(gradientProgram, 'u_color1');
    const color2Location = gl.getUniformLocation(gradientProgram, 'u_color2');
    const color3Location = gl.getUniformLocation(gradientProgram, 'u_color3');

    // Set uniforms
    gl.uniform2f(resolutionLocation, width, height);
    gl.uniform1f(timeLocation, time);

    // Set color uniforms (ensure we have at least 3 colors)
    const color1 = colors[0] || { r: 0, g: 0, b: 0, a: 1 };
    const color2 = colors[1] || color1;
    const color3 = colors[2] || color2;

    gl.uniform4f(color1Location, color1.r / 255, color1.g / 255, color1.b / 255, color1.a !== undefined ? color1.a : 1.0);
    gl.uniform4f(color2Location, color2.r / 255, color2.g / 255, color2.b / 255, color2.a !== undefined ? color2.a : 1.0);
    gl.uniform4f(color3Location, color3.r / 255, color3.g / 255, color3.b / 255, color3.a !== undefined ? color3.a : 1.0);

    // Create position buffer for a full-screen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Create a full-screen quad
    const positions = new Float32Array([
        0, 0,
        width, 0,
        0, height,
        0, height,
        width, 0,
        width, height
    ]);

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Draw the quad
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Clean up
    gl.disableVertexAttribArray(positionLocation);
    gl.deleteBuffer(positionBuffer);
}

/**
 * Initialize WebGL renderer with additional shader support for new visual effects
 * @param {HTMLCanvasElement} canvas - The canvas element for WebGL rendering
 * @returns {Object} WebGL context and utility functions
 */
function initWebGLRenderer(canvas) {
    // Initialize WebGL context with antialiasing
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: true });
    if (!gl) {
        throw new Error('WebGL2 not supported');
    }
    
    // Initialize shader programs
    const shaderPrograms = {
        basic: createBasicShaderProgram(gl),
        bloom: createBloomShaderProgram(gl),
        depthEffect: createDepthShaderProgram(gl),
        distortion: createDistortionShaderProgram(gl)
    };
    
    // Additional WebGL state and utilities
    return {
        gl,
        shaderPrograms,
        applyBloomEffect,
        applyDepthEffect,
        applyDistortionEffect,
        cleanup
    };
}

/**
 * Apply bloom/glow effect to rendered scene
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {WebGLTexture} inputTexture - Input texture with the scene
 * @param {Object} params - Effect parameters (intensity, threshold, etc.)
 * @returns {WebGLTexture} Output texture with bloom applied
 */
function applyBloomEffect(gl, inputTexture, params = {}) {
    // Implementation for bloom effect
    // ...
}

/**
 * Apply depth effect to rendered scene
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {WebGLTexture} inputTexture - Input texture with the scene
 * @param {Object} params - Effect parameters (depth, focus, etc.)
 * @returns {WebGLTexture} Output texture with depth effect applied
 */
function applyDepthEffect(gl, inputTexture, params = {}) {
    // Implementation for depth effect
    // ...
}

/**
 * Apply distortion/wave effect to rendered scene
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {WebGLTexture} inputTexture - Input texture with the scene
 * @param {Object} params - Effect parameters (amplitude, frequency, etc.)
 * @returns {WebGLTexture} Output texture with distortion applied
 */
function applyDistortionEffect(gl, inputTexture, params = {}) {
    // Implementation for distortion effect
    // ...
}

/**
 * Create shader programs for the basic renderer
 * @param {WebGLRenderingContext} gl - WebGL context
 * @returns {WebGLProgram} Compiled and linked shader program
 */
function createBasicShaderProgram(gl) {
    // Implementation for basic shader program
    // ...
}

// Additional shader program creation functions
// ...

/**
 * Clean up WebGL resources
 */
function cleanup() {
    // Resource cleanup implementation
    // ...
}

// Export WebGL functions
export {
    initWebGL,
    isWebGLAvailable,
    renderParticles,
    renderGradient,
    initWebGLRenderer,
    applyBloomEffect,
    applyDepthEffect,
    applyDistortionEffect,
    cleanup
};
