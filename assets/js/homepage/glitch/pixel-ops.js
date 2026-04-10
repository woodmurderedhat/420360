import { clamp, randInt } from './utils.js';

function channelOffset(baseIdx, width, height, channel, dx, dy) {
  const pixel = baseIdx / 4;
  const x = pixel % width;
  const y = Math.floor(pixel / width);
  const nx = clamp(x + dx, 0, width - 1);
  const ny = clamp(y + dy, 0, height - 1);
  return (ny * width + nx) * 4 + channel;
}

function anchoredBlend(current, sample, source, sourceBlend, noiseRange = 0) {
  const noisy = sample + (noiseRange > 0 ? randInt(-noiseRange, noiseRange) : 0);
  return clamp(Math.floor(current * (1 - sourceBlend) + noisy * (1 - sourceBlend) * 0.5 + source * sourceBlend), 0, 255);
}

export function colorShiftLocalRegion(
  { data, source, width, height },
  centerX,
  centerY,
  radius,
  {
    maxShift = 4,
    intensity = 1,
    pixelBudget = Number.POSITIVE_INFINITY,
    useSource = false,
    shape = 'circle',
    hardEdge = false
  } = {}
) {
  const cx = clamp(Math.floor(centerX), 0, width - 1);
  const cy = clamp(Math.floor(centerY), 0, height - 1);
  const r = Math.max(4, Math.floor(radius));
  const rSq = r * r;
  const minX = Math.max(0, cx - r);
  const maxX = Math.min(width - 1, cx + r);
  const minY = Math.max(0, cy - r);
  const maxY = Math.min(height - 1, cy + r);
  const useSquare = shape === 'square';
  const sample = useSource ? source : data;
  const chaos = Math.max(0.3, intensity);
  let processed = 0;

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (processed >= pixelBudget) return processed;

      const dx = x - cx;
      const dy = y - cy;
      const distSq = dx * dx + dy * dy;
      if (!useSquare && distSq > rSq) continue;

      const falloff = hardEdge
        ? 1
        : (useSquare
          ? Math.max(0, 1 - Math.max(Math.abs(dx), Math.abs(dy)) / r)
          : 1 - distSq / rSq);
      const writeChance = hardEdge ? (0.72 + 0.2 * Math.min(1, chaos)) : (0.33 + 0.62 * falloff * chaos);
      if (Math.random() > writeChance) continue;

      const shift = Math.max(1, Math.floor(maxShift * (0.6 + falloff)));
      const sx = clamp(x + randInt(-shift, shift), 0, width - 1);
      const sy = clamp(y + randInt(-shift, shift), 0, height - 1);
      const srcIdx = (sy * width + sx) * 4;
      const dstIdx = (y * width + x) * 4;

      const modeRoll = Math.random();
      if (modeRoll < 0.52) {
        const restoreBlend = 0.26 + 0.4 * falloff;
        data[dstIdx] = clamp(
          Math.floor(
            sample[channelOffset(srcIdx, width, height, 0, randInt(-2, 3), randInt(-1, 1))] * (1 - restoreBlend)
            + source[dstIdx] * restoreBlend
          ) + randInt(-7, 9),
          0,
          255
        );
        data[dstIdx + 1] = clamp(
          Math.floor(
            sample[channelOffset(srcIdx, width, height, 1, randInt(-2, 2), randInt(-1, 1))] * (1 - restoreBlend)
            + source[dstIdx + 1] * restoreBlend
          ) + randInt(-7, 9),
          0,
          255
        );
        data[dstIdx + 2] = clamp(
          Math.floor(
            sample[channelOffset(srcIdx, width, height, 2, randInt(-3, 3), randInt(-1, 1))] * (1 - restoreBlend)
            + source[dstIdx + 2] * restoreBlend
          ) + randInt(-7, 9),
          0,
          255
        );
      } else if (modeRoll < 0.82) {
        const restoreBlend = 0.34 + 0.36 * falloff;
        data[dstIdx] = clamp(
          Math.floor(
            sample[channelOffset(srcIdx, width, height, 0, randInt(-4, 4), randInt(-2, 2))] * (1 - restoreBlend)
            + source[dstIdx] * restoreBlend
          ) + randInt(-12, 13),
          0,
          255
        );
        data[dstIdx + 1] = clamp(
          Math.floor(
            sample[channelOffset(srcIdx, width, height, 1, randInt(-3, 3), randInt(-2, 2))] * (1 - restoreBlend)
            + source[dstIdx + 1] * restoreBlend
          ) + randInt(-10, 11),
          0,
          255
        );
        data[dstIdx + 2] = clamp(
          Math.floor(
            sample[channelOffset(srcIdx, width, height, 2, randInt(-4, 4), randInt(-2, 2))] * (1 - restoreBlend)
            + source[dstIdx + 2] * restoreBlend
          ) + randInt(-12, 13),
          0,
          255
        );
      } else {
        // Restore-biased blend removes snow artifacts while keeping glitch motion.
        const restoreBlend = 0.44 + 0.4 * falloff;
        data[dstIdx] = clamp(Math.floor(sample[srcIdx] * (1 - restoreBlend) + source[dstIdx] * restoreBlend) + randInt(-6, 8), 0, 255);
        data[dstIdx + 1] = clamp(Math.floor(sample[srcIdx + 1] * (1 - restoreBlend) + source[dstIdx + 1] * restoreBlend) + randInt(-6, 8), 0, 255);
        data[dstIdx + 2] = clamp(Math.floor(sample[srcIdx + 2] * (1 - restoreBlend) + source[dstIdx + 2] * restoreBlend) + randInt(-6, 8), 0, 255);
      }

      data[dstIdx + 3] = 255;
      processed += 1;
    }
  }

  return processed;
}

