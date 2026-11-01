import test from 'node:test';
import assert from 'node:assert/strict';
import { readVisual } from '../src/frontmatter.js';

test('reads stand, status and lang under visual:', () => {
  assert.deepEqual(readVisual('---\nid: x\nvisual:\n  status: Approved\n  stand: 2026-11-01\n  lang: en\n---\n# T\n'), {
    visual: { status: 'Approved', stand: '2026-11-01', lang: 'en' }, endLine: 6,
  });
});
test('returns null visual without visual key', () => {
  assert.deepEqual(readVisual('---\nid: x\n---\n'), { visual: null, endLine: 2 });
});
test('returns endLine -1 without frontmatter', () => {
  assert.deepEqual(readVisual('# T\n'), { visual: null, endLine: -1 });
});
test('strips quotes from values', () => {
  assert.equal(readVisual('---\nvisual:\n  stand: "2026-11-01"\n---').visual.stand, '2026-11-01');
});
