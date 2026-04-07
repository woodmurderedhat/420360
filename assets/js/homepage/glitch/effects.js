import * as ops from './pixel-ops.js';

function axisDirection(meta) {
  const axis = meta?.axis || 'x';
  const direction = meta?.direction || 1;
  return { axis, direction };
}

export function registerDefaultEffects(registry) {
  registry.register({
    id: 'drift-shear',
    label: 'Drift Shear',
    cost: 1,
    chance: 1,
    apply(ctx) {
      ops.displacePixels(ctx, 0.08 * ctx.quality.intensityScale, 3);
      ops.scanlineShear(ctx, 1 + Math.floor(Math.random() * 2), 7, 1);
      if (Math.random() < 0.3 * ctx.quality.chanceScale) ops.chromaBands(ctx, 1, 0, 2);
    }
  });

  registry.register({
    id: 'chroma-banding',
    label: 'Chroma Banding',
    cost: 1,
    chance: 0.9,
    apply(ctx) {
      const { axis, direction } = axisDirection(ctx.meta);
      const dx = axis === 'x' ? direction * (2 + Math.floor(Math.random() * 3)) : Math.floor(Math.random() * 4) - 2;
      const dy = axis === 'y' ? direction * (1 + Math.floor(Math.random() * 2)) : 0;
      ops.chromaBands(ctx, dx, dy, 2 + Math.floor(Math.random() * 3));
    }
  });

  registry.register({
    id: 'swipe-tear',
    label: 'Swipe Tear',
    cost: 2,
    chance: 1,
    apply(ctx) {
      const { axis, direction } = axisDirection(ctx.meta);
      ops.displacePixels(ctx, 0.14 * ctx.quality.intensityScale, 6);
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
    apply(ctx) {
      ops.blockTears(ctx, 8 + Math.floor(Math.random() * 7));
      ops.scanlineShear(ctx, 5 + Math.floor(Math.random() * 3), 24, 1);
      ops.chromaBands(ctx, Math.floor(Math.random() * 13) - 6, Math.floor(Math.random() * 7) - 3, 5);
      if (Math.random() < 0.45) ops.lumaDropout(ctx, 1 + Math.floor(Math.random() * 3), 16, 40);
    }
  });

  registry.register({
    id: 'jitter-grid',
    label: 'Jitter Grid',
    cost: 2,
    chance: 0.95,
    apply(ctx) {
      ops.pixelateChunks(ctx, 14 + Math.floor(Math.random() * 10), 4, 14);
      ops.displacePixels(ctx, 0.12 * ctx.quality.intensityScale, 5);
      ops.verticalScratches(ctx, 2 + Math.floor(Math.random() * 3));
    }
  });

  registry.register({
    id: 'surge-overdrive',
    label: 'Surge Overdrive',
    cost: 3,
    chance: 1,
    apply(ctx) {
      const { axis, direction } = axisDirection(ctx.meta);
      ops.digitalTearExpand(ctx);
      ops.displacePixels(ctx, 0.2 * ctx.quality.intensityScale, 8);
      ops.scanlineShear(ctx, 5 + Math.floor(Math.random() * 4), 26, 1);
      ops.chromaBands(ctx, axis === 'x' ? direction * 6 : 2, axis === 'y' ? direction * 5 : 1, 5);
    }
  });

  registry.register({
    id: 'stall-dropout',
    label: 'Stall Dropout',
    cost: 2,
    chance: 1,
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
    id: 'temporal-echo',
    label: 'Temporal Echo',
    cost: 2,
    chance: 0.85,
    minTier: 'balanced',
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
    apply(ctx) {
      ops.ghostTrails(ctx, 1 + Math.floor(Math.random() * 2), 12);
    }
  });

  registry.register({
    id: 'edge-crawl',
    label: 'Edge Crawl Interference',
    cost: 1,
    chance: 0.95,
    apply(ctx) {
      ops.edgeCrawl(ctx, 2);
    }
  });
}