export function cascadingPixelSmear(
  { data, source, width, height },
  centerX,
  centerY,
  baseRadius,
  {
    cascadeCount = 3,
    intensity = 1,
    pixelBudget = Number.POSITIVE_INFINITY,
    shape = 'circle',
    hardEdge = false
  } = {}
) {
  let processed = 0;
  let anchorX = clamp(Math.floor(centerX), 0, width - 1);
  let anchorY = clamp(Math.floor(centerY), 0, height - 1);
  const cascades = Math.max(1, Math.floor(cascadeCount));
  const useSquare = shape === 'square';

  for (let pass = 0; pass < cascades; pass += 1) {
    if (processed >= pixelBudget) break;

    const radius = Math.max(6, Math.floor(baseRadius * Math.pow(0.72, pass)));
    const rSq = radius * radius;
    const minX = Math.max(0, anchorX - radius);
    const maxX = Math.min(width - 1, anchorX + radius);
    const minY = Math.max(0, anchorY - radius);
    const maxY = Math.min(height - 1, anchorY + radius);
    const remaining = pixelBudget - processed;
    const passBudget = Math.max(1, Math.floor(remaining / (cascades - pass)));
    const directionalShift = Math.max(1, Math.floor((2 + pass * 1.8) * intensity));
    const colorNoise = Math.floor(3 + pass * 3 * intensity);
    let passProcessed = 0;

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (passProcessed >= passBudget || processed >= pixelBudget) break;

        const dx = x - anchorX;
        const dy = y - anchorY;
        const distSq = dx * dx + dy * dy;
        if (!useSquare && distSq > rSq) continue;

        const falloff = hardEdge
          ? 1
          : (useSquare
            ? Math.max(0, 1 - Math.max(Math.abs(dx), Math.abs(dy)) / radius)
            : 1 - distSq / rSq);
        const copyChance = hardEdge
          ? Math.min(0.97, 0.72 + 0.18 * intensity)
          : Math.min(0.97, 0.42 + falloff * 0.66 * intensity);
        if (Math.random() > copyChance) continue;

        const sx = clamp(x + randInt(-directionalShift, directionalShift) + (pass + 1) * randInt(-1, 1), 0, width - 1);
        const sy = clamp(y + randInt(-directionalShift, directionalShift) + (pass + 1) * randInt(-1, 1), 0, height - 1);
        const srcIdx = (sy * width + sx) * 4;
        const dstIdx = (y * width + x) * 4;

        const restoreBlend = 0.3 + 0.34 * falloff;
        const sampleBlend = 0.55 - Math.min(0.25, 0.12 * pass);
        data[dstIdx] = clamp(
          Math.floor((data[srcIdx] * sampleBlend + source[srcIdx] * (1 - sampleBlend)) * (1 - restoreBlend) + source[dstIdx] * restoreBlend) + randInt(-colorNoise, colorNoise),
          0,
          255
        );
        data[dstIdx + 1] = clamp(
          Math.floor((data[srcIdx + 1] * sampleBlend + source[srcIdx + 1] * (1 - sampleBlend)) * (1 - restoreBlend) + source[dstIdx + 1] * restoreBlend) + randInt(-colorNoise, colorNoise),
          0,
          255
        );
        data[dstIdx + 2] = clamp(
          Math.floor((data[srcIdx + 2] * sampleBlend + source[srcIdx + 2] * (1 - sampleBlend)) * (1 - restoreBlend) + source[dstIdx + 2] * restoreBlend) + randInt(-colorNoise, colorNoise),
          0,
          255
        );
        data[dstIdx + 3] = 255;

        passProcessed += 1;
        processed += 1;
      }
    }

    anchorX = clamp(anchorX + randInt(-directionalShift * 2, directionalShift * 2), 0, width - 1);
    anchorY = clamp(anchorY + randInt(-directionalShift * 2, directionalShift * 2), 0, height - 1);
  }

  return processed;
}

