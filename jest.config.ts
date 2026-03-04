import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest/presets/default-esm", // Use the ESM preset
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        // This handles the .js extension requirement in TS ESM
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    transform: {
        // Use ts-jest with ESM support
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
    roots: ["<rootDir>/tests"],
    testMatch: ["**/*.test.ts"],
};

export default config;
