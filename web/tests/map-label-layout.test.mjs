import test from 'node:test';
import assert from 'node:assert/strict';
import { mapLabelLayout } from '../lib/map-label-layout.ts';
test('dense nearby pins remain separate and map positions outside the viewport are not pulled inside', () => {
  const rects = Array.from({ length: 6 }, (_, i) => ({
    x: 120 + i,
    y: 130 + i,
    width: 46,
    height: 44,
  }));
  rects.push({ x: -1000, y: 10, width: 46, height: 44 });
  const before = structuredClone(rects);
  const offsets = mapLabelLayout(rects, {
    x: 0,
    y: 0,
    width: 300,
    height: 300,
  });
  const placed = rects
    .slice(0, 6)
    .map((r, i) => ({ ...r, x: r.x + offsets[i].x, y: r.y + offsets[i].y }));
  for (let i = 0; i < placed.length; i++)
    for (let j = i + 1; j < placed.length; j++) {
      const a = placed[i],
        b = placed[j];
      assert(
        a.x + a.width + 6 <= b.x ||
          b.x + b.width + 6 <= a.x ||
          a.y + a.height + 6 <= b.y ||
          b.y + b.height + 6 <= a.y,
      );
    }
  assert.deepEqual(offsets.at(-1), { x: 0, y: 0 });
  assert.deepEqual(rects, before);
});

test('native DOMRect accessors are retained when arranging labels', () => {
  const prototype = {
    get x() {
      return 100;
    },
    get y() {
      return 100;
    },
    get width() {
      return 44;
    },
    get height() {
      return 44;
    },
  };
  const rects = [Object.create(prototype), Object.create(prototype)];
  const offsets = mapLabelLayout(rects, {
    x: 0,
    y: 0,
    width: 300,
    height: 300,
  });
  assert(offsets[1].x !== 0 || offsets[1].y !== 0);
});