export function displacePixels({ data, source, width, height }, intensity = 0.08, maxDisplacement = 3) {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (Math.random() > intensity) continue;

      const sx = clamp(x + randInt(-maxDisplacement, maxDisplacement), 0, width - 1);
      const sy = clamp(y + randInt(-maxDisplacement, maxDisplacement), 0, height - 1);
      const targetIdx = (y * width + x) * 4;
      const srcIdx = (sy * width + sx) * 4;

      data[targetIdx] = source[channelOffset(srcIdx, width, height, 0, randInt(-1, 1), randInt(-1, 1))];
      data[targetIdx + 1] = source[channelOffset(srcIdx, width, height, 1, randInt(-1, 1), randInt(-1, 1))];
      data[targetIdx + 2] = source[channelOffset(srcIdx, width, height, 2, randInt(-2, 2), randInt(-1, 1))];
      data[targetIdx + 3] = 255;
    }
  }
}

export function blockTears({ data, source, width, height }, tearCount = 10) {
  for (let t = 0; t < tearCount; t += 1) {
    const blockW = randInt(8, 42);
    const blockH = randInt(6, 24);
    const srcX = randInt(0, Math.max(0, width - blockW));
    const srcY = randInt(0, Math.max(0, height - blockH));
    const shiftX = randInt(-64, 64);
    const shiftY = randInt(-20, 20);

    for (let by = 0; by < blockH; by += 1) {
      const rowSrcY = srcY + by;
      const rowDstY = clamp(rowSrcY + shiftY, 0, height - 1);

      for (let bx = 0; bx < blockW; bx += 1) {
        const rowSrcX = srcX + bx;
        const rowDstX = clamp(rowSrcX + shiftX, 0, width - 1);
        const srcIdx = (rowSrcY * width + clamp(rowSrcX + randInt(-2, 2), 0, width - 1)) * 4;
        const dstIdx = (rowDstY * width + rowDstX) * 4;

        data[dstIdx] = source[srcIdx];
        data[dstIdx + 1] = source[srcIdx + 1];
        data[dstIdx + 2] = source[srcIdx + 2];
        data[dstIdx + 3] = 255;
      }
    }
  }
}

export function digitalTearExpand({ data, source, width, height }) {
  const srcW = randInt(18, Math.max(20, Math.floor(width * 0.12)));
  const srcH = randInt(10, Math.max(12, Math.floor(height * 0.08)));
  const srcX = randInt(0, Math.max(0, width - srcW));
  const srcY = randInt(0, Math.max(0, height - srcH));

  const dstW = clamp(Math.floor(srcW * (1.4 + Math.random() * 1.8)), 12, width);
  const dstH = clamp(Math.floor(srcH * (0.85 + Math.random() * 0.55)), 8, height);
  const dstX = randInt(0, Math.max(0, width - dstW));
  const dstY = randInt(0, Math.max(0, height - dstH));

  for (let y = 0; y < dstH; y += 1) {
    const edgeNoise = randInt(-2, 2);
    const yRatio = dstH <= 1 ? 0 : y / (dstH - 1);
    const sy = clamp(srcY + Math.floor(yRatio * (srcH - 1)), 0, height - 1);

    for (let x = 0; x < dstW; x += 1) {
      if ((x < 2 || x > dstW - 3) && Math.random() < 0.4) continue;

      const xRatio = dstW <= 1 ? 0 : x / (dstW - 1);
      const sx = clamp(srcX + Math.floor(xRatio * (srcW - 1)) + edgeNoise, 0, width - 1);
      const dstIdx = ((dstY + y) * width + (dstX + x)) * 4;
      const srcBase = (sy * width + sx) * 4;

      data[dstIdx] = source[channelOffset(srcBase, width, height, 0, randInt(-2, 2), randInt(-1, 1))];
      data[dstIdx + 1] = source[channelOffset(srcBase, width, height, 1, randInt(-1, 1), randInt(-1, 1))];
      data[dstIdx + 2] = source[channelOffset(srcBase, width, height, 2, randInt(-3, 3), randInt(-1, 1))];
      data[dstIdx + 3] = 255;
    }
  }
}

