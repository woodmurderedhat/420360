/**
 * Oracle Taskbar Applet
 *
 * Renders a compact taskbar button and an expandable daily Oracle widget.
 * The applet is self-contained so taskbar.js only handles composition.
 */

const STORAGE_KEYS = {
  LAST_PULL_DATE: 'oracleAppletLastPullDate',
  HISTORY: 'oracleAppletHistory'
};

const MOON_PHASES = [
  { name: 'New Moon', range: [0, 3.69] },
  { name: 'Waxing Crescent', range: [3.69, 7.38] },
  { name: 'First Quarter', range: [7.38, 11.07] },
  { name: 'Waxing Gibbous', range: [11.07, 14.77] },
  { name: 'Full Moon', range: [14.77, 18.45] },
  { name: 'Waning Gibbous', range: [18.45, 22.15] },
  { name: 'Last Quarter', range: [22.15, 25.84] },
  { name: 'Waning Crescent', range: [25.84, 29.54] }
];

const TAROT_DECK = [
  { num: '0', name: 'The Fool', keyword: 'New beginnings', upright: 'Leap into the unknown. Something fresh is calling.', rev: 'Recklessness. Look before you leap today.' },
  { num: 'I', name: 'The Magician', keyword: 'Willpower', upright: 'You have the tools. Use them.', rev: 'Trickery. Someone may be bluffing.' },
  { num: 'II', name: 'The High Priestess', keyword: 'Intuition', upright: 'Be still. The answer is already inside you.', rev: 'Secrets withheld. Trust your gut more.' },
  { num: 'III', name: 'The Empress', keyword: 'Abundance', upright: 'Fertile ground. Create, nurture, grow.', rev: 'Smothering. Let things breathe.' },
  { num: 'IV', name: 'The Emperor', keyword: 'Structure', upright: 'Build the foundation. Order serves you now.', rev: 'Tyranny or chaos. Choose neither.' },
  { num: 'V', name: 'The Hierophant', keyword: 'Tradition', upright: 'Seek a mentor. Wisdom lives in established paths.', rev: 'Break the rules. Convention may be the cage.' },
  { num: 'VI', name: 'The Lovers', keyword: 'Choice', upright: 'A meaningful decision. Follow your values.', rev: 'Misalignment. What do you actually want?' },
  { num: 'VII', name: 'The Chariot', keyword: 'Determination', upright: 'Drive forward. Focus wins the day.', rev: 'Spinning wheels. Re-align your direction.' },
  { num: 'VIII', name: 'Strength', keyword: 'Courage', upright: 'Gentle power over fear. The beast bows to kindness.', rev: 'Self-doubt gnaws. Reclaim your spine.' },
  { num: 'IX', name: 'The Hermit', keyword: 'Solitude', upright: 'Withdraw and listen. Your inner lantern knows the way.', rev: 'Isolation as avoidance. Reconnect.' },
  { num: 'X', name: 'Wheel of Fortune', keyword: 'Cycles', upright: 'The wheel turns. Good luck rides in with change.', rev: 'Resistance to change keeps you stuck.' },
  { num: 'XI', name: 'Justice', keyword: 'Truth', upright: 'Cause and effect. Be honest. Be fair.', rev: 'A bias is clouding your judgment.' },
  { num: 'XII', name: 'The Hanged Man', keyword: 'Surrender', upright: 'Pause willingly. A different angle reveals everything.', rev: 'Stalling. The delay is no longer useful.' },
  { num: 'XIII', name: 'Death', keyword: 'Transformation', upright: 'An ending clears the way. Let it go.', rev: 'Clinging to the old form. Release is growth.' },
  { num: 'XIV', name: 'Temperance', keyword: 'Balance', upright: 'Mix it slowly. The blend is the medicine.', rev: 'Excess in one direction. Find the middle.' },
  { num: 'XV', name: 'The Devil', keyword: 'Shadow', upright: 'Stare at what binds you. The chain is shorter than you think.', rev: 'The chains are already loose. Walk away.' },
  { num: 'XVI', name: 'The Tower', keyword: 'Disruption', upright: 'Something shatters to let light in. Trust the rubble.', rev: 'Disaster narrowly averted or postponed.' },
  { num: 'XVII', name: 'The Star', keyword: 'Hope', upright: 'Calm after the storm. Healing is real.', rev: 'Despair whispers. Counter it with small acts.' },
  { num: 'XVIII', name: 'The Moon', keyword: 'Illusion', upright: 'Things are not what they seem. Sit with uncertainty.', rev: 'A confusion is clearing. Trust returns.' },
  { num: 'XIX', name: 'The Sun', keyword: 'Clarity', upright: 'Full brightness. Joy, vitality, success.', rev: 'A cloud dims the vision. It will pass.' },
  { num: 'XX', name: 'Judgement', keyword: 'Reckoning', upright: 'The call has come. Rise and answer it.', rev: 'Self-judgment runs too deep. Forgive yourself.' },
  { num: 'XXI', name: 'The World', keyword: 'Completion', upright: 'A cycle closes in triumph. Celebrate.', rev: 'Almost there. Tie the last loose end.' }
];

