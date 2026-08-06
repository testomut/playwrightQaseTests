const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const playwright = require('eslint-plugin-playwright');
const prettier = require('eslint-config-prettier');

module.exports = tseslint.config(
    {
        ignores: [
            'node_modules/**',
            'playwright-report/**',
            'test-results/**',
            'variables/**',
            'cache/**',
            'downloads/**',
        ],
    },
    {
        files: ['eslint.config.js'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: { require: 'readonly', module: 'writable' },
        },
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['e2e/**/*.ts'],
        ...playwright.configs['flat/recommended'],
    },
    prettier,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-empty-pattern': 'off',
            // Every test title carries its Qase tag (@QATEST-<id> ...), which this
            // rule isn't configured to recognize as valid.
            'playwright/valid-title': 'off',
            'playwright/expect-expect': 'off',
            'playwright/no-conditional-in-test': 'off',
            'playwright/no-conditional-expect': 'off',
            'playwright/no-wait-for-timeout': 'off',
            'playwright/no-networkidle': 'off',
        },
    },
);
