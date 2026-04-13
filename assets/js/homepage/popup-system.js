export function createPopupSystem({
  state,
  config,
  ads,
  iconData,
  popupColorSchemes,
  escapeHtml,
  onOpenOracle,
  getGlitchContext
}) {
  const POPUP_GLITCH_COOLDOWN_MS = 220;
  let lastPopupGlitchOutAt = 0;

  const spawnEffects = [
    { cls: 'spawn-glitch-snap', weight: 1 },
    { cls: 'spawn-glitch-warp', weight: 1 },
    { cls: 'spawn-glitch-scan', weight: 1 },
    { cls: 'spawn-glitch-ghost', weight: 1 }
  ];

  const despawnEffects = [
    { cls: 'glitch-out', dur: 400, weight: 1 },
    { cls: 'glitch-fade', dur: 500, weight: 1 },
    { cls: 'glitch-slide', dur: 420, weight: 1 },
    { cls: 'glitch-scale', dur: 350, weight: 1 },
    { cls: 'glitch-scanout', dur: 460, weight: 1 },
    { cls: 'glitch-shatter', dur: 370, weight: 1 },
    { cls: 'glitch-implode', dur: 390, weight: 1 }
  ];

  function rectsOverlap(x, y, w, h, el) {
    const r = el.getBoundingClientRect();
    return !(x + w < r.left || x > r.right || y + h < r.top || y > r.bottom);
  }

  function weightedPick(entries) {
    const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
    if (!total) return entries[0];
    let cursor = Math.random() * total;
    for (const entry of entries) {
      cursor -= entry.weight;
      if (cursor <= 0) return entry;
    }
    return entries[entries.length - 1];
  }

  function readGlitchContext() {
    if (typeof getGlitchContext === 'function') {
      try {
        return getGlitchContext();
      } catch (_error) {
        return null;
      }
    }

    const engine = window.glitchEngineV2;
    if (!engine) return null;

    if (typeof engine.getRecentTriggerContext === 'function') {
      const recent = engine.getRecentTriggerContext();
      if (recent) return recent;
    }

    if (typeof engine.getDiagnostics === 'function') {
      return engine.getDiagnostics();
    }

    return null;
  }

  function pickHarmonyGlitchEffect() {
    const effects = despawnEffects.map((entry) => ({ ...entry }));

    const context = readGlitchContext();
    if (!context) return { effect: effects[Math.floor(Math.random() * effects.length)], speed: 1 };

    const triggerType = context.triggerType || context.lastTriggerType || '';
    const triggerAgeMs = Number.isFinite(context.ageMs)
      ? context.ageMs
      : Number.isFinite(context.millisSinceLastTrigger)
        ? context.millisSinceLastTrigger
        : Number.POSITIVE_INFINITY;
    const energetic = triggerType === 'moveSwipe'
      || triggerType === 'moveWhip'
      || triggerType === 'moveSurge'
      || triggerType === 'click';
    const calm = triggerType === 'ambient'
      || triggerType === 'move'
      || triggerType === 'moveStall'
      || triggerType === 'scrollUp'
      || triggerType === 'scrollDown';

    if (triggerAgeMs < 380 && energetic) {
      effects[0].weight += 0.75;
      effects[2].weight += 1.2;
      effects[3].weight += 1.05;
      effects[5].weight += 1.1;
      effects[1].weight -= 0.35;
    } else if (triggerAgeMs < 380 && calm) {
      effects[0].weight += 0.4;
      effects[1].weight += 1.15;
      effects[4].weight += 0.8;
      effects[2].weight -= 0.2;
      effects[3].weight -= 0.25;
      effects[5].weight -= 0.2;
    }

    const brightnessTrend = Number(context.brightnessTrend) || 0;
    if (brightnessTrend > 0.6) {
      effects[0].weight += 0.3;
      effects[2].weight += 0.35;
      effects[6].weight += 0.7;
    } else if (brightnessTrend < -0.45) {
      effects[1].weight += 0.45;
      effects[4].weight += 0.35;
      effects[3].weight -= 0.2;
    }

    const qualityTier = context.qualityTier || '';
    if (state.reducedMotion || qualityTier === 'low') {
      effects[1].weight += 0.35;
      effects[2].weight *= 0.75;
      effects[3].weight *= 0.7;
    }

    effects.forEach((entry) => {
      entry.weight = Math.max(0.15, entry.weight);
    });

    const speed = triggerAgeMs < 380 && energetic
      ? 0.92
      : triggerAgeMs < 380 && calm
        ? 1.08
        : 1;

    return {
      effect: weightedPick(effects),
      speed
    };
  }

  function pickSpawnGlitchEffect() {
    const effects = spawnEffects.map((entry) => ({ ...entry }));
    const context = readGlitchContext();
    let speed = 1;

    if (context) {
      const triggerType = context.triggerType || context.lastTriggerType || '';
      const triggerAgeMs = Number.isFinite(context.ageMs)
        ? context.ageMs
        : Number.isFinite(context.millisSinceLastTrigger)
          ? context.millisSinceLastTrigger
          : Number.POSITIVE_INFINITY;
      const energetic = triggerType === 'moveSwipe'
        || triggerType === 'moveWhip'
        || triggerType === 'moveSurge'
        || triggerType === 'click';

      if (triggerAgeMs < 380 && energetic) {
        effects[0].weight += 0.7;
        effects[1].weight += 1;
        effects[3].weight -= 0.2;
        speed = 0.95;
      } else if (triggerAgeMs < 380) {
        effects[2].weight += 0.7;
        effects[3].weight += 0.4;
        speed = 1.05;
      }

      const brightnessTrend = Number(context.brightnessTrend) || 0;
      if (brightnessTrend < -0.35) {
        effects[3].weight += 0.45;
      }

      const qualityTier = context.qualityTier || '';
      if (state.reducedMotion || qualityTier === 'low') {
        effects[1].weight *= 0.7;
        speed = Math.max(speed, 1.05);
      }
    }

    effects.forEach((entry) => {
      entry.weight = Math.max(0.15, entry.weight);
    });

    return {
      effect: weightedPick(effects),
      speed
    };
  }

  function findNonOverlappingPosition() {
    const w = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--popup-w')) || 250;
    const h = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--popup-h')) || 150;
    const maxX = Math.max(0, window.innerWidth - w);
    const maxY = Math.max(0, window.innerHeight - h);

    for (let i = 0; i < config.NON_OVERLAP_ATTEMPTS; i++) {
      const x = Math.floor(Math.random() * (maxX + 1));
      const y = Math.floor(Math.random() * (maxY + 1));
      let collides = false;

      for (const existing of state.activePopups) {
        if (!existing || !existing.getBoundingClientRect) continue;
        if (rectsOverlap(x, y, w, h, existing)) {
          collides = true;
          break;
        }
      }
      if (!collides) return { x, y };
    }

    return {
      x: Math.floor(Math.random() * (maxX + 1)),
      y: Math.floor(Math.random() * (maxY + 1))
    };
  }

  function removePopupElement(el) {
    if (!el) return;
    const idx = state.activePopups.indexOf(el);
    if (idx !== -1) state.activePopups.splice(idx, 1);
    if (el.parentNode) el.parentNode.removeChild(el);
  }

  function despawnPopup(popup, options = {}) {
    if (!popup || !popup.parentNode) return;
    if (popup.dataset.despawning === '1') return;

    const now = Date.now();
    const { force = false, respectCooldown = false } = options;
    if (respectCooldown && !force && now - lastPopupGlitchOutAt < POPUP_GLITCH_COOLDOWN_MS) return;

    const activeDespawnClasses = despawnEffects.map((entry) => entry.cls);
    if (activeDespawnClasses.some((cls) => popup.classList.contains(cls))) return;

    const harmony = pickHarmonyGlitchEffect();
    popup.dataset.despawning = '1';
    popup.style.setProperty('--popup-glitch-speed', String(harmony.speed));
    popup.classList.add(harmony.effect.cls);
    lastPopupGlitchOutAt = now;
    setTimeout(() => removePopupElement(popup), harmony.effect.dur);
  }

  function makePopup(ad) {
    const p = document.createElement('div');
    p.className = 'popup';
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', `Popup: ${ad.label}`);

    const spawn = pickSpawnGlitchEffect();
    p.classList.add(spawn.effect.cls);
    p.style.setProperty('--popup-spawn-speed', String(spawn.speed));

    const rotation = (Math.random() * 12 - 6).toFixed(2) + 'deg';
    const scale = (1 + (Math.random() * 0.08 - 0.04)).toFixed(3);
    p.style.setProperty('--rotation', rotation);
    p.style.transform = `scale(${scale}) rotate(${rotation})`;

    const selectedScheme = popupColorSchemes[Math.floor(Math.random() * popupColorSchemes.length)];
    p.style.setProperty('--bg', selectedScheme.bg);
    p.style.setProperty('--primary', selectedScheme.primary);
    p.style.setProperty('--secondary', selectedScheme.secondary);
    p.style.setProperty('--highlight', selectedScheme.highlight);

    const pos = findNonOverlappingPosition();
    p.style.left = pos.x + 'px';
    p.style.top = pos.y + 'px';

    p.innerHTML = `
      <div class="titlebar" role="presentation">
        <div class="left">
          <img src="${iconData}" alt="" aria-hidden="true">
          <span>${escapeHtml(ad.label)}</span>
        </div>
        <div class="close" role="button" aria-label="Close popup" tabindex="0">×</div>
      </div>
      <div class="content">
        <a href="${escapeHtml(ad.href)}" target="_blank" rel="noopener noreferrer" data-ad-link>
          <img src="${escapeHtml(ad.gif)}" alt="${escapeHtml(ad.label)} animation" loading="lazy">
        </a>
      </div>
    `;

    const closeBtn = p.querySelector('.close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      despawnPopup(p, { force: true });
    });
    closeBtn.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        despawnPopup(p, { force: true });
      }
    });

    document.body.appendChild(p);

    const link = p.querySelector('[data-ad-link]');
    if (ad.href === '__INTERNAL_ORACLE__' && link) {
      link.removeAttribute('target');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        onOpenOracle();
      });
    }

    state.activePopups.push(p);
    setTimeout(() => despawnPopup(p, { force: true }), config.POPUP_LIFETIME_MS);

    // Clear spawn class after entrance to keep only one active animation phase.
    setTimeout(() => {
      p.classList.remove('spawn-glitch-snap', 'spawn-glitch-warp', 'spawn-glitch-scan', 'spawn-glitch-ghost');
      p.style.removeProperty('--popup-spawn-speed');
    }, 700);

    while (state.activePopups.length > config.MAX_POPUPS) {
      const old = state.activePopups.shift();
      if (old && old.parentNode) {
        despawnPopup(old, { force: true });
      }
    }

    return p;
  }

  function spawnPopup() {
    if (state.popupsPaused) return null;
    
    // Check Micro Settings popup intensity
    const microPopupIntensity = state.microSettings?.popupIntensity ?? 100;
    if (microPopupIntensity === 0) return null; // Popups completely disabled
    if (microPopupIntensity < 100) {
      // Roll probability based on intensity percentage
      const chance = microPopupIntensity / 100;
      if (Math.random() > chance) return null;
    }
    
    const ad = ads[Math.floor(Math.random() * ads.length)];
    const p = makePopup(ad);
    if (window.playAdSfx) window.playAdSfx();
    return p;
  }

  function randomPopupGlitchOut() {
    if (!state.activePopups.length) return;

    const popup = state.activePopups[Math.floor(Math.random() * state.activePopups.length)];
    if (!popup) return;

    despawnPopup(popup, { respectCooldown: true });
  }

  return {
    rectsOverlap,
    findNonOverlappingPosition,
    removePopupElement,
    makePopup,
    spawnPopup,
    randomPopupGlitchOut
  };
}