export function scanlineShear({ data, source, width, height }, lineCount = 2, maxShift = 6, lineHeight = 1) {
  for (let l = 0; l < lineCount; l += 1) {
    const y = randInt(0, height - 1);
    const shift = randInt(-maxShift, maxShift);

    for (let dy = 0; dy < lineHeight; dy += 1) {
      const lineY = clamp(y + dy, 0, height - 1);
      for (let x = 0; x < width; x += 1) {
        const sx = clamp(x + shift, 0, width - 1);
        const srcIdx = (lineY * width + sx) * 4;
        const dstIdx = (lineY * width + x) * 4;
        data[dstIdx] = source[srcIdx];
        data[dstIdx + 1] = source[srcIdx + 1];
        data[dstIdx + 2] = source[srcIdx + 2];
        data[dstIdx + 3] = 255;
      }
    }
  }
}

export function columnShear({ data, source, width, height }, columnCount = 2, maxShift = 6, columnWidth = 1) {
  for (let c = 0; c < columnCount; c += 1) {
    const x = randInt(0, width - 1);
    const shift = randInt(-maxShift, maxShift);

    for (let dx = 0; dx < columnWidth; dx += 1) {
      const columnX = clamp(x + dx, 0, width - 1);
      for (let y = 0; y < height; y += 1) {
        const sy = clamp(y + shift, 0, height - 1);
        const srcIdx = (sy * width + columnX) * 4;
        const dstIdx = (y * width + columnX) * 4;
        data[dstIdx] = source[srcIdx];
        data[dstIdx + 1] = source[srcIdx + 1];
        data[dstIdx + 2] = source[srcIdx + 2];
        data[dstIdx + 3] = 255;
      }
    }
  }
}

