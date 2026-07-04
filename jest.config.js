/**
 * Unit tests for the app's logic — the credential engine, canonicalisation,
 * i18n parity, and the scan/verify entrypoint — run in a fast Node environment.
 *
 * @noble/* ship ESM only, so they are transformed by babel-jest rather than
 * ignored. UI/screen behaviour is validated by running the app (see README);
 * the correctness-critical code is pure and covered here.
 */
module.exports = {
  displayName: 'logic',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  transformIgnorePatterns: ['node_modules/(?!(@noble)/)'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.d.ts'],
  passWithNoTests: true,
};
