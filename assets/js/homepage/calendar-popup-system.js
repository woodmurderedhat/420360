function padDatePart(value) {
  return String(value).padStart(2, '0');
}

function formatTemplate(template, date) {
  if (typeof template !== 'string' || !template.trim()) return '';
  return template.replace(/\{day\}/g, String(date.getDate()));
}

export function createCalendarPopupSystem({
  popupSystem,
  monthThemes,
  specialDates,
  topLayerZIndex
}) {
  let hasShownThisLoad = false;

  function getDateKey(date = new Date()) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    return `${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
  }

  function resolveMonthlyTheme(date = new Date()) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;

    const monthKey = padDatePart(date.getMonth() + 1);
    const theme = monthThemes?.[monthKey];
    if (!theme) return null;

    const gifPool = Array.isArray(theme.gifs)
      ? theme.gifs.filter((gif) => typeof gif === 'string' && gif.trim())
      : [];
    const fallbackGif = gifPool.length ? gifPool[(date.getDate() - 1) % gifPool.length] : '';
    if (!fallbackGif) return null;

    return {
      label: `${theme.label} • DAY ${date.getDate()}`,
      href: theme.href,
      gif: fallbackGif,
      message: formatTemplate(theme.messageTemplate, date),
      imageAlt: `${theme.label} celebration`
    };
  }

  function resolvePopupForDate(date = new Date()) {
    const dateKey = getDateKey(date);
    if (!dateKey) return null;

    const special = specialDates?.[dateKey];
    if (special) return { ...special };

    return resolveMonthlyTheme(date);
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
    getDateKey,
    resolvePopupForDate,
    showToday
  };
}
