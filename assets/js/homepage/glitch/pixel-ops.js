import { clamp, randInt } from './utils.js';

function channelOffset(baseIdx, width, height, channel, dx, dy) {
  const pixel = baseIdx / 4;
  const x = pixel % width;
  const y = Math.floor(pixel / width);
  const nx = clamp(x + dx, 0, width - 1);
  const ny = clamp(y + dy, 0, height - 1);
  return (ny * width + nx) * 4 + channel;
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

    for (let y = 0; y < bandH; y += 1) {
      const py = clamp(bandY + y, 0, height - 1);
      for (let x = 0; x < width; x += 1) {
        const base = (py * width + x) * 4;
        const rIdx = channelOffset(base, width, height, 0, dx, dy);
        const gIdx = channelOffset(base, width, height, 1, Math.floor(dx * 0.5), dy);
        const bIdx = channelOffset(base, width, height, 2, -dx, -dy);

        data[base] = source[rIdx];
        data[base + 1] = source[gIdx];
        data[base + 2] = source[bIdx];
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
        data[idx + 2] = clamp(data[idx + 2] + brightness * 0.12, 0, 255);
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

        data[dstIdx] = Math.floor(data[dstIdx] * 0.8 + source[srcIdx] * 0.2);
        data[dstIdx + 1] = Math.floor(data[dstIdx + 1] * 0.8 + source[srcIdx + 1] * 0.2);
        data[dstIdx + 2] = Math.floor(data[dstIdx + 2] * 0.8 + source[srcIdx + 2] * 0.2);
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
