export function ensureAgeGateAccess({
  storageKey,
  loadAgeGateProfile,
  isAgeGateValid,
  getRegionMinimumAge,
  saveAgeGateProfile,
  onAccessGranted
}) {
  const gate = document.getElementById('age-gate');
  const enterBtn = document.getElementById('age-gate-enter');
  const exitBtn = document.getElementById('age-gate-exit');
  const regionSelect = document.getElementById('age-gate-region');
  const ageInput = document.getElementById('age-gate-age');
  const gateFeedback = document.getElementById('age-gate-feedback');

  const ageProfile = loadAgeGateProfile(storageKey);
  if (isAgeGateValid(ageProfile) || !gate) {
    return { blocked: false, ageProfile };
  }

  gate.classList.add('active');

  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      const region = regionSelect?.value || 'us-ca';
      const age = Number(ageInput?.value || 0);
      const minAge = getRegionMinimumAge(region);

      if (!Number.isFinite(age) || age <= 0) {
        if (gateFeedback) gateFeedback.textContent = 'Enter a valid age to continue.';
        return;
      }

      if (age < minAge) {
        if (gateFeedback) gateFeedback.textContent = `Access denied: this region requires ${minAge}+.`;
        return;
      }

      saveAgeGateProfile(storageKey, region, age);
      if (gateFeedback) gateFeedback.textContent = '';
      gate.classList.remove('active');
      onAccessGranted();
    });
  }

  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      window.location.href = 'https://www.google.com';
    });
  }

  if (ageProfile && regionSelect && ageInput) {
    regionSelect.value = ageProfile.region;
    ageInput.value = String(ageProfile.age);
  }

  return { blocked: true, ageProfile };
}
