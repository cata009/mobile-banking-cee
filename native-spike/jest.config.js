module.exports = {
  preset: '@react-native/jest-preset',
  // A relative segment avoids Windows regex normalization of dotted checkout paths.
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/fixtures/'],
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/src/platform/async-storage-test-fixture.cjs',
    '\\.svg$': '<rootDir>/src/universal/svg-test-fixture.cjs',
    '\\.css$': '<rootDir>/src/universal/style-test-fixture.cjs',
    '^@/(.*)$': '<rootDir>/../src/$1',
  },
};
