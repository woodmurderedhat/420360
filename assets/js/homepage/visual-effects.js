export function createVisualEffects({ state }) {
  let controlChaosInterval = null;
  let controlChaosPulseTimeout = null;
  let colorChaosInterval = null;
  const chaosIntervals = new WeakMap();

  function getControlButtons() {
    return document.querySelectorAll('#taskbar .ctrl-btn, #start-menu .ctrl-btn');
  }

  function randomizeColors() {
    const root = document.documentElement;

    const baseHue = Math.floor(Math.random() * 360);
    const randPct = (min, max) => min + Math.random() * (max - min);
    const primary = `hsl(${baseHue}, ${randPct(40,80)}%, ${randPct(30,60)}%)`;
    const secondary = `hsl(${(baseHue + 60) % 360}, ${randPct(40,80)}%, ${randPct(30,60)}%)`;
    const highlight = `hsl(${(baseHue + 120) % 360}, ${randPct(50,100)}%, ${randPct(60,90)}%)`;
    const bgHue = (baseHue + 180 + Math.random() * 60 - 30) % 360;
    const bg = `hsl(${bgHue}, ${randPct(20,40)}%, ${randPct(5,30)}%)`;
    const text = `hsl(${(bgHue + 180) % 360}, ${randPct(20,80)}%, ${randPct(70,95)}%)`;

    root.style.setProperty('--primary', primary);
    root.style.setProperty('--secondary', secondary);
    root.style.setProperty('--highlight', highlight);
    root.style.setProperty('--bg', bg);
    root.style.setProperty('--text', text);
  }

  function startControlButtonChaos() {
    if (controlChaosInterval) clearInterval(controlChaosInterval);
    const CHAOS_INTERVAL = 420;

    function randomTransform() {
      if (state.chillMode) {
        getControlButtons().forEach(btn => {
          btn.style.transform = '';
        });
        return;
      }

      getControlButtons().forEach(btn => {
        const tx = (Math.random() - 0.5) * 12;
        const ty = (Math.random() - 0.5) * 12;
        const rot = (Math.random() - 0.5) * 16;
        const scale = 0.96 + Math.random() * 0.12;
        btn.style.transition = 'transform 0.33s cubic-bezier(.7,-0.3,.7,1.7)';
        btn.style.transform = `translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${scale})`;
      });
    }

    controlChaosInterval = setInterval(randomTransform, CHAOS_INTERVAL);
    randomTransform();
  }

  function stopControlButtonChaos() {
    if (controlChaosInterval) {
      clearInterval(controlChaosInterval);
      controlChaosInterval = null;
    }
    getControlButtons().forEach(btn => {
      btn.style.transform = '';
    });
  }

  function triggerControlChaosPulse(durationMs = 4200) {
    if (state.chillMode) return;
    startControlButtonChaos();
    if (controlChaosPulseTimeout) clearTimeout(controlChaosPulseTimeout);
    controlChaosPulseTimeout = setTimeout(() => {
      stopControlButtonChaos();
      controlChaosPulseTimeout = null;
    }, durationMs);
  }

  function startColorChaos() {
    if (colorChaosInterval) clearInterval(colorChaosInterval);
    const INTERVAL = 1200;
    colorChaosInterval = setInterval(() => {
      if (!state.chillMode) randomizeColors();
    }, INTERVAL + Math.random() * 1800);
  }

  function stopColorChaos() {
    if (colorChaosInterval) {
      clearInterval(colorChaosInterval);
      colorChaosInterval = null;
    }
  }

  function startButtonChaos(btn) {
    if (state.chillMode || chaosIntervals.has(btn)) return;
    const CHAOS_INTERVAL = 420;

    function randomTransform() {
      const tx = (Math.random() - 0.5) * 12;
      const ty = (Math.random() - 0.5) * 12;
      const rot = (Math.random() - 0.5) * 16;
      const scale = 0.96 + Math.random() * 0.12;
      btn.style.transition = 'transform 0.33s cubic-bezier(.7,-0.3,.7,1.7)';
      btn.style.transform = `translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${scale})`;
    }

    const interval = setInterval(randomTransform, CHAOS_INTERVAL);
    chaosIntervals.set(btn, interval);
    randomTransform();
  }

  function stopButtonChaos(btn) {
    const interval = chaosIntervals.get(btn);
    if (interval) {
      clearInterval(interval);
      chaosIntervals.delete(btn);
    }
    btn.style.transform = '';
  }

  function clearAllButtonChaos() {
    getControlButtons().forEach(btn => {
      stopButtonChaos(btn);
    });
    stopControlButtonChaos();
  }

  function onChillModeChanged() {
    if (state.chillMode) {
      clearAllButtonChaos();
    }
  }

  return {
    randomizeColors,
    startControlButtonChaos,
    stopControlButtonChaos,
    triggerControlChaosPulse,
    startColorChaos,
    stopColorChaos,
    startButtonChaos,
    stopButtonChaos,
    clearAllButtonChaos,
    onChillModeChanged
  };
}