const HOROSCOPE_COPY = {
  Aries: 'Your energy is loud today. Start fast, but leave room for one strategic pause before committing.',
  Taurus: 'A slow move becomes the strongest move. Keep what is useful, release one stale routine.',
  Gemini: 'Conversation opens a side door. Ask one better question instead of giving a faster answer.',
  Cancer: 'Protect your bandwidth. The right people will meet you where your boundaries are clear.',
  Leo: 'Lead with presence, not volume. Confidence lands best when it makes room for others to shine.',
  Virgo: 'A tiny correction changes the whole pattern. Edit the process before you judge the outcome.',
  Libra: 'Harmony is not passivity. Choose the cleanest truth and let balance form around it.',
  Scorpio: 'Something hidden is ready to surface. Use honesty like a scalpel, not a hammer.',
  Sagittarius: 'Your aim improves by narrowing focus. Pick one horizon and move toward it with intent.',
  Capricorn: 'Structure is your advantage today. Build the next step, then let momentum do the heavy lift.',
  Aquarius: 'A strange idea is more practical than it first appears. Prototype first, explain later.',
  Pisces: 'Your intuition is accurate when it is calm. Step away from noise before making the call.'
};

const DAILY_OMENS = [
  'A closed door protects a better entrance.',
  'Delay is not denial. Timing is adjusting itself.',
  'A small yes today prevents a larger no tomorrow.',
  'Someone is waiting for your first move.',
  'You are closer than your current mood can measure.',
  'The glitch is a map, not a mistake.',
  'A repeated sign means the lesson is still active.',
  'One honest sentence changes the week.',
  'What feels random is quietly patterned.',
  'A forgotten thread returns with leverage.'
];

const RITUAL_PROMPTS = [
  'Ritual: Clean one tab, one desk corner, one thought.',
  'Ritual: Walk for five minutes without your phone.',
  'Ritual: Write one line you will not negotiate today.',
  'Ritual: Queue one song and breathe until it ends.',
  'Ritual: Rename one task so it feels possible.',
  'Ritual: Send one message you have delayed all week.',
  'Ritual: Close one loop before opening a new one.',
  'Ritual: Drink water, then revisit the hard choice.',
  'Ritual: Archive one thing you no longer need to carry.',
  'Ritual: Give yourself a clean restart for the next hour.'
];

const LUCKY_COLORS = ['MOSS', 'EMBER', 'CYAN', 'GOLD', 'VIOLET', 'SLATE', 'LIME', 'COPPER'];

function seededIndex(seed, salt, length) {
  const mixed = Math.abs(((seed ^ salt) * 2654435761) >>> 0);
  return mixed % length;
}

function getZodiacSign(date = new Date()) {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

function getDailyOraclePacket(date = new Date()) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const sign = getZodiacSign(date);

  const omen = DAILY_OMENS[seededIndex(seed, 0x0f0f, DAILY_OMENS.length)];
  const ritual = RITUAL_PROMPTS[seededIndex(seed, 0x1a2b, RITUAL_PROMPTS.length)];
  const luckyColor = LUCKY_COLORS[seededIndex(seed, 0x3c4d, LUCKY_COLORS.length)];
  const luckyA = (seed % 9) + 1;
  const luckyB = ((Math.floor(seed / 7) % 12) + 1);
  const luckyC = ((Math.floor(seed / 97) % 22) + 1);
  const hourStart = (seed % 24);
  const hourEnd = (hourStart + 2) % 24;
  const powerWindow = `${String(hourStart).padStart(2, '0')}:00-${String(hourEnd).padStart(2, '0')}:00`;

  return {
    sign,
    horoscope: HOROSCOPE_COPY[sign],
    omen,
    ritual,
    luckyColor,
    luckyNumbers: `${luckyA} · ${luckyB} · ${luckyC}`,
    powerWindow
  };
}

