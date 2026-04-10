import * as ops from './pixel-ops.js';

function axisDirection(meta) {
  const axis = meta?.axis || 'x';
  const direction = meta?.direction || 1;
  return { axis, direction };
}

function weightedDirectionalChance(meta, axisTarget, directionTarget, favored = 0.72) {
  if (!meta || meta.axis !== axisTarget) return 0.5;
  return meta.direction === directionTarget ? favored : 1 - favored;
}

function effectIntensity(ctx, baseline = 1) {
  const motion = Number.isFinite(ctx.meta?.intensityMultiplier) ? ctx.meta.intensityMultiplier : 1;
  const variation = Number.isFinite(ctx.variationBoost) ? ctx.variationBoost : 1;
  return baseline * motion * variation;
}

export function registerDefaultEffects(registry) {
  registry.register({
    id: 'drift-shear',
    label: 'Drift Shear',
    cost: 1,
    chance: 1,
    balance: 0,
    apply(ctx) {
      const { axis } = axisDirection(ctx.meta);
      const intensity = effectIntensity(ctx);
      ops.displacePixels(ctx, 0.08 * ctx.quality.intensityScale * Math.min(1.45, intensity), 3 + Math.floor(intensity * 1.2));
      if (axis === 'x') {
        ops.scanlineShear(ctx, 1 + Math.floor(Math.random() * 2), 7, 1);
      } else {
        ops.columnShear(ctx, 1 + Math.floor(Math.random() * 2), 7, 1);
      }
      if (Math.random() < 0.3 * ctx.quality.chanceScale) ops.chromaBands(ctx, 1, 0, 2);
    }
  });

  registry.register({
    id: 'chroma-banding',
    label: 'Chroma Banding',
    cost: 1,
    chance: 0.9,
    balance: 0,
    apply(ctx) {
      const { axis, direction } = axisDirection(ctx.meta);
      const intensity = effectIntensity(ctx, 1.1);
      const dx = axis === 'x'
        ? direction * (2 + Math.floor(Math.random() * 3 + intensity * 1.6))
        : Math.floor(Math.random() * 4) - 2;
      const dy = axis === 'y' ? direction * (1 + Math.floor(Math.random() * 2 + intensity * 0.8)) : 0;
      ops.chromaBands(ctx, dx, dy, 2 + Math.floor(Math.random() * 3));
    }
  });

  registry.register({
    id: 'swipe-tear',
    label: 'Swipe Tear',
    cost: 2,
    chance: 1,
    balance: 0,
    apply(ctx) {
      const { axis, direction } = axisDirection(ctx.meta);
      const intensity = effectIntensity(ctx, 1.1);
      ops.displacePixels(ctx, 0.14 * ctx.quality.intensityScale * Math.min(1.4, intensity), 6 + Math.floor(intensity * 2));
      ops.scanlineShear(ctx, 4 + Math.floor(Math.random() * 3), 20, 1);
      ops.frameSlip(ctx, axis === 'y' ? direction : (Math.random() < 0.5 ? -1 : 1));
      ops.chromaBands(ctx, axis === 'x' ? direction * 4 : 2, axis === 'y' ? direction * 3 : 0, 3);
    }
  });

  registry.register({
    id: 'whip-burst',
    label: 'Whip Burst',
    cost: 2,
    chance: 1,
    balance: 0,
    apply(ctx) {
      const intensity = effectIntensity(ctx, 1.05);
      ops.blockTears(ctx, 8 + Math.floor(Math.random() * 7));
      ops.scanlineShear(ctx, 5 + Math.floor(Math.random() * 3), 24, 1);
      ops.chromaBands(ctx, Math.floor(Math.random() * 13) - 6, Math.floor(Math.random() * 7) - 3, 5 + Math.floor(intensity * 1.5));
      if (Math.random() < 0.45) ops.lumaDropout(ctx, 1 + Math.floor(Math.random() * 3), 16, 40);
    }
  });

  registry.register({
    id: 'jitter-grid',
    label: 'Jitter Grid',
    cost: 2,
    chance: 0.95,
    balance: 1,
    apply(ctx) {
      const axis = ctx.meta?.axis || 'x';
      ops.pixelateChunks(ctx, 14 + Math.floor(Math.random() * 10), 4, 14);
      ops.displacePixels(ctx, 0.12 * ctx.quality.intensityScale, 5);
      if (axis === 'x') {
        ops.horizontalScratches(ctx, 2 + Math.floor(Math.random() * 3));
      } else {
        ops.verticalScratches(ctx, 2 + Math.floor(Math.random() * 3));
      }
    }
  });

  registry.register({
    id: 'surge-overdrive',
    label: 'Surge Overdrive',
    cost: 3,
    chance: 1,
    balance: 1,
    apply(ctx) {
      const intensity = effectIntensity(ctx, 1.2);
      const { axis, direction } = axisDirection(ctx.meta);
      ops.digitalTearExpand(ctx);
      ops.displacePixels(ctx, 0.2 * ctx.quality.intensityScale * Math.min(1.35, intensity), 8 + Math.floor(intensity * 2.5));
      ops.scanlineShear(ctx, 5 + Math.floor(Math.random() * 4), 26, 1);
      ops.chromaBands(ctx, axis === 'x' ? direction * 6 : 2, axis === 'y' ? direction * 5 : 1, 5);
    }
  });

  registry.register({
    id: 'stall-dropout',
    label: 'Stall Dropout',
    cost: 2,
    chance: 1,
    balance: -1,
    apply(ctx) {
      const direction = ctx.meta?.direction || 1;
      ops.lumaDropout(ctx, 2 + Math.floor(Math.random() * 2), 20, 56);
      ops.frameSlip(ctx, -direction);
      ops.pixelateChunks(ctx, 9 + Math.floor(Math.random() * 7), 5, 18);
      ops.verticalScratches(ctx, 2 + Math.floor(Math.random() * 2));
    }
  });

  registry.register({
    id: 'impact-fracture',
    label: 'Impact Fracture',
    cost: 3,
    chance: 1,
    balance: 0,
    apply(ctx) {
      ops.digitalTearExpand(ctx);
      ops.blockTears(ctx, 6 + Math.floor(Math.random() * 6));
      ops.scanlineShear(ctx, 4 + Math.floor(Math.random() * 3), 18, 1);
      if (Math.random() < 0.8) ops.chromaBands(ctx, Math.floor(Math.random() * 11) - 5, Math.floor(Math.random() * 5) - 2, 4);
      if (Math.random() < 0.5) ops.lumaDropout(ctx, 1 + Math.floor(Math.random() * 2), 18, 48);
    }
  });

  registry.register({
    id: 'scroll-up-rake',
    label: 'Scroll Up Rake',
    cost: 2,
    chance: 1,
    balance: 1,
    apply(ctx) {
      ops.frameSlip(ctx, -1);
      ops.scanlineShear(ctx, 3 + Math.floor(Math.random() * 3), 16, 1);
      ops.verticalScratches(ctx, 2 + Math.floor(Math.random() * 2));
      if (Math.random() < 0.7) ops.chromaBands(ctx, -2, -1, 3);
    }
  });

  registry.register({
    id: 'scroll-down-sink',
    label: 'Scroll Down Sink',
    cost: 2,
    chance: 1,
    balance: -1,
    apply(ctx) {
      ops.frameSlip(ctx, 1);
      ops.lumaDropout(ctx, 2 + Math.floor(Math.random() * 2), 22, 64);
      ops.pixelateChunks(ctx, 8 + Math.floor(Math.random() * 6), 8, 22);
      if (Math.random() < 0.7) ops.chromaBands(ctx, 2, 1, 4);
    }
  });

  registry.register({
    id: 'ambient-flicker',
    label: 'Ambient Flicker',
    cost: 1,
    chance: 1,
    balance: 0,
    apply(ctx) {
      const roll = Math.random();
      if (roll < 0.33) {
        ops.frameSlip(ctx, Math.random() < 0.5 ? -1 : 1);
        ops.scanlineShear(ctx, 2 + Math.floor(Math.random() * 2), 12, 1);
        return;
      }
      if (roll < 0.66) {
        ops.pixelateChunks(ctx, 6 + Math.floor(Math.random() * 6), 6, 16);
        ops.lumaDropout(ctx, 1 + Math.floor(Math.random() * 2), 14, 36);
        return;
      }
      ops.chromaBands(ctx, Math.floor(Math.random() * 9) - 4, Math.floor(Math.random() * 5) - 2, 5);
      ops.verticalScratches(ctx, 1 + Math.floor(Math.random() * 2));
    }
  });

  registry.register({
    id: 'directional-exposure',
    label: 'Directional Exposure Opposition',
    cost: 2,
    chance: 1,
    balance: 0,
    apply(ctx) {
      const { axis } = axisDirection(ctx.meta);
      const burnChance = weightedDirectionalChance(ctx.meta, 'x', -1, 0.72);

      if (Math.random() < burnChance) {
        ops.lumaBoost(ctx, 1 + Math.floor(Math.random() * 2), 16, 48);
        ops.edgeCrawl(ctx, 2);
      } else {
        ops.lumaDropout(ctx, 1 + Math.floor(Math.random() * 2), 16, 48);
        ops.edgeSink(ctx, 2);
      }

      if (axis === 'x') {
        ops.scanlineShear(ctx, 3 + Math.floor(Math.random() * 3), 18, 1);
        ops.horizontalScratches(ctx, 1 + Math.floor(Math.random() * 2));
      } else {
        ops.columnShear(ctx, 3 + Math.floor(Math.random() * 3), 18, 1);
        ops.verticalScratches(ctx, 1 + Math.floor(Math.random() * 2));
      }
    }
  });

  registry.register({
    id: 'cut-horizontal-burn',
    label: 'Horizontal Cut Burn',
    cost: 2,
    chance: 0.9,
    balance: 1,
    apply(ctx) {
      ops.scanlineShear(ctx, 4 + Math.floor(Math.random() * 3), 20, 1);
      ops.horizontalScratches(ctx, 2 + Math.floor(Math.random() * 2));
      ops.lumaBoost(ctx, 1 + Math.floor(Math.random() * 2), 12, 34);
    }
  });

  registry.register({
    id: 'cut-horizontal-sink',
    label: 'Horizontal Cut Sink',
    cost: 2,
    chance: 0.9,
    balance: -1,
    apply(ctx) {
      ops.scanlineShear(ctx, 4 + Math.floor(Math.random() * 3), 20, 1);
      ops.horizontalScratches(ctx, 1 + Math.floor(Math.random() * 2));
      ops.lumaDropout(ctx, 1 + Math.floor(Math.random() * 2), 12, 34);
      ops.edgeSink(ctx, 2);
    }
  });

  registry.register({
    id: 'cut-vertical-burn',
    label: 'Vertical Cut Burn',
    cost: 2,
    chance: 0.9,
    balance: 1,
    apply(ctx) {
      ops.columnShear(ctx, 4 + Math.floor(Math.random() * 3), 20, 1);
      ops.verticalScratches(ctx, 2 + Math.floor(Math.random() * 2));
      ops.lumaBoost(ctx, 1 + Math.floor(Math.random() * 2), 12, 34);
    }
  });

  registry.register({
    id: 'cut-vertical-sink',
    label: 'Vertical Cut Sink',
    cost: 2,
    chance: 0.9,
    balance: -1,
    apply(ctx) {
      ops.columnShear(ctx, 4 + Math.floor(Math.random() * 3), 20, 1);
      ops.verticalScratches(ctx, 1 + Math.floor(Math.random() * 2));
      ops.lumaDropout(ctx, 1 + Math.floor(Math.random() * 2), 12, 34);
      ops.edgeSink(ctx, 2);
    }
  });

  registry.register({
    id: 'square-clone-hop',
    label: 'Square Clone Hop',
    cost: 2,
    chance: 0.92,
    balance: 0,
    apply(ctx) {
      const { data, source, width, height } = ctx;
      const intensity = Math.min(1.8, effectIntensity(ctx, 1.08) * ctx.quality.intensityScale);
      const blockCount = 5 + Math.floor(Math.random() * 6 + intensity * 3);
      const maxShiftX = Math.max(12, Math.floor(width * 0.22));
      const maxShiftY = Math.max(8, Math.floor(height * 0.14));

      for (let i = 0; i < blockCount; i += 1) {
        const size = 10 + Math.floor(Math.random() * 38);
        const srcX = Math.floor(Math.random() * Math.max(1, width - size));
        const srcY = Math.floor(Math.random() * Math.max(1, height - size));
        const dstX = Math.max(0, Math.min(width - size, srcX + Math.floor((Math.random() * 2 - 1) * maxShiftX)));
        const dstY = Math.max(0, Math.min(height - size, srcY + Math.floor((Math.random() * 2 - 1) * maxShiftY)));

        for (let y = 0; y < size; y += 1) {
          for (let x = 0; x < size; x += 1) {
            if (Math.random() > 0.76 * ctx.quality.chanceScale) continue;

            const sx = Math.max(0, Math.min(width - 1, srcX + x + (Math.random() < 0.35 ? Math.floor(Math.random() * 5) - 2 : 0)));
            const sy = Math.max(0, Math.min(height - 1, srcY + y + (Math.random() < 0.25 ? Math.floor(Math.random() * 3) - 1 : 0)));
            const dx = dstX + x;
            const dy = dstY + y;
            const srcIdx = (sy * width + sx) * 4;
            const dstIdx = (dy * width + dx) * 4;

            data[dstIdx] = source[srcIdx];
            data[dstIdx + 1] = source[srcIdx + 1];
            data[dstIdx + 2] = source[srcIdx + 2];
            data[dstIdx + 3] = 255;
          }
        }
      }
    }
  });

  registry.register({
    id: 'square-stretch-cast',
    label: 'Square Stretch Cast',
    cost: 3,
    chance: 0.86,
    minTier: 'balanced',
    balance: 0,
    apply(ctx) {
      const { data, source, width, height } = ctx;
      const intensity = Math.min(1.9, effectIntensity(ctx, 1.1));
      const castCount = 3 + Math.floor(Math.random() * 4 + intensity * 1.7);

      for (let i = 0; i < castCount; i += 1) {
        const side = 12 + Math.floor(Math.random() * 32);
        const srcX = Math.floor(Math.random() * Math.max(1, width - side));
        const srcY = Math.floor(Math.random() * Math.max(1, height - side));
        const horizontal = Math.random() < 0.5;
        const stretch = 1.5 + Math.random() * 1.7;
        const dstW = horizontal ? Math.max(8, Math.floor(side * stretch)) : side;
        const dstH = horizontal ? side : Math.max(8, Math.floor(side * stretch));
        const dstX = Math.floor(Math.random() * Math.max(1, width - dstW));
        const dstY = Math.floor(Math.random() * Math.max(1, height - dstH));

        for (let y = 0; y < dstH; y += 1) {
          const sy = Math.max(0, Math.min(height - 1, srcY + Math.floor((y / Math.max(1, dstH - 1)) * (side - 1))));
          for (let x = 0; x < dstW; x += 1) {
            if (Math.random() > 0.72 * ctx.quality.chanceScale) continue;

            const sx = Math.max(0, Math.min(width - 1, srcX + Math.floor((x / Math.max(1, dstW - 1)) * (side - 1))));
            const dx = dstX + x;
            const dy = dstY + y;
            const srcIdx = (sy * width + sx) * 4;
            const dstIdx = (dy * width + dx) * 4;

            data[dstIdx] = source[srcIdx];
            data[dstIdx + 1] = source[srcIdx + 1];
            data[dstIdx + 2] = source[srcIdx + 2];
            data[dstIdx + 3] = 255;
          }
        }
      }
    }
  });

  registry.register({
    id: 'square-mosaic-drift',
    label: 'Square Mosaic Drift',
    cost: 2,
    chance: 0.9,
    balance: 0,
    apply(ctx) {
      const { data, source, width, height } = ctx;
      const intensity = Math.min(1.8, effectIntensity(ctx, 1.06));
      const clusters = 4 + Math.floor(Math.random() * 5 + intensity * 2);

      for (let c = 0; c < clusters; c += 1) {
        const tile = 6 + Math.floor(Math.random() * 12);
        const srcX = Math.floor(Math.random() * Math.max(1, width - tile));
        const srcY = Math.floor(Math.random() * Math.max(1, height - tile));
        const baseX = Math.max(0, Math.min(width - tile, srcX + (Math.floor(Math.random() * 81) - 40)));
        const baseY = Math.max(0, Math.min(height - tile, srcY + (Math.floor(Math.random() * 51) - 25)));
        const dupes = 3 + Math.floor(Math.random() * 4 + intensity);

        for (let d = 0; d < dupes; d += 1) {
          const dstX = Math.max(0, Math.min(width - tile, baseX + (Math.floor(Math.random() * 61) - 30)));
          const dstY = Math.max(0, Math.min(height - tile, baseY + (Math.floor(Math.random() * 35) - 17)));

          for (let y = 0; y < tile; y += 1) {
            for (let x = 0; x < tile; x += 1) {
              if (Math.random() > 0.68 * ctx.quality.chanceScale) continue;

              const srcIdx = ((srcY + y) * width + (srcX + x)) * 4;
              const dstIdx = ((dstY + y) * width + (dstX + x)) * 4;

              data[dstIdx] = source[srcIdx];
              data[dstIdx + 1] = source[srcIdx + 1];
              data[dstIdx + 2] = source[srcIdx + 2];
              data[dstIdx + 3] = 255;
            }
          }
        }
      }
    }
  });

  registry.register({
    id: 'square-mirror-fold',
    label: 'Square Mirror Fold',
    cost: 2,
    chance: 0.86,
    minTier: 'balanced',
    balance: 0,
    apply(ctx) {
      const { data, source, width, height } = ctx;
      const intensity = Math.min(1.7, effectIntensity(ctx, 1.04));
      const folds = 4 + Math.floor(Math.random() * 5 + intensity * 1.5);

      for (let i = 0; i < folds; i += 1) {
        const size = 10 + Math.floor(Math.random() * 34);
        const srcX = Math.floor(Math.random() * Math.max(1, width - size));
        const srcY = Math.floor(Math.random() * Math.max(1, height - size));
        const dstX = Math.floor(Math.random() * Math.max(1, width - size));
        const dstY = Math.floor(Math.random() * Math.max(1, height - size));
        const flipX = Math.random() < 0.5;
        const flipY = Math.random() < 0.5;

        for (let y = 0; y < size; y += 1) {
          for (let x = 0; x < size; x += 1) {
            if (Math.random() > 0.74 * ctx.quality.chanceScale) continue;

            const sampleX = flipX ? size - 1 - x : x;
            const sampleY = flipY ? size - 1 - y : y;
            const srcIdx = ((srcY + sampleY) * width + (srcX + sampleX)) * 4;
            const dstIdx = ((dstY + y) * width + (dstX + x)) * 4;

            data[dstIdx] = source[srcIdx];
            data[dstIdx + 1] = source[srcIdx + 1];
            data[dstIdx + 2] = source[srcIdx + 2];
            data[dstIdx + 3] = 255;
          }
        }
      }
    }
  });

  registry.register({
    id: 'square-recursive-warp',
    label: 'Square Recursive Warp',
    cost: 3,
    chance: 0.8,
    minTier: 'high',
    balance: 0,
    apply(ctx) {
      const { data, source, width, height } = ctx;
      const intensity = Math.min(2, effectIntensity(ctx, 1.14));
      const passes = 2 + Math.floor(Math.random() * 2);

      for (let pass = 0; pass < passes; pass += 1) {
        const side = 14 + Math.floor(Math.random() * 26);
        const srcX = Math.floor(Math.random() * Math.max(1, width - side));
        const srcY = Math.floor(Math.random() * Math.max(1, height - side));
        const scale = 0.65 + Math.random() * (1.35 + intensity * 0.25);
        const dstSide = Math.max(8, Math.floor(side * scale));
        const dstX = Math.floor(Math.random() * Math.max(1, width - dstSide));
        const dstY = Math.floor(Math.random() * Math.max(1, height - dstSide));

        for (let y = 0; y < dstSide; y += 1) {
          const sy = Math.max(0, Math.min(height - 1, srcY + Math.floor((y / Math.max(1, dstSide - 1)) * (side - 1))));
          for (let x = 0; x < dstSide; x += 1) {
            if (Math.random() > 0.66 * ctx.quality.chanceScale) continue;

            const sx = Math.max(0, Math.min(width - 1, srcX + Math.floor((x / Math.max(1, dstSide - 1)) * (side - 1))));
            const dstIdx = ((dstY + y) * width + (dstX + x)) * 4;
            const srcIdx = (sy * width + sx) * 4;
            const restore = 0.16 + pass * 0.11;

            data[dstIdx] = Math.floor(source[srcIdx] * (1 - restore) + source[dstIdx] * restore);
            data[dstIdx + 1] = Math.floor(source[srcIdx + 1] * (1 - restore) + source[dstIdx + 1] * restore);
            data[dstIdx + 2] = Math.floor(source[srcIdx + 2] * (1 - restore) + source[dstIdx + 2] * restore);
            data[dstIdx + 3] = 255;
          }
        }
      }
    }
  });

  registry.register({
    id: 'temporal-echo',
    label: 'Temporal Echo',
    cost: 2,
    chance: 0.85,
    minTier: 'balanced',
    balance: 0,
    apply(ctx) {
      ops.temporalEcho(ctx, 3 + Math.floor(Math.random() * 3), 12);
    }
  });

  registry.register({
    id: 'tile-shatter',
    label: 'Tile Shatter Drift',
    cost: 2,
    chance: 0.8,
    minTier: 'balanced',
    balance: 0,
    apply(ctx) {
      ops.tileShatter(ctx, 14 + Math.floor(Math.random() * 14), 14);
    }
  });

  registry.register({
    id: 'ribbon-desync',
    label: 'Ribbon Desync',
    cost: 2,
    chance: 0.9,
    minTier: 'balanced',
    balance: 0,
    apply(ctx) {
      ops.ribbonDesync(ctx, 5 + Math.floor(Math.random() * 4));
    }
  });

  registry.register({
    id: 'ghost-trails',
    label: 'Channel Ghost Trails',
    cost: 2,
    chance: 0.85,
    minTier: 'balanced',
    balance: 0,
    apply(ctx) {
      ops.ghostTrails(ctx, 1 + Math.floor(Math.random() * 2), 12);
    }
  });

  registry.register({
    id: 'channel-fracture',
    label: 'Directional Channel Fracture',
    cost: 2,
    chance: 0.96,
    minTier: 'balanced',
    balance: 0,
    apply(ctx) {
      const { axis, direction } = axisDirection(ctx.meta);
      const intensity = effectIntensity(ctx, 1.25);
      ops.directionalChannelFracture(ctx, axis, direction, Math.min(1.9, intensity));
      if (Math.random() < 0.48) {
        ops.chromaBands(
          ctx,
          axis === 'x' ? direction * (2 + Math.floor(intensity * 2)) : 1,
          axis === 'y' ? direction * (1 + Math.floor(intensity * 2)) : 0,
          2 + Math.floor(Math.random() * 3)
        );
      }
    }
  });

  registry.register({
    id: 'wave-tear',
    label: 'Wave Scan Tear',
    cost: 3,
    chance: 0.9,
    minTier: 'balanced',
    balance: 0,
    apply(ctx) {
      const { axis, direction } = axisDirection(ctx.meta);
      const intensity = effectIntensity(ctx, 1.18);
      ops.waveScanTear(ctx, axis, direction, Math.min(1.8, intensity));
      ops.scanlineShear(ctx, 3 + Math.floor(Math.random() * 3), 16 + Math.floor(intensity * 8), 1);
    }
  });

  registry.register({
    id: 'edge-shard-jitter',
    label: 'Edge Locked Shard Jitter',
    cost: 2,
    chance: 0.92,
    minTier: 'balanced',
    balance: 0,
    apply(ctx) {
      const intensity = effectIntensity(ctx, 1.2);
      ops.edgeLockedShardJitter(ctx, Math.min(1.95, intensity));
      if (Math.random() < 0.42) ops.tileShatter(ctx, 8 + Math.floor(intensity * 7), 12);
    }
  });

  registry.register({
    id: 'per-channel-echo',
    label: 'Per Channel Temporal Echo',
    cost: 2,
    chance: 0.9,
    minTier: 'balanced',
    balance: 0,
    apply(ctx) {
      const intensity = effectIntensity(ctx, 1.05);
      ops.temporalEchoPerChannel(
        ctx,
        3 + Math.floor(Math.random() * 3),
        8 + Math.floor(intensity * 5),
        6 + Math.floor(intensity * 4),
        10 + Math.floor(intensity * 6),
        0.28
      );
    }
  });

  registry.register({
    id: 'edge-crawl',
    label: 'Edge Crawl Interference',
    cost: 1,
    chance: 0.95,
    balance: 1,
    apply(ctx) {
      ops.edgeCrawl(ctx, 2);
    }
  });

  registry.register({
    id: 'edge-sink',
    label: 'Edge Sink Interference',
    cost: 1,
    chance: 0.95,
    balance: -1,
    apply(ctx) {
      ops.edgeSink(ctx, 2);
    }
  });
}
