module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^@components/(.*)$": "<rootDir>/src/shared/components/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@assets/(.*)$": "<rootDir>/src/assets/$1",
    "^@features/(.*)$": "<rootDir>/src/features/$1",
    "^@/features/(.*)$": "<rootDir>/src/features/$1",
    "^@/shared/config$": "<rootDir>/src/shared/config-test.js",
    "^@/shared/utils/(.*)$": "<rootDir>/src/shared/utils/$1",
    "^@utils/(.*)$": "<rootDir>/src/shared/utils/$1",
    "^@hooks/(.*)$": "<rootDir>/src/shared/hooks/$1",
    "^@context/(.*)$": "<rootDir>/src/shared/context/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js", "@testing-library/jest-dom"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
};
