# 🎨 Shared Pixel Board - Enhanced Edition

A collaborative pixel art drawing application with modern architecture, robust error handling, comprehensive performance monitoring, and Firebase real-time synchronization.

## ✨ Features

### Core Drawing
- **📐 Multi-Layer Support**: Independent drawing layers with full editing capabilities
- **🎨 Professional Tools**: Pencil, eraser, fill bucket, and more
- **⏱️ History Management**: Undo/redo with complete operation history
- **🎯 Color Validation**: Strict `#RRGGBB` format with client-side validation

### Real-Time Collaboration
- **🔄 Real-time sync** using Firebase listeners
- **📊 Last-write-wins** pixel updates
- **⏱️ Configurable cooldowns** (1s / 3s / 5s)
- **🚫 No-op write blocking** (skip unchanged color writes)
- **👥 Live user count** via presence tracking

### Performance & Reliability
- **📊 Performance Monitoring**: Real-time FPS tracking and memory profiling
- **🛡️ Error Boundaries**: Graceful error handling with detailed reporting
- **🚀 Optimized Rendering**: Frame-synchronized rendering with debouncing
- **📦 Modular Architecture**: Clean separation of concerns
- **🔍 Grid Overlay**: Optional visual grid for precision

## 🏗️ Project Structure

```
src/
├── core/                    # Core functionality
│   ├── state.js            # Global state management
│   ├── math.js             # Mathematical utilities
│   └── canvas.js           # Rendering engine
├── tools/                   # Drawing tools
│   └── tool-manager.js     # Tool abstraction
├── ui/                     # User interface
│   ├── events.js           # Event handling
│   └── controls.js         # UI controls
├── utils/                  # Utilities
│   ├── error-boundaries.js # Error handling
│   ├── event-utilities.js  # Event delegation
│   ├── render-loop.js      # Frame management
│   └── performance.js      # Performance monitoring
├── app.js                  # Application entry point
└── index.html              # HTML template

dist/                       # Built output
build.sh                    # Build script
ARCHITECTURE.md            # Architecture & implementation guide
BEST_PRACTICES.md          # Development guidelines
```

## 🚀 Quick Start

### Installation

```bash
cd games/shared-pixel-board
open index.html  # or use a local server
```

### Building

```bash
./build.sh
# Output: dist/app.bundle.js
```

## 📚 Documentation

### Essential Guides

1. **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and patterns
   - Modular architecture (Core, Tools, UI, Utils layers)
   - Error handling strategy (prevention, detection, recovery)
   - Performance optimization techniques
   - State management with EventEmitter
   - Testing patterns

2. **[BEST_PRACTICES.md](BEST_PRACTICES.md)** - Development guidelines
   - Code organization principles
   - Error handling patterns
   - Performance optimization tips
   - State management best practices
   - Common pitfalls to avoid

## 🔧 Firebase Setup

### Initial Setup

1. Create a Firebase project.
2. Enable Realtime Database.
3. Confirm config is present in [app.js](app.js).
4. Deploy Firebase rules from [firebase-rules.json](firebase-rules.json).
5. Deploy to GitHub Pages.

### Deploy Rules

```bash
firebase login
firebase use project-6657144175400685165
cp ./games/shared-pixel-board/firebase-rules.json ./database.rules.json
echo '{"database":{"rules":"database.rules.json"}}' > firebase.json
firebase deploy --only database
```

Or manually via Firebase Console: paste the JSON from [firebase-rules.json](firebase-rules.json) into Realtime Database Rules.

### Security Rules

Rules enforce:
- Strict pixel key format (`x_y`)
- Strict color value format (`#RRGGBB`)
- Limited metadata shape
- Presence key and timestamp validation
- Deny-all fallback for unknown paths

## 💡 Usage Examples

### Drawing Operations

```javascript
import { state } from './core/state.js';
import { ToolManager } from './tools/tool-manager.js';

const tools = new ToolManager(state);

// Select tool and draw
tools.selectTool('pencil');
tools.commitPixels(
  [{ x: 10, y: 20 }, { x: 11, y: 20 }],
  '#FF5500'
);

// Listen for changes
state.on('pixels-changed', (pixels) => {
  console.log(`${pixels.length} pixels updated`);
});
```

### Event Handling with Debouncing

