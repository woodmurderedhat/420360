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

  function isPersistentPopup(el) {
    return el?.dataset?.persistent === '1';
  }

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

  function findCenteredPosition(el, options = {}) {
    const viewportMargin = Number.isFinite(options.viewportMargin) ? options.viewportMargin : 12;
    const rect = el.getBoundingClientRect();
    const fallbackWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--popup-w')) || 250;
    const fallbackHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--popup-h')) || 150;
    const width = Math.ceil(rect.width) || fallbackWidth;
    const height = Math.ceil(rect.height) || fallbackHeight;
    const maxX = Math.max(viewportMargin, window.innerWidth - width - viewportMargin);
    const maxY = Math.max(viewportMargin, window.innerHeight - height - viewportMargin);

    return {
      x: Math.max(viewportMargin, Math.min(Math.round((window.innerWidth - width) / 2), maxX)),
      y: Math.max(viewportMargin, Math.min(Math.round((window.innerHeight - height) / 2), maxY))
    };
  }

  function isVisibleElement(el) {
    if (!(el instanceof HTMLElement)) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function getAvoidedElements(options = {}) {
    const selectors = Array.isArray(options.avoidSelectors) ? options.avoidSelectors : [];
    if (!selectors.length) return [];

    const seen = new Set();
    return selectors.flatMap((selector) => {
      try {
        return Array.from(document.querySelectorAll(selector));
      } catch (_error) {
        return [];
      }
    }).filter((el) => {
      if (seen.has(el)) return false;
      seen.add(el);
      return isVisibleElement(el);
    });
  }

  function positionOverlapsElements(x, y, width, height, elements) {
    return elements.some((el) => rectsOverlap(x, y, width, height, el));
  }

  function findCenteredAvoidingPosition(el, options = {}) {
    const viewportMargin = Number.isFinite(options.viewportMargin) ? options.viewportMargin : 12;
    const rect = el.getBoundingClientRect();
    const fallbackWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--popup-w')) || 250;
    const fallbackHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--popup-h')) || 150;
    const width = Math.ceil(rect.width) || fallbackWidth;
    const height = Math.ceil(rect.height) || fallbackHeight;
    const maxX = Math.max(viewportMargin, window.innerWidth - width - viewportMargin);
    const maxY = Math.max(viewportMargin, window.innerHeight - height - viewportMargin);
    const center = findCenteredPosition(el, options);
    const avoidedElements = getAvoidedElements(options);
    if (!avoidedElements.length) return center;

    const clampCandidate = (candidateX, candidateY) => ({
      x: Math.max(viewportMargin, Math.min(candidateX, maxX)),
      y: Math.max(viewportMargin, Math.min(candidateY, maxY))
    });
    const pushCandidate = (list, seen, candidateX, candidateY) => {
      const { x, y } = clampCandidate(candidateX, candidateY);
      const key = `${x}:${y}`;
      if (seen.has(key)) return;
      seen.add(key);
      list.push({ x, y });
    };

    const candidates = [];
    const seenCandidates = new Set();
    pushCandidate(candidates, seenCandidates, center.x, center.y);

    const step = 24;
    const maxRadius = Math.max(window.innerWidth, window.innerHeight);
    for (let radius = step; radius <= maxRadius; radius += step) {
      pushCandidate(candidates, seenCandidates, center.x, center.y - radius);
      pushCandidate(candidates, seenCandidates, center.x, center.y + radius);
      pushCandidate(candidates, seenCandidates, center.x - radius, center.y);
      pushCandidate(candidates, seenCandidates, center.x + radius, center.y);
      pushCandidate(candidates, seenCandidates, center.x - radius, center.y - radius);
      pushCandidate(candidates, seenCandidates, center.x + radius, center.y - radius);
      pushCandidate(candidates, seenCandidates, center.x - radius, center.y + radius);
      pushCandidate(candidates, seenCandidates, center.x + radius, center.y + radius);
    }

    for (const candidate of candidates) {
      if (!positionOverlapsElements(candidate.x, candidate.y, width, height, avoidedElements)) {
        return candidate;
      }
    }

    return center;
  }

  function resolvePopupPosition(el, options = {}) {
    if (options.centered) {
      if (Array.isArray(options.avoidSelectors) && options.avoidSelectors.length) {
        return findCenteredAvoidingPosition(el, options);
      }
      return findCenteredPosition(el, options);
    }
    return findNonOverlappingPosition();
  }

  function removePopupElement(el) {
    if (!el) return;
    if (typeof el.__popupCleanup === 'function') {
      el.__popupCleanup();
      delete el.__popupCleanup;
    }
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

  function normalizePopupAd(ad) {
    if (!ad || typeof ad !== 'object') return null;

    const label = typeof ad.label === 'string' && ad.label.trim()
      ? ad.label.trim()
      : 'POPUP';
    const href = typeof ad.href === 'string' && ad.href.trim()
      ? ad.href.trim()
      : '#';
    const gif = typeof ad.gif === 'string' && ad.gif.trim()
      ? ad.gif.trim()
      : '';
    const asciiArt = typeof ad.asciiArt === 'string' && ad.asciiArt.trim()
      ? ad.asciiArt
      : '';

    if (!gif && !asciiArt) return null;

    return {
      label,
      href,
      gif,
      asciiArt,
      asciiFooter: typeof ad.asciiFooter === 'string' && ad.asciiFooter.trim() ? ad.asciiFooter.trim() : '',
      message: typeof ad.message === 'string' && ad.message.trim() ? ad.message.trim() : '',
      imageAlt: typeof ad.imageAlt === 'string' && ad.imageAlt.trim() ? ad.imageAlt.trim() : `${label} art`,
      variant: typeof ad.variant === 'string' && ad.variant.trim() ? ad.variant.trim() : ''
    };
  }

  function makePopup(ad, options = {}) {
    const normalizedAd = normalizePopupAd(ad);
    if (!normalizedAd) return null;

    const p = document.createElement('div');
    p.className = 'popup';
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', `Popup: ${normalizedAd.label}`);
    if (normalizedAd.variant === 'calendar-ascii') {
      p.classList.add('popup--calendar', 'popup--ascii');
    }
    if (options.centered) {
      p.classList.add('popup--centered');
    }
    if (options.persistent) {
      p.dataset.persistent = '1';
    }

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
    if (Number.isFinite(options.zIndex)) {
      p.style.zIndex = String(options.zIndex);
    }
    p.style.left = '-9999px';
    p.style.top = '-9999px';
    if (options.centered) {
      p.style.visibility = 'hidden';
    }

    const popupMessage = normalizedAd.message
      ? `<p class="popup-copy">${escapeHtml(normalizedAd.message)}</p>`
      : '';
    const popupAsciiFooter = normalizedAd.asciiFooter
      ? `<div class="popup-ascii-footer">${escapeHtml(normalizedAd.asciiFooter)}</div>`
      : '';
    const popupMedia = normalizedAd.asciiArt
      ? `
        <div class="popup-ascii-stack">
          <a href="${escapeHtml(normalizedAd.href)}" target="_blank" rel="noopener noreferrer" class="popup-ascii-link" data-ad-link aria-label="${escapeHtml(normalizedAd.label)}">
            <pre class="popup-ascii-art">${escapeHtml(normalizedAd.asciiArt)}</pre>
          </a>
          ${popupAsciiFooter}
        </div>
      `
      : `
        <a href="${escapeHtml(normalizedAd.href)}" target="_blank" rel="noopener noreferrer" data-ad-link>
          <img src="${escapeHtml(normalizedAd.gif)}" alt="${escapeHtml(normalizedAd.imageAlt)}" loading="lazy">
        </a>
      `;

    p.innerHTML = `
      <div class="titlebar" role="presentation">
        <div class="left">
          <img src="${iconData}" alt="" aria-hidden="true">
          <span>${escapeHtml(normalizedAd.label)}</span>
        </div>
        <div class="close" role="button" aria-label="Close popup" tabindex="0">×</div>
      </div>
      <div class="content">
        ${popupMedia}
        ${popupMessage}
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

    const applyPosition = () => {
      const pos = resolvePopupPosition(p, options);
      p.style.left = pos.x + 'px';
      p.style.top = pos.y + 'px';
    };

    applyPosition();
    if (options.centered) {
      p.style.visibility = '';
      let pendingRepositionFrame = null;
      const queueApplyPosition = () => {
        if (pendingRepositionFrame !== null) return;
        pendingRepositionFrame = window.requestAnimationFrame(() => {
          pendingRepositionFrame = null;
          if (!p.parentNode || p.dataset.despawning === '1') return;
          applyPosition();
        });
      };
      const handleViewportChange = () => {
        queueApplyPosition();
      };
      window.addEventListener('resize', handleViewportChange);
      let layoutObserver = null;
      if (Array.isArray(options.avoidSelectors) && options.avoidSelectors.length) {
        layoutObserver = new MutationObserver(() => {
          queueApplyPosition();
        });
        layoutObserver.observe(document.body, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ['hidden', 'class', 'style']
        });
      }
      p.__popupCleanup = () => {
        if (pendingRepositionFrame !== null) {
          window.cancelAnimationFrame(pendingRepositionFrame);
        }
        window.removeEventListener('resize', handleViewportChange);
        layoutObserver?.disconnect();
      };
    }

    const link = p.querySelector('[data-ad-link]');
    if (normalizedAd.href === '__INTERNAL_ORACLE__' && link) {
      link.removeAttribute('target');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        onOpenOracle();
      });
    }

    state.activePopups.push(p);
    if (!options.persistent) {
      setTimeout(() => despawnPopup(p, { force: true }), config.POPUP_LIFETIME_MS);
    }

    // Clear spawn class after entrance to keep only one active animation phase.
    setTimeout(() => {
      p.classList.remove('spawn-glitch-snap', 'spawn-glitch-warp', 'spawn-glitch-scan', 'spawn-glitch-ghost');
      p.style.removeProperty('--popup-spawn-speed');
    }, 700);

    while (state.activePopups.length > config.MAX_POPUPS) {
      const removableIndex = state.activePopups.findIndex((popupEl) => !isPersistentPopup(popupEl));
      if (removableIndex === -1) break;
      const [old] = state.activePopups.splice(removableIndex, 1);
      if (old && old.parentNode) {
        despawnPopup(old, { force: true });
      }
    }

    return p;
  }

  function shouldRenderPopup(options = {}) {
    if (!options.bypassPause && state.popupsPaused) return false;

    const microPopupIntensity = state.microSettings?.popupIntensity ?? 100;
    if (microPopupIntensity <= 0) return false;
    if (!options.bypassIntensity && microPopupIntensity < 100) {
      // Roll probability based on intensity percentage
      const chance = microPopupIntensity / 100;
      if (Math.random() > chance) return false;
    }

    return true;
  }

  function spawnPopupWithAd(ad, options = {}) {
    if (!shouldRenderPopup(options)) return null;

    const p = makePopup(ad, options);
    if (!p) return null;
    if (window.playAdSfx) window.playAdSfx();
    return p;
  }

  function spawnPopup() {
    const ad = ads[Math.floor(Math.random() * ads.length)];
    return spawnPopupWithAd(ad);
  }

  function randomPopupGlitchOut() {
    if (!state.activePopups.length) return;

    const candidates = state.activePopups.filter((popupEl) => !isPersistentPopup(popupEl));
    if (!candidates.length) return;
    const popup = candidates[Math.floor(Math.random() * candidates.length)];
    if (!popup) return;

    despawnPopup(popup, { respectCooldown: true });
  }

  return {
    rectsOverlap,
    findNonOverlappingPosition,
    findCenteredPosition,
    findCenteredAvoidingPosition,
    removePopupElement,
    makePopup,
    spawnPopupWithAd,
    spawnPopup,
    randomPopupGlitchOut
  };
}