function moonBar(illumination) {
  const filled = Math.round(illumination * 14);
  return '[' + '#'.repeat(filled) + '-'.repeat(14 - filled) + ']';
}

function getMoonData(date = new Date()) {
  const knownNewMoonMs = Date.UTC(2000, 0, 6, 18, 14, 0);
  const synodicMs = 29.53059 * 24 * 60 * 60 * 1000;
  const ageMs = ((date.getTime() - knownNewMoonMs) % synodicMs + synodicMs) % synodicMs;
  const ageDays = ageMs / (24 * 60 * 60 * 1000);
  const phase = MOON_PHASES.find(entry => ageDays >= entry.range[0] && ageDays < entry.range[1]) || MOON_PHASES[0];
  const illum = (1 - Math.cos((ageDays / 29.53059) * 2 * Math.PI)) / 2;
  return { phase: phase.name, illum, ageDays };
}

function moonAsciiArt(ageDays) {
  const norm = ageDays / 29.53059;
  const phases = [
    ['  ___  ', ' /   \\ ', '|     |', ' \\   / ', '  ---  '],
    ['  ___  ', ' /  *\\ ', '|   **|', ' \\  */ ', '  ---  '],
    ['  ___  ', ' / **\\ ', '|  ***|', ' \\ **/ ', '  ---  '],
    ['  ___  ', ' /***\\ ', '| ****|', ' \\***/ ', '  ---  '],
    ['  ___  ', ' /***\\ ', '|*****|', ' \\***/ ', '  ---  '],
    ['  ___  ', ' /***\\ ', '|**** |', ' \\***/ ', '  ---  '],
    ['  ___  ', ' /** \\ ', '|***  |', ' \\** / ', '  ---  '],
    ['  ___  ', ' /*  \\ ', '|**   |', ' \\*  / ', '  ---  ']
  ];
  return phases[Math.floor(norm * 8) % 8];
}

function getDailyTarot(date = new Date()) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const idx = Math.abs((seed * 2654435761) >>> 0) % TAROT_DECK.length;
  const digitSum = String(seed).split('').reduce((sum, d) => sum + Number(d), 0);
  return { card: TAROT_DECK[idx], reversed: digitSum % 2 === 1 };
}

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 30)));
  } catch (err) {
    // best-effort persistence
  }
}

function saveDailyPull(summary) {
  try {
    const today = getDateKey();
    localStorage.setItem(STORAGE_KEYS.LAST_PULL_DATE, today);
    const history = loadHistory();
    const existingIndex = history.findIndex(entry => entry.date === today);
    if (existingIndex >= 0) {
      history[existingIndex] = summary;
    } else {
      history.unshift(summary);
    }
    saveHistory(history);
  } catch (err) {
    // best-effort persistence
  }
}

function hasPulledToday() {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_PULL_DATE) === getDateKey();
  } catch (err) {
    return false;
  }
}