export function pixelateChunks({ data, source, width, height }, chunkCount = 12, minSize = 5, maxSize = 18) {
  for (let c = 0; c < chunkCount; c += 1) {
    const chunkSize = randInt(minSize, maxSize);
    const startX = randInt(0, Math.max(0, width - chunkSize));
    const startY = randInt(0, Math.max(0, height - chunkSize));
    const sampleX = clamp(startX + randInt(-12, 12), 0, width - 1);
    const sampleY = clamp(startY + randInt(-12, 12), 0, height - 1);
    const sampleIdx = (sampleY * width + sampleX) * 4;

    const r = source[sampleIdx];
    const g = source[sampleIdx + 1];
    const b = source[sampleIdx + 2];

    for (let y = 0; y < chunkSize; y += 1) {
      for (let x = 0; x < chunkSize; x += 1) {
        const idx = ((startY + y) * width + (startX + x)) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
  }
}

export function frameSlip({ data, source, width, height }, direction = 1) {
  const bandCount = 2 + randInt(0, 2);
  for (let b = 0; b < bandCount; b += 1) {
    const bandH = randInt(8, 42);
    const startY = randInt(0, Math.max(0, height - bandH));
    const shiftY = direction * randInt(6, 24);

    for (let y = 0; y < bandH; y += 1) {
      const sy = clamp(startY + y, 0, height - 1);
      const dy = clamp(sy + shiftY, 0, height - 1);

      for (let x = 0; x < width; x += 1) {
        const sx = clamp(x + randInt(-2, 2), 0, width - 1);
        const srcIdx = (sy * width + sx) * 4;
        const dstIdx = (dy * width + x) * 4;

        data[dstIdx] = source[srcIdx];
        data[dstIdx + 1] = source[srcIdx + 1];
        data[dstIdx + 2] = source[srcIdx + 2];
        data[dstIdx + 3] = 255;
      }
    }
  }
}

export function chromaBands({ data, source, width, height }, dx = 2, dy = 0, bandCount = 3) {
  for (let b = 0; b < bandCount; b += 1) {
    const bandY = randInt(0, height - 1);
    const bandH = randInt(2, 8);
    const polarity = b % 2 === 0 ? 1 : -1;
    const localDx = Math.max(-8, Math.min(8, Math.floor(dx * polarity)));
    const localDy = Math.max(-6, Math.min(6, Math.floor(dy * polarity)));
    const anchorBlend = 0.28 + Math.random() * 0.22;

    for (let y = 0; y < bandH; y += 1) {
      const py = clamp(bandY + y, 0, height - 1);
      for (let x = 0; x < width; x += 1) {
        const base = (py * width + x) * 4;
        const rIdx = channelOffset(base, width, height, 0, localDx, localDy);
        const gIdx = channelOffset(base, width, height, 1, Math.floor(localDx * 0.5), Math.floor(localDy * 0.5));
        const bIdx = channelOffset(base, width, height, 2, -localDx, -localDy);

        data[base] = anchoredBlend(data[base], source[rIdx], source[base], anchorBlend, 7);
        data[base + 1] = anchoredBlend(data[base + 1], source[gIdx], source[base + 1], anchorBlend, 6);
        data[base + 2] = anchoredBlend(data[base + 2], source[bIdx], source[base + 2], anchorBlend, 7);
        data[base + 3] = 255;
      }
    }
  }
}

export function lumaDropout({ data, width, height }, stripeCount = 2, minH = 16, maxH = 42) {
  for (let s = 0; s < stripeCount; s += 1) {
    const startY = randInt(0, height - 1);
    const stripeH = randInt(minH, maxH);
    const factor = 0.38 + Math.random() * 0.35;

    for (let y = 0; y < stripeH; y += 1) {
      const py = clamp(startY + y, 0, height - 1);
      for (let x = 0; x < width; x += 1) {
        const idx = (py * width + x) * 4;
        data[idx] = Math.floor(data[idx] * factor);
        data[idx + 1] = Math.floor(data[idx + 1] * factor);
        data[idx + 2] = Math.floor(data[idx + 2] * factor);
      }
    }
  }
}

export function lumaBoost({ data, width, height }, stripeCount = 2, minH = 16, maxH = 42) {
  for (let s = 0; s < stripeCount; s += 1) {
    const startY = randInt(0, height - 1);
    const stripeH = randInt(minH, maxH);
    const factor = 1.14 + Math.random() * 0.28;

    for (let y = 0; y < stripeH; y += 1) {
      const py = clamp(startY + y, 0, height - 1);
      for (let x = 0; x < width; x += 1) {
        const idx = (py * width + x) * 4;
        data[idx] = clamp(Math.floor(data[idx] * factor), 0, 255);
        data[idx + 1] = clamp(Math.floor(data[idx + 1] * factor), 0, 255);
        data[idx + 2] = clamp(Math.floor(data[idx + 2] * factor), 0, 255);
      }
    }
  }
}

export function verticalScratches({ data, width, height }, count = 2) {
  for (let s = 0; s < count; s += 1) {
    const x = randInt(0, width - 1);
    const thickness = randInt(1, 2);
    const brightness = 145 + randInt(0, 70);

    for (let y = 0; y < height; y += 1) {
      for (let dx = 0; dx < thickness; dx += 1) {
        const px = clamp(x + dx, 0, width - 1);
        const idx = (y * width + px) * 4;
        data[idx] = clamp(data[idx] + brightness * 0.17, 0, 255);
        data[idx + 1] = clamp(data[idx + 1] + brightness * 0.17, 0, 255);
        data[idx + 2] = clamp(data[idx + 2] + brightness * 0.16, 0, 255);
      }
    }
  }
}

export function horizontalScratches({ data, width, height }, count = 2) {
  for (let s = 0; s < count; s += 1) {
    const y = randInt(0, height - 1);
    const thickness = randInt(1, 2);
    const brightness = 145 + randInt(0, 70);

    for (let x = 0; x < width; x += 1) {
      for (let dy = 0; dy < thickness; dy += 1) {
        const py = clamp(y + dy, 0, height - 1);
        const idx = (py * width + x) * 4;
        data[idx] = clamp(data[idx] + brightness * 0.17, 0, 255);
        data[idx + 1] = clamp(data[idx + 1] + brightness * 0.17, 0, 255);
        data[idx + 2] = clamp(data[idx + 2] + brightness * 0.16, 0, 255);
      }
    }
  }
}

export function temporalEcho({ data, source, width, height }, slices = 4, spread = 14) {
  for (let s = 0; s < slices; s += 1) {
    const y = randInt(0, height - 1);
    const h = randInt(8, 32);
    const shift = randInt(-spread, spread);

    for (let dy = 0; dy < h; dy += 1) {
      const py = clamp(y + dy, 0, height - 1);
      for (let x = 0; x < width; x += 1) {
        const sx = clamp(x + shift, 0, width - 1);
        const srcIdx = (py * width + sx) * 4;
        const dstIdx = (py * width + x) * 4;
        data[dstIdx] = Math.floor(source[srcIdx] * 0.92 + data[dstIdx] * 0.08);
        data[dstIdx + 1] = Math.floor(source[srcIdx + 1] * 0.92 + data[dstIdx + 1] * 0.08);
        data[dstIdx + 2] = Math.floor(source[srcIdx + 2] * 0.92 + data[dstIdx + 2] * 0.08);
      }
    }
  }
}

export function tileShatter({ data, source, width, height }, tileCount = 20, tileSize = 14) {
  for (let i = 0; i < tileCount; i += 1) {
    const w = randInt(Math.max(4, tileSize - 6), tileSize + 4);
    const h = randInt(Math.max(4, tileSize - 6), tileSize + 4);
    const sx0 = randInt(0, Math.max(0, width - w));
    const sy0 = randInt(0, Math.max(0, height - h));
    const dx0 = clamp(sx0 + randInt(-24, 24), 0, width - w);
    const dy0 = clamp(sy0 + randInt(-24, 24), 0, height - h);

    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const srcIdx = ((sy0 + y) * width + (sx0 + x)) * 4;
        const dstIdx = ((dy0 + y) * width + (dx0 + x)) * 4;
        data[dstIdx] = source[srcIdx];
        data[dstIdx + 1] = source[srcIdx + 1];
        data[dstIdx + 2] = source[srcIdx + 2];
        data[dstIdx + 3] = 255;
      }
    }
  }
}

