module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    "ignorePatterns": ["**/*.d.ts"],
    overrides: [
        {
            files: ['src/**/*.ts'],
            parserOptions: {
                project: ['./tsconfig.esm.json', './tsconfig.cjs.json']
            }
        },
        {
            files: ['test/**/*.ts'],
            parserOptions: {
                project: ['./tsconfig.test.json']
            }
        },
        {
            files: ['examples/**/*.ts'],
            parserOptions: {
                project: ['./tsconfig.examples.json']
            }
        }
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "project": "./tsconfig.json"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
    }
}
