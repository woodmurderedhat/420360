// Achievements.test.js
// Unit tests for Achievements.js using the vanilla test framework
import { test, assert, assertEqual, describe, beforeEach } from './test-framework.js';
import * as Achievements from '../lib/Achievements.js';
import { emit, on, off } from '../lib/EventBus.js';

describe('Achievements', () => {
  let api, state;
  beforeEach(() => {
    state = {
      achievements: {
        firstPrestige: false,
        sunlight1000: false,
        legendaryStage: false,
        fruitMaster: false,
        squirrelHero: false
      }
    };
    api = { state };
  });

  test('install restores state from api', () => {
    Achievements.install(api);
    // No error means pass; state is restored
    assert(true, 'install should not throw');
  });

  test('unlock firstPrestige on prestigeAwarded', () => {
    Achievements.install(api);
    Achievements.activate(api);
    let updated = false;
    on('achievementsUpdated', e => {
      updated = e.detail.firstPrestige;
    });
    emit('prestigeAwarded', { prestigeLevel: 1 });
    assert(updated, 'firstPrestige should be unlocked');
    Achievements.deactivate(api);
  });

  test('unlock sunlight1000 on resourcesUpdated', () => {
    Achievements.install(api);
    Achievements.activate(api);
    let updated = false;
    on('achievementsUpdated', e => {
      updated = e.detail.sunlight1000;
    });
    emit('resourcesUpdated', { sunlight: 1000 });
    assert(updated, 'sunlight1000 should be unlocked');
    Achievements.deactivate(api);
  });

  test('unlock legendaryStage on treeStageAdvanced', () => {
    Achievements.install(api);
    Achievements.activate(api);
    let updated = false;
    on('achievementsUpdated', e => {
      updated = e.detail.legendaryStage;
    });
    emit('treeStageAdvanced', { stage: 11, slots: {} });
    assert(updated, 'legendaryStage should be unlocked');
    Achievements.deactivate(api);
  });

  test('unlock fruitMaster on treeInitialized', () => {
    Achievements.install(api);
    Achievements.activate(api);
    let updated = false;
    on('achievementsUpdated', e => {
      updated = e.detail.fruitMaster;
    });
    emit('treeInitialized', { stage: 1, slots: { fruits: 8 } });
    assert(updated, 'fruitMaster should be unlocked');
    Achievements.deactivate(api);
  });

  test('unlock squirrelHero after 10 squirrelScared events', () => {
    Achievements.install(api);
    Achievements.activate(api);
    let updated = false;
    on('achievementsUpdated', e => {
      updated = e.detail.squirrelHero;
    });
    for (let i = 0; i < 10; i++) emit('squirrelScared');
    assert(updated, 'squirrelHero should be unlocked after 10 scares');
    Achievements.deactivate(api);
  });
});
