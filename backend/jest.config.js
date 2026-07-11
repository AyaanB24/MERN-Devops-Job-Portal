module.exports = {
  // The test environment that will be used for testing.
  // We use 'node' because this is a backend API, meaning it doesn't need a browser (DOM) environment.
  testEnvironment: 'node',

  // A list of paths to directories that Jest should use to search for test files.
  // This focuses Jest on our dedicated 'tests' folder.
  roots: ['<rootDir>/tests'],

  // The glob patterns Jest uses to automatically discover test files.
  // It looks for any file ending in .test.js or .spec.js, or any file inside a __tests__ folder.
  testMatch: [
    '**/?(*.)+(spec|test).js'
  ],

  // Indicates whether coverage information should be collected while executing the tests.
  collectCoverage: true,

  // The directory where Jest should output its generated HTML and text coverage reports.
  coverageDirectory: 'coverage',

  // Instructs Jest on which files to calculate coverage for.
  // We want to track coverage for all source code inside 'src', but we exclude files
  // like server.js (which just starts the server) or config files to keep metrics accurate.
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**'
  ],

  // Indicates whether each individual test result should be reported in the terminal (makes logs cleaner).
  verbose: true,
};
