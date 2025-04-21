// Weather.js
// Modular weather system plugin for Tree Idler
import { emit, on, off } from './EventBus.js';

export const name = 'Weather';

let state = {
  current: 'clear', // clear, rain, drought, frost
  timer: null,
};

export function install(api) {
  // Optionally restore weather state from api.state.weather
  if (api?.state?.weather) state = { ...state, ...api.state.weather };
}

export function activate() {
  startWeatherCycle();
}

export function deactivate() {
  if (state.timer) clearTimeout(state.timer);
}

function startWeatherCycle() {
  scheduleNextWeather();
}

function scheduleNextWeather() {
  // Randomly pick next weather event after 30-90 seconds
  const delay = 30000 + Math.random() * 60000;
  state.timer = setTimeout(() => {
    triggerRandomWeather();
    scheduleNextWeather();
  }, delay);
}

function triggerRandomWeather() {
  const events = ['clear', 'rain', 'drought', 'frost'];
  // Weighted random: clear is more common
  const weights = [0.5, 0.25, 0.15, 0.1];
  let r = Math.random();
  let idx = 0;
  while (r > weights[idx]) {
    r -= weights[idx++];
  }
  state.current = events[idx] || 'clear';
  emit('weatherChanged', { weather: state.current });
}
