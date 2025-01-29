export default {
    preset: "ts-jest",
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: {
                    // Ensure ts-jest uses the same module settings
                    module: 'ESNext'
                }
            }
        ]
    },
    extensionsToTreatAsEsm: ['.ts'] // Tell Jest to treat .ts files as ESM
};
