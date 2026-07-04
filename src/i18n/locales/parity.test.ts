import en from './en';
import zu from './zu';
import af from './af';

/** Recursively collect dot-notation key paths from a nested object. */
function keyPaths(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    keyPaths(v, prefix ? `${prefix}.${k}` : k)
  );
}

const enKeys = keyPaths(en).sort();

describe('locale parity', () => {
  it.each([
    ['zu', zu],
    ['af', af],
  ])('%s has exactly the same keys as en', (_name, locale) => {
    const keys = keyPaths(locale).sort();
    expect(keys).toEqual(enKeys);
  });

  it.each([
    ['en', en],
    ['zu', zu],
    ['af', af],
  ])('%s has no empty strings', (_name, locale) => {
    const empties = keyPaths(locale).filter((path) => {
      const value = path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], locale);
      return typeof value === 'string' && value.trim() === '';
    });
    expect(empties).toEqual([]);
  });
});
