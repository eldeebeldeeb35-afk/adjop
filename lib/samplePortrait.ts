// Turns a background-removed portrait into N star positions.
//
// Density follows brightness and edges: lit skin and the outlines of eyes,
// nose, mouth, beard and hair get many stars; shadows stay sparse so the dark
// beard and hair read as shape rather than disappearing. Luminance is
// histogram-equalised per photo so the warm lantern shot and the blue selfie
// end up with comparable star density.

export type PortraitSample = {
  positions: Float32Array; // x, y, z per star, in "portrait units" (height = 1)
  brightness: Float32Array; // 0..1 per star
};

const SAMPLE_W = 288;
const SAMPLE_H = 360; // 4:5, same as the prepared webp files

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  await img.decode();
  return img;
}

export function samplePortrait(img: HTMLImageElement, count: number, seed: number): PortraitSample {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_W;
  canvas.height = SAMPLE_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, SAMPLE_W, SAMPLE_H);
  const { data } = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);

  const n = SAMPLE_W * SAMPLE_H;
  const lum = new Float32Array(n);
  const alpha = new Float32Array(n);
  const hist = new Float32Array(256);
  for (let i = 0; i < n; i++) {
    // fade the body out below the chin so the stars gather on the face
    const fy = Math.floor(i / SAMPLE_W) / SAMPLE_H;
    const bodyFade = 1 - 0.8 * Math.min(1, Math.max(0, (fy - 0.68) / 0.3));
    const a = (data[i * 4 + 3] / 255) * bodyFade;
    const l = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
    alpha[i] = a;
    lum[i] = l;
    if (a > 0.5) hist[Math.min(255, Math.floor(l * 255))] += 1;
  }
  // histogram equalisation over the subject only
  let acc = 0;
  const total = hist.reduce((s, v) => s + v, 0) || 1;
  const cdf = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    acc += hist[i];
    cdf[i] = acc / total;
  }
  for (let i = 0; i < n; i++) lum[i] = cdf[Math.min(255, Math.floor(lum[i] * 255))];

  // local contrast: add back the difference from a blurred copy so eyes, brows,
  // nostrils, lips and beard texture stand out instead of averaging into a blob
  const blurred = boxBlur(boxBlur(lum, SAMPLE_W, SAMPLE_H, 5), SAMPLE_W, SAMPLE_H, 5);
  for (let i = 0; i < n; i++) {
    lum[i] = Math.min(1, Math.max(0, lum[i] * 0.85 + (lum[i] - blurred[i]) * 2.2 + 0.05));
  }

  // Sobel edges on the equalised luminance
  const edge = new Float32Array(n);
  let maxEdge = 1e-6;
  for (let y = 1; y < SAMPLE_H - 1; y++) {
    for (let x = 1; x < SAMPLE_W - 1; x++) {
      const i = y * SAMPLE_W + x;
      const tl = lum[i - SAMPLE_W - 1], t = lum[i - SAMPLE_W], tr = lum[i - SAMPLE_W + 1];
      const l = lum[i - 1], r = lum[i + 1];
      const bl = lum[i + SAMPLE_W - 1], b = lum[i + SAMPLE_W], br = lum[i + SAMPLE_W + 1];
      const gx = tr + 2 * r + br - tl - 2 * l - bl;
      const gy = bl + 2 * b + br - tl - 2 * t - tr;
      const e = Math.sqrt(gx * gx + gy * gy) * alpha[i];
      edge[i] = e;
      if (e > maxEdge) maxEdge = e;
    }
  }

  // importance weights -> cumulative distribution
  const weights = new Float64Array(n);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const a = alpha[i];
    if (a >= 0.08) {
      // contours become dense bright lines, flat areas keep a sparse dusting
      const en = edge[i] / maxEdge;
      const e = Math.min(1, Math.max(0, (en - 0.1) / 0.4));
      sum += a * (0.03 + Math.pow(lum[i], 2.4) * 0.8 + e * e * 1.8);
    }
    weights[i] = sum; // must stay monotonic for the binary search
  }

  const rand = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const brightness = new Float32Array(count);
  const aspect = SAMPLE_W / SAMPLE_H;
  for (let k = 0; k < count; k++) {
    // binary search in the CDF
    const target = rand() * sum;
    let lo = 0, hi = n - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (weights[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    const x = (lo % SAMPLE_W) + rand();
    const y = Math.floor(lo / SAMPLE_W) + rand();
    positions[k * 3] = (x / SAMPLE_W - 0.5) * aspect;
    positions[k * 3 + 1] = 0.5 - y / SAMPLE_H;
    // a little depth: brighter (nearer, lit) areas sit slightly forward
    positions[k * 3 + 2] = (lum[lo] - 0.5) * 0.06 + (rand() - 0.5) * 0.02;
    brightness[k] = Math.min(1, 0.15 + Math.pow(lum[lo], 1.4) * 0.7 + (edge[lo] / maxEdge) * 0.6);
  }
  return { positions, brightness };
}

function boxBlur(src: Float32Array, w: number, h: number, r: number) {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const span = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += src[y * w + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc / span;
      acc += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / span;
      acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
  return out;
}

// Hilbert-curve index on a 2^order grid: neighbouring indices are neighbouring
// points, so pairing the i-th star of each portrait in Hilbert order moves each
// star a short distance and regions map onto regions (hair to hair, face to face).
function hilbert(x: number, y: number, order: number) {
  let d = 0;
  for (let s = 1 << (order - 1); s > 0; s >>= 1) {
    const rx = (x & s) > 0 ? 1 : 0;
    const ry = (y & s) > 0 ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    if (ry === 0) {
      if (rx === 1) {
        x = s - 1 - x;
        y = s - 1 - y;
      }
      [x, y] = [y, x];
    }
  }
  return d;
}

export function sortSpatially(sample: PortraitSample): PortraitSample {
  const count = sample.brightness.length;
  const order = 10;
  const side = 1 << order;
  const keys = new Float64Array(count);
  const idx = new Uint32Array(count);
  for (let i = 0; i < count; i++) {
    const x = Math.min(side - 1, Math.max(0, Math.floor((sample.positions[i * 3] + 0.5) * side)));
    const y = Math.min(side - 1, Math.max(0, Math.floor((0.5 - sample.positions[i * 3 + 1]) * side)));
    keys[i] = hilbert(x, y, order);
    idx[i] = i;
  }
  idx.sort((a, b) => keys[a] - keys[b]);
  const positions = new Float32Array(count * 3);
  const brightness = new Float32Array(count);
  for (let k = 0; k < count; k++) {
    const i = idx[k];
    positions.set(sample.positions.subarray(i * 3, i * 3 + 3), k * 3);
    brightness[k] = sample.brightness[i];
  }
  return { positions, brightness };
}
