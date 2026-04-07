export function getRegionMinimumAge(region) {
  if (region === 'us-ca') return 21;
  if (region === 'eu' || region === 'other') return 18;
  return 21;
}

export function loadAgeGateProfile(ageGateStorageKey) {
  try {
    const raw = localStorage.getItem(ageGateStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.region || typeof parsed.age !== 'number') return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

export function saveAgeGateProfile(ageGateStorageKey, region, age) {
  try {
    const payload = {
      region,
      age,
      verifiedAt: new Date().toISOString()
    };
    localStorage.setItem(ageGateStorageKey, JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to save age gate profile');
  }
}

export function isAgeGateValid(profile) {
  if (!profile) return false;
  if (!profile.region || typeof profile.age !== 'number') return false;
  return profile.age >= getRegionMinimumAge(profile.region);
}