export function createOracleApplet({ onOpen, onClose } = {}) {
  const button = document.createElement('button');
  button.id = 'oracle-taskbar-btn';
  button.type = 'button';
  button.className = 'taskbar-mini-applet';
  button.setAttribute('aria-label', 'Open daily oracle signal');
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('title', 'Daily Oracle Signal');
  button.textContent = '[O]';

  const widget = document.createElement('div');
  widget.id = 'oracle-widget';
  widget.hidden = true;
  widget.setAttribute('role', 'dialog');
  widget.setAttribute('aria-label', 'Daily oracle signal');

  function closeWidget() {
    if (widget.hidden) return;
    widget.hidden = true;
    button.classList.remove('widget-open');
    button.setAttribute('aria-pressed', 'false');
    if (typeof onClose === 'function') onClose();
  }

  function renderWidget() {
    const now = new Date();
    const moon = getMoonData(now);
    const art = moonAsciiArt(moon.ageDays);
    const { card, reversed } = getDailyTarot(now);
    const packet = getDailyOraclePacket(now);
    const dateLabel = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const pct = Math.round(moon.illum * 100);
    const pulledToday = hasPulledToday();

    widget.innerHTML = `
      <div id="ow-header">
        <span id="ow-title">// ORACLE SIGNAL //</span>
        <button id="ow-close" aria-label="Close oracle widget" type="button">[-]</button>
      </div>
      <div id="ow-date">${dateLabel}</div>

      <div id="ow-section-moon">
        <div class="ow-section-label">-- MOON --</div>
        <pre class="ow-moon-art">${art.join('\n')}</pre>
        <div class="ow-moon-phase">${moon.phase}</div>
        <div class="ow-moon-bar">${moonBar(moon.illum)}</div>
        <div class="ow-moon-pct">${pct}% illuminated • day ${Math.floor(moon.ageDays)}</div>
      </div>

      <div id="ow-divider">-----------------------</div>

      <div id="ow-section-tarot">
        <div class="ow-section-label">-- DAILY CARD --</div>
        <div class="ow-card-header">
          <span class="ow-card-num">[${card.num}]</span>
          <span class="ow-card-name">${card.name}${reversed ? ' (R)' : ''}</span>
        </div>
        <div class="ow-card-keyword">&lt;${card.keyword}&gt;</div>
        <div class="ow-card-reading">${reversed ? card.rev : card.upright}</div>
      </div>

      <div id="ow-divider">-----------------------</div>

      <div id="ow-section-horoscope">
        <div class="ow-section-label">-- HOROSCOPE --</div>
        <div class="ow-horo-sign">${packet.sign}</div>
        <div class="ow-horo-reading">${packet.horoscope}</div>
      </div>

      <div id="ow-divider">-----------------------</div>

      <div id="ow-section-omens">
        <div class="ow-section-label">-- OMENS --</div>
        <div class="ow-omen-line">${packet.omen}</div>
        <div class="ow-ritual-line">${packet.ritual}</div>
        <div class="ow-signal-grid">
          <span>LUCKY: ${packet.luckyNumbers}</span>
          <span>COLOR: ${packet.luckyColor}</span>
          <span>WINDOW: ${packet.powerWindow}</span>
        </div>
      </div>

      <div id="ow-footer">${pulledToday ? 'Signal recorded for today.' : 'Tap RECORD to save today\'s signal.'}</div>
      <button id="ow-record" type="button">${pulledToday ? 'RECORDED' : 'RECORD SIGNAL'}</button>
    `;

    const closeBtn = widget.querySelector('#ow-close');
    closeBtn?.addEventListener('click', (evt) => {
      evt.stopPropagation();
      closeWidget();
    });

    const recordBtn = widget.querySelector('#ow-record');
    recordBtn?.addEventListener('click', (evt) => {
      evt.stopPropagation();
      const summary = {
        date: getDateKey(now),
        card: card.name,
        reversed,
        moon: moon.phase,
        pct,
        sign: packet.sign,
        omen: packet.omen
      };
      saveDailyPull(summary);
      renderWidget();
    });
  }

  function openWidget() {
    renderWidget();
    widget.hidden = false;
    button.classList.add('widget-open');
    button.setAttribute('aria-pressed', 'true');
    if (typeof onOpen === 'function') onOpen();
  }

  function toggleWidget() {
    if (widget.hidden) {
      openWidget();
      return;
    }
    closeWidget();
  }

  button.addEventListener('click', (evt) => {
    evt.stopPropagation();
    toggleWidget();
  });

  button.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      evt.preventDefault();
      button.click();
    }
    if (evt.key === 'Escape') {
      closeWidget();
    }
  });

  document.addEventListener('click', (evt) => {
    if (widget.hidden) return;
    if (widget.contains(evt.target) || button.contains(evt.target)) return;
    closeWidget();
  });

  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') closeWidget();
  });

  return {
    buttonEl: button,
    widgetEl: widget,
    openWidget,
    toggleWidget,
    closeWidget,
    isOpen: () => !widget.hidden
  };
}