export function ribbonDesync({ data, source, width, height }, ribbons = 6) {
  for (let r = 0; r < ribbons; r += 1) {
    const bandY = randInt(0, height - 1);
    const bandH = randInt(6, 18);
    const shiftX = randInt(-40, 40);

    for (let y = 0; y < bandH; y += 1) {
      const py = clamp(bandY + y, 0, height - 1);
      for (let x = 0; x < width; x += 1) {
        const sx = clamp(x + shiftX + randInt(-2, 2), 0, width - 1);
        const srcBase = (py * width + sx) * 4;
        const dstBase = (py * width + x) * 4;

        data[dstBase] = source[channelOffset(srcBase, width, height, 0, randInt(-2, 2), 0)];
        data[dstBase + 1] = source[channelOffset(srcBase, width, height, 1, randInt(-1, 1), 0)];
        data[dstBase + 2] = source[channelOffset(srcBase, width, height, 2, randInt(-3, 3), 0)];
        data[dstBase + 3] = 255;
      }
    }
  }
}

export function ghostTrails({ data, source, width, height }, trailCount = 2, offset = 10) {
  for (let t = 0; t < trailCount; t += 1) {
    const ox = randInt(-offset, offset);
    const oy = randInt(-offset, offset);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const sx = clamp(x + ox, 0, width - 1);
        const sy = clamp(y + oy, 0, height - 1);
        const srcIdx = (sy * width + sx) * 4;
        const dstIdx = (y * width + x) * 4;

        data[dstIdx] = Math.floor(data[dstIdx] * 0.68 + source[srcIdx] * 0.32);
        data[dstIdx + 1] = Math.floor(data[dstIdx + 1] * 0.68 + source[srcIdx + 1] * 0.32);
        data[dstIdx + 2] = Math.floor(data[dstIdx + 2] * 0.68 + source[srcIdx + 2] * 0.32);
      }
    }
  }
}

