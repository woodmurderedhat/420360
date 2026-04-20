const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

function toDayStamp(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = toDayStamp(date) - start;
  return Math.floor(diff / 86400000);
}

function getOrdinalSuffix(value) {
  const remainder = value % 100;
  if (remainder >= 11 && remainder <= 13) return 'th';
  switch (value % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function getMonthDayKey(month, day) {
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatTemplate(template, date) {
  if (typeof template !== 'string' || !template.trim()) return '';

  const monthNumber = date.getMonth() + 1;
  const day = date.getDate();
  const tokens = {
    '{day}': String(day),
    '{dayOfYear}': String(getDayOfYear(date)),
    '{month}': String(monthNumber),
    '{monthName}': MONTH_NAMES[date.getMonth()],
    '{ordinalDay}': `${day}${getOrdinalSuffix(day)}`,
    '{weekdayName}': WEEKDAY_NAMES[date.getDay()],
    '{year}': String(date.getFullYear())
  };

  return Object.entries(tokens).reduce(
    (result, [token, value]) => result.replaceAll(token, value),
    template
  );
}

function normalizeTheme(themeId, theme, date) {
  if (!theme || typeof theme !== 'object') return null;

  const gifPool = Array.isArray(theme.gifs)
    ? theme.gifs.filter((gif) => typeof gif === 'string' && gif.trim())
    : [];
  if (!gifPool.length) return null;

  return {
    label: formatTemplate(theme.labelTemplate || theme.label || themeId || 'CALENDAR POPUP', date),
    href: typeof theme.href === 'string' && theme.href.trim() ? theme.href.trim() : '#',
    gif: gifPool[(getDayOfYear(date) - 1) % gifPool.length],
    message: formatTemplate(theme.messageTemplate || '', date),
    imageAlt: formatTemplate(theme.imageAlt || `${theme.labelTemplate || theme.label || themeId} celebration`, date)
  };
}

function getNthWeekdayOfMonth(year, month, weekday, occurrence) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const firstWeekdayOffset = (weekday - firstOfMonth.getDay() + 7) % 7;
  const day = 1 + firstWeekdayOffset + ((occurrence - 1) * 7);
  const candidate = new Date(year, month - 1, day);
  if (candidate.getMonth() !== month - 1) return null;
  return candidate;
}

function getLastWeekdayOfMonth(year, month, weekday) {
  const lastOfMonth = new Date(year, month, 0);
  const offset = (lastOfMonth.getDay() - weekday + 7) % 7;
  return new Date(year, month - 1, lastOfMonth.getDate() - offset);
}

function isSameDay(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function matchesDateRange(rule, date) {
  const target = getMonthDayKey(date.getMonth() + 1, date.getDate());
  const start = getMonthDayKey(rule.startMonth, rule.startDay);
  const end = getMonthDayKey(rule.endMonth, rule.endDay);

  if (start <= end) {
    return target >= start && target <= end;
  }

  return target >= start || target <= end;
}

export function createCalendarPopupSystem({
  popupSystem,
  themes,
  rules,
  topLayerZIndex
}) {
  let hasShownThisLoad = false;

  function matchesRule(rule, date) {
    if (!rule || typeof rule !== 'object') return false;

    switch (rule.type) {
      case 'fixed-date':
        return (date.getMonth() + 1) === rule.month && date.getDate() === rule.day;
      case 'month':
        return (date.getMonth() + 1) === rule.month;
      case 'weekday':
        return date.getDay() === rule.weekday;
      case 'nth-weekday': {
        const candidate = getNthWeekdayOfMonth(
          date.getFullYear(),
          rule.month,
          rule.weekday,
          rule.occurrence
        );
        return candidate ? isSameDay(candidate, date) : false;
      }
      case 'first-weekday': {
        const candidate = getNthWeekdayOfMonth(date.getFullYear(), rule.month, rule.weekday, 1);
        return candidate ? isSameDay(candidate, date) : false;
      }
      case 'last-weekday': {
        const candidate = getLastWeekdayOfMonth(date.getFullYear(), rule.month, rule.weekday);
        return candidate ? isSameDay(candidate, date) : false;
      }
      case 'date-range':
        return matchesDateRange(rule, date);
      case 'day-after-rule': {
        const priorDate = addDays(date, -1);
        const sourceRule = rules.find((candidate) => candidate.themeId === rule.sourceThemeId);
        return sourceRule ? matchesRule(sourceRule, priorDate) : false;
      }
      default:
        return false;
    }
  }

  function resolveRuleForDate(date = new Date()) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    return Array.isArray(rules)
      ? rules.find((rule) => matchesRule(rule, date)) || null
      : null;
  }

  function resolvePopupForDate(date = new Date()) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;

    const matchedRule = resolveRuleForDate(date);
    if (!matchedRule || typeof matchedRule.themeId !== 'string') return null;

    const theme = themes?.[matchedRule.themeId];
    return normalizeTheme(matchedRule.themeId, theme, date);
  }

  function showToday(date = new Date()) {
    if (hasShownThisLoad) return null;

    const popupAd = resolvePopupForDate(date);
    if (!popupAd) return null;

    const popup = popupSystem.spawnPopupWithAd(popupAd, {
      bypassIntensity: true,
      zIndex: topLayerZIndex
    });
    if (popup) hasShownThisLoad = true;
    return popup;
  }

  return {
    formatTemplate,
    resolveRuleForDate,
    resolvePopupForDate,
    showToday
  };
}
