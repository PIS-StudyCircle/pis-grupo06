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
    "^@/shared/config$": "<rootDir>/src/shared/config-test.js",
    "^@/shared/utils/(.*)$": "<rootDir>/src/shared/utils/$1",
    "^@utils/(.*)$": "<rootDir>/src/shared/utils/$1",
    "^@hooks/(.*)$": "<rootDir>/src/shared/hooks/$1",
    "^@context/(.*)$": "<rootDir>/src/shared/context/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js", "@testing-library/jest-dom"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/main.jsx",                        // entrypoint
    "!src/app/App.jsx",                     // root app wrapper
    "!src/app/routes/**/*",                 // definición de rutas
    "!src/shared/config*.js",               // configs (test/prod)
    "!src/features/**/index.jsx",           // archivos índice
    "!src/shared/context/**/*",             // contextos mínimos
    "!src/shared/components/layout/**/*",   // layout puro (NavBar, SideBar, etc.)
    "!src/shared/components/Footer.jsx",
    "!src/shared/components/SubmitButton.jsx",
    "!src/shared/components/Textarea.jsx",
    "!src/shared/utils/**/*",               // utils simples/wrappers
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/services",
  ],
};
