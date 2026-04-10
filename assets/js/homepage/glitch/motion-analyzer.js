export class MotionAnalyzer {
  constructor() {
    this.state = {
      lastX: null,
      lastY: null,
      lastTime: 0,
      lastSpeed: 0,
      lastAngle: null,
      turnBurst: 0,
      jitterBurst: 0,
      accelBurst: 0,
      stopShock: 0
    };
  }

  normalizeMovementMeta(movementMeta) {
    if (!movementMeta) return null;

    const speedNorm = Math.min(1, movementMeta.speed / 1.2);
    const distanceNorm = Math.min(1, movementMeta.distance / 120);
    const turnNorm = Math.min(1, movementMeta.angleDelta / 1.8);
    const accelNorm = Math.min(1, Math.abs(movementMeta.accel) / 0.02);
    const burstNorm = Math.min(
      1,
      (movementMeta.turnBurst + movementMeta.jitterBurst + movementMeta.accelBurst + movementMeta.stopShock) / 14
    );

    const motionEnergy = Math.max(
      0,
      Math.min(1, speedNorm * 0.45 + distanceNorm * 0.2 + turnNorm * 0.12 + accelNorm * 0.13 + burstNorm * 0.1)
    );

    return {
      ...movementMeta,
      speedNorm,
      distanceNorm,
      turnNorm,
      accelNorm,
      burstNorm,
      motionEnergy,
      intensityMultiplier: 0.82 + motionEnergy * 0.78
    };
  }

  classifyMouseMotion(event) {
    const now = performance.now();
    const state = this.state;

    if (state.lastX === null || state.lastY === null || !state.lastTime) {
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      state.lastTime = now;
      return null;
    }

    const dx = event.clientX - state.lastX;
    const dy = event.clientY - state.lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const dt = Math.max(1, now - state.lastTime);
    const speed = distance / dt;

    const angle = distance > 0 ? Math.atan2(dy, dx) : state.lastAngle;
    let angleDelta = 0;
    if (angle !== null && state.lastAngle !== null) {
      angleDelta = Math.abs(Math.atan2(Math.sin(angle - state.lastAngle), Math.cos(angle - state.lastAngle)));
    }

    const strongTurn = angleDelta > 1.05 && distance > 5;
    const jitterTurn = angleDelta > 1.35 && distance < 34 && speed > 0.16;
    const speedDelta = speed - state.lastSpeed;
    const accel = speedDelta / dt;
    const accelSpike = speed > 0.55 && accel > 0.012;
    const suddenStop = state.lastSpeed > 0.9 && speed < 0.08 && dt < 90;

    state.turnBurst = strongTurn ? Math.min(6, state.turnBurst + 1) : Math.max(0, state.turnBurst - 1);
    state.jitterBurst = jitterTurn ? Math.min(6, state.jitterBurst + 1) : Math.max(0, state.jitterBurst - 1);
    state.accelBurst = accelSpike ? Math.min(5, state.accelBurst + 1) : Math.max(0, state.accelBurst - 1);
    state.stopShock = suddenStop ? Math.min(3, state.stopShock + 1) : Math.max(0, state.stopShock - 1);

    const axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
    const direction = axis === 'x'
      ? (dx === 0 ? 1 : Math.sign(dx))
      : (dy === 0 ? 1 : Math.sign(dy));

    state.lastX = event.clientX;
    state.lastY = event.clientY;
    state.lastTime = now;
    state.lastSpeed = speed;
    state.lastAngle = angle;

    return {
      speed,
      distance,
      dt,
      accel,
      angleDelta,
      axis,
      direction,
      turnBurst: state.turnBurst,
      jitterBurst: state.jitterBurst,
      accelBurst: state.accelBurst,
      stopShock: state.stopShock
    };
  }

  pickMoveProfile(movementMeta) {
    const normalizedMeta = this.normalizeMovementMeta(movementMeta);

    if (!normalizedMeta) {
      return { type: 'move', meta: null };
    }

    if (normalizedMeta.stopShock >= 1) return { type: 'moveStall', meta: normalizedMeta };
    if (normalizedMeta.accelBurst >= 2) return { type: 'moveSurge', meta: normalizedMeta };
    if (normalizedMeta.jitterBurst >= 2) return { type: 'moveJitter', meta: normalizedMeta };
    if (normalizedMeta.turnBurst >= 2 && normalizedMeta.speed > 0.3) return { type: 'moveWhip', meta: normalizedMeta };
    if (normalizedMeta.speed > 0.95 || normalizedMeta.distance > 80) return { type: 'moveSwipe', meta: normalizedMeta };
    if (normalizedMeta.speed < 0.13 || normalizedMeta.distance < 6) return { type: 'moveDrift', meta: normalizedMeta };

    return { type: 'move', meta: normalizedMeta };
  }
}
