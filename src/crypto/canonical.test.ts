import { stableStringify, bytesToUtf8, utf8ToBytes, sha256Hex } from './canonical';

describe('stableStringify', () => {
  it('is order-independent for object keys', () => {
    expect(stableStringify({ b: 1, a: 2 })).toBe(stableStringify({ a: 2, b: 1 }));
  });

  it('preserves array order', () => {
    expect(stableStringify([3, 1, 2])).toBe('[3,1,2]');
  });

  it('is deterministic for nested structures', () => {
    const a = { z: [{ y: 1, x: 2 }], a: 'k' };
    const b = { a: 'k', z: [{ x: 2, y: 1 }] };
    expect(sha256Hex(a)).toBe(sha256Hex(b));
  });

  it('distinguishes different values', () => {
    expect(sha256Hex({ a: 1 })).not.toBe(sha256Hex({ a: 2 }));
  });
});

describe('bytesToUtf8', () => {
  it.each([
    'ASCII only',
    'Afrikaans: ’n geldige geloofsbrief',
    'isiZulu: Ubufakazi Bekheli, idolobha',
    'Emoji: 🇿🇦 ✅',
    'Mixed: café — Soweto — R100',
  ])('round-trips %s', (s) => {
    expect(bytesToUtf8(utf8ToBytes(s))).toBe(s);
  });
});