```javascript
import { EventDelegator, debounceHandler } from './utils/event-utilities.js';

const delegator = new EventDelegator();

const handleMouseMove = debounceHandler((e) => {
  const x = e.clientX;
  const y = e.clientY;
  tools.drawAt(x, y);
}, 20); // Debounce to 20ms intervals

canvas.addEventListener('mousemove', handleMouseMove);

// Cleanup event listeners
window.addEventListener('beforeunload', () => {
  delegator.cleanup();
});
```

### Performance Monitoring

```javascript
import { RenderLoopManager } from './utils/render-loop.js';

const loop = new RenderLoopManager((deltaTime) => {
  renderer.render();
});

loop.start();

// Monitor FPS
setInterval(() => {
  const { fps, avgFrameTime } = loop.getMetrics();
  console.log(`FPS: ${fps} | Avg: ${avgFrameTime}ms`);
  
  if (fps < 30) {
    console.warn('⚠️  Low FPS - possible performance issue');
  }
}, 1000);
```

### Error Handling

```javascript
import { safeExecute, retryWithBackoff } from './utils/error-boundaries.js';

// Safe operation with fallback
const result = safeExecute(
  () => complexCalculation(),
  null,  // fallback
  'complex-calculation'
);

// Retry with exponential backoff
await retryWithBackoff(
  async () => saveToServer(),
  3,      // max retries
  100,    // initial delay
  'save-to-server'
);
```

## 📊 Performance Metrics

### FPS Tracking

```javascript
const metrics = loop.getMetrics();
// {
//   fps: 60,
//   avgFrameTime: "16.67",
//   frameCount: 1234,
//   running: true
// }
```

### Memory Profiling

```javascript
const memory = new MemoryTracker();
memory.snapshot('before');
await performOperation();
memory.snapshot('after');

const delta = memory.getDelta('before', 'after');
// {
//   timeDelta: 150,
//   heapDelta: 2097152,
//   heapPercent: "5.23"
// }
```

## 🧪 Testing

### Unit Test Example

```javascript
// Test state initialization
const state = new PixelBoardState();
assert(state.layers.length === 1);
assert(state.activeLayerId !== null);

// Test drawing
tools.commitPixels([{ x: 0, y: 0 }], '#FF0000');
assert(state.getPixel(0, 0) === '#FF0000');
```

### Integration Test Example

```javascript
// Test full workflow with undo/redo
tools.selectTool('pencil');
tools.commitPixels([{ x: 0, y: 0 }], '#FF0000');

state.undo();
assert(!state.getPixel(0, 0), 'Undo should remove pixel');

state.redo();
assert(state.getPixel(0, 0) === '#FF0000', 'Redo should restore');
```

## 🐛 Debugging

### Enable Debug Mode

```javascript
const DEBUG = true;

if (DEBUG) {
  state.on('*', (event) => {
    console.log('[STATE]', event);
  });
  
  setInterval(() => {
    console.log('Metrics:', loop.getReport());
  }, 5000);
}
```

### Browser Console

```javascript
// Access internals
window.debug = { state, tools, loop, monitor };

// Then:
debug.loop.getMetrics()
debug.state.layers
debug.monitor.printSummary()
```

## ⚠️ Error Recovery

Three-tier error handling:

1. **Prevention**: Input validation at boundaries
2. **Detection**: Try-catch at critical points
3. **Recovery**: Graceful degradation with messages

If errors occur:
1. Check browser console for error message
2. Note the operation that failed
3. Reload the page
4. Clear browser cache if issues persist

## 🚀 Deployment Checklist

- [ ] Build completes without errors
- [ ] Bundle size < 100KB
- [ ] No console errors on load
- [ ] FPS stays > 30
- [ ] Memory usage stable
- [ ] All features work
- [ ] Tested in multiple browsers
- [ ] Firebase rules deployed

## 📈 Future Improvements

- [ ] WebGL rendering for large canvases
- [ ] Collaborative real-time layer support
- [ ] Layer effects and filters
- [ ] Animation timeline
- [ ] Export to PNG/GIF
- [ ] Keyboard shortcuts
- [ ] Custom brush shapes
- [ ] Dark mode

## 🤝 Contributing

When adding features:

1. Follow [BEST_PRACTICES.md](BEST_PRACTICES.md) guidelines
2. Maintain consistent error handling
3. Add performance monitoring for critical paths
4. Clean up event listeners properly
5. Test with realistic data
6. Update documentation

## 🎓 Learning Resources

- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Event Handling](https://developer.mozilla.org/en-US/docs/Web/Guide/Events)
- [Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [JavaScript Patterns](https://www.patterns.dev/posts/module-pattern/)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)

---

**Made with ❤️ for pixel artists everywhere** 🎨
