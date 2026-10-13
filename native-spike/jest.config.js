module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$': '<rootDir>/src/platform/async-storage-test-fixture.cjs',
    '\\.svg$': '<rootDir>/src/universal/svg-test-fixture.cjs',
    '^@/(.*)$': '<rootDir>/../src/$1',
  },
};