export function directionalChannelFracture(
  { data, source, width, height },
  axis = 'x',
  direction = 1,
  intensity = 1
) {
  const axisIsX = axis !== 'y';
  const bands = 3 + randInt(0, 3);
  const baseShift = Math.max(1, Math.floor(2 + intensity * 4));
  const blend = Math.min(0.5, 0.24 + intensity * 0.18);

  for (let b = 0; b < bands; b += 1) {
    const bandStart = axisIsX ? randInt(0, height - 1) : randInt(0, width - 1);
    const bandSize = randInt(6, axisIsX ? 24 : 36);
    const localShift = baseShift + randInt(-2, 2);
    const signedShift = direction * (b % 2 === 0 ? localShift : -localShift);

    if (axisIsX) {
      for (let y = 0; y < bandSize; y += 1) {
        const py = clamp(bandStart + y, 0, height - 1);
        for (let x = 0; x < width; x += 1) {
          const idx = (py * width + x) * 4;
          const rIdx = channelOffset(idx, width, height, 0, signedShift, 0);
          const gIdx = channelOffset(idx, width, height, 1, Math.floor(signedShift * 0.4), randInt(-1, 1));
          const bIdx = channelOffset(idx, width, height, 2, -signedShift, 0);
          data[idx] = anchoredBlend(data[idx], source[rIdx], source[idx], blend, 8);
          data[idx + 1] = anchoredBlend(data[idx + 1], source[gIdx], source[idx + 1], blend, 7);
          data[idx + 2] = anchoredBlend(data[idx + 2], source[bIdx], source[idx + 2], blend, 8);
        }
      }
    } else {
      for (let x = 0; x < bandSize; x += 1) {
        const px = clamp(bandStart + x, 0, width - 1);
        for (let y = 0; y < height; y += 1) {
          const idx = (y * width + px) * 4;
          const rIdx = channelOffset(idx, width, height, 0, randInt(-1, 1), signedShift);
          const gIdx = channelOffset(idx, width, height, 1, randInt(-1, 1), Math.floor(signedShift * 0.4));
          const bIdx = channelOffset(idx, width, height, 2, randInt(-1, 1), -signedShift);
          data[idx] = anchoredBlend(data[idx], source[rIdx], source[idx], blend, 8);
          data[idx + 1] = anchoredBlend(data[idx + 1], source[gIdx], source[idx + 1], blend, 7);
          data[idx + 2] = anchoredBlend(data[idx + 2], source[bIdx], source[idx + 2], blend, 8);
        }
      }
    }
  }
}

export function waveScanTear(
  { data, source, width, height },
  axis = 'x',
  direction = 1,
  intensity = 1
) {
  const axisIsX = axis !== 'y';
  const amplitude = Math.max(3, Math.floor(6 + intensity * 12));
  const wavelength = Math.max(16, Math.floor((axisIsX ? width : height) / (5 + intensity * 2)));
  const blend = Math.min(0.48, 0.26 + intensity * 0.14);
  const phase = Math.random() * Math.PI * 2;

  if (axisIsX) {
    for (let y = 0; y < height; y += 1) {
      const wave = Math.sin((y / wavelength) * Math.PI * 2 + phase);
      const shift = Math.floor(wave * amplitude * direction);
      for (let x = 0; x < width; x += 1) {
        const idx = (y * width + x) * 4;
        const srcX = clamp(x + shift + randInt(-1, 1), 0, width - 1);
        const srcIdx = (y * width + srcX) * 4;
        data[idx] = anchoredBlend(data[idx], source[srcIdx], source[idx], blend, 6);
        data[idx + 1] = anchoredBlend(data[idx + 1], source[srcIdx + 1], source[idx + 1], blend, 6);
        data[idx + 2] = anchoredBlend(data[idx + 2], source[srcIdx + 2], source[idx + 2], blend, 6);
      }
    }
    return;
  }

  for (let x = 0; x < width; x += 1) {
    const wave = Math.sin((x / wavelength) * Math.PI * 2 + phase);
    const shift = Math.floor(wave * amplitude * direction);
    for (let y = 0; y < height; y += 1) {
      const idx = (y * width + x) * 4;
      const srcY = clamp(y + shift + randInt(-1, 1), 0, height - 1);
      const srcIdx = (srcY * width + x) * 4;
      data[idx] = anchoredBlend(data[idx], source[srcIdx], source[idx], blend, 6);
      data[idx + 1] = anchoredBlend(data[idx + 1], source[srcIdx + 1], source[idx + 1], blend, 6);
      data[idx + 2] = anchoredBlend(data[idx + 2], source[srcIdx + 2], source[idx + 2], blend, 6);
    }
  }
}

