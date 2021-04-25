module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageReporters: ['text', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  testRegex: '\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
