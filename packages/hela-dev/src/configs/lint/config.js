module.exports = {
  projects: [
    {
      displayName: 'lint',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/packages/*/src/**/*'],
      testPathIgnorePatterns: ['.+/dist/.+'],
      runner: 'jest-runner-eslint',
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
      rootDir: '/home/charlike/dev/hela',
    },
  ],
};
