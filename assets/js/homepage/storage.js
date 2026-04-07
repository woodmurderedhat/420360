export function loadPreference(key, defaultValue = false) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    return value === 'true';
  } catch (e) {
    return defaultValue;
  }
}

export function savePreference(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch (e) {
    console.warn('Failed to save preference:', key);
  }
}