export function edgeLockedShardJitter({ data, source, width, height }, intensity = 1) {
  const shardCount = Math.max(8, Math.floor(12 + intensity * 16));
  const maxShift = Math.max(4, Math.floor(7 + intensity * 12));

  for (let i = 0; i < shardCount; i += 1) {
    const w = randInt(8, 26);
    const h = randInt(8, 26);
    const x0 = randInt(1, Math.max(1, width - w - 2));
    const y0 = randInt(1, Math.max(1, height - h - 2));
    const centerX = x0 + Math.floor(w / 2);
    const centerY = y0 + Math.floor(h / 2);
    const centerIdx = (centerY * width + centerX) * 4;
    const rightIdx = (centerY * width + clamp(centerX + 1, 0, width - 1)) * 4;
    const downIdx = (clamp(centerY + 1, 0, height - 1) * width + centerX) * 4;
    const edgeScore = Math.abs(source[centerIdx] - source[rightIdx]) + Math.abs(source[centerIdx + 1] - source[downIdx + 1]);
    if (edgeScore < 26) continue;

    const sx = clamp(x0 + randInt(-maxShift, maxShift), 0, width - w);
    const sy = clamp(y0 + randInt(-maxShift, maxShift), 0, height - h);
    const blend = Math.min(0.52, 0.28 + intensity * 0.2);

    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const srcIdx = ((sy + y) * width + (sx + x)) * 4;
        const dstIdx = ((y0 + y) * width + (x0 + x)) * 4;
        data[dstIdx] = anchoredBlend(data[dstIdx], source[srcIdx], source[dstIdx], blend, 7);
        data[dstIdx + 1] = anchoredBlend(data[dstIdx + 1], source[srcIdx + 1], source[dstIdx + 1], blend, 7);
        data[dstIdx + 2] = anchoredBlend(data[dstIdx + 2], source[srcIdx + 2], source[dstIdx + 2], blend, 7);
      }
    }
  }
}

export function temporalEchoPerChannel(
  { data, source, width, height },
  slices = 4,
  spreadR = 10,
  spreadG = 8,
  spreadB = 12,
  anchor = 0.3
) {
  for (let s = 0; s < slices; s += 1) {
    const y = randInt(0, height - 1);
    const h = randInt(8, 30);
    const shiftR = randInt(-spreadR, spreadR);
    const shiftG = randInt(-spreadG, spreadG);
    const shiftB = randInt(-spreadB, spreadB);

    for (let dy = 0; dy < h; dy += 1) {
      const py = clamp(y + dy, 0, height - 1);
      for (let x = 0; x < width; x += 1) {
        const dstIdx = (py * width + x) * 4;
        const rIdx = (py * width + clamp(x + shiftR, 0, width - 1)) * 4;
        const gIdx = (py * width + clamp(x + shiftG, 0, width - 1)) * 4;
        const bIdx = (py * width + clamp(x + shiftB, 0, width - 1)) * 4;
        data[dstIdx] = Math.floor(data[dstIdx] * (0.54 - anchor * 0.25) + source[rIdx] * (0.46 - anchor * 0.16) + source[dstIdx] * anchor);
        data[dstIdx + 1] = Math.floor(data[dstIdx + 1] * (0.54 - anchor * 0.25) + source[gIdx + 1] * (0.46 - anchor * 0.16) + source[dstIdx + 1] * anchor);
        data[dstIdx + 2] = Math.floor(data[dstIdx + 2] * (0.54 - anchor * 0.25) + source[bIdx + 2] * (0.46 - anchor * 0.16) + source[dstIdx + 2] * anchor);
      }
    }
  }
}

export function edgeCrawl({ data, source, width, height }, stride = 2) {
  for (let y = 1; y < height - 1; y += stride) {
    for (let x = 1; x < width - 1; x += stride) {
      const idx = (y * width + x) * 4;
      const right = (y * width + (x + 1)) * 4;
      const down = ((y + 1) * width + x) * 4;

      const diff = Math.abs(source[idx] - source[right]) + Math.abs(source[idx + 1] - source[down + 1]);
      if (diff < 36) continue;

      data[idx] = clamp(data[idx] + randInt(10, 46), 0, 255);
      data[idx + 1] = clamp(data[idx + 1] + randInt(4, 20), 0, 255);
      data[idx + 2] = clamp(data[idx + 2] + randInt(8, 30), 0, 255);
      data[idx + 3] = 255;
    }
  }
}

export function edgeSink({ data, source, width, height }, stride = 2) {
  for (let y = 1; y < height - 1; y += stride) {
    for (let x = 1; x < width - 1; x += stride) {
      const idx = (y * width + x) * 4;
      const right = (y * width + (x + 1)) * 4;
      const down = ((y + 1) * width + x) * 4;

      const diff = Math.abs(source[idx] - source[right]) + Math.abs(source[idx + 1] - source[down + 1]);
      if (diff < 36) continue;

      data[idx] = clamp(data[idx] - randInt(10, 34), 0, 255);
      data[idx + 1] = clamp(data[idx + 1] - randInt(6, 24), 0, 255);
      data[idx + 2] = clamp(data[idx + 2] - randInt(8, 28), 0, 255);
      data[idx + 3] = 255;
    }
  }
}
