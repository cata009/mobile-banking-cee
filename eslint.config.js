import js from '@eslint/js'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

const jsxA11yWarnings = Object.fromEntries(
  Object.keys(jsxA11y.flatConfigs.recommended.rules).map((ruleName) => [ruleName, 'warn']),
)

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'package/**', 'screenshots/**', 'src/imports/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['src/**/*.tsx'],
    languageOptions: jsxA11y.flatConfigs.recommended.languageOptions,
    plugins: jsxA11y.flatConfigs.recommended.plugins,
    // Existing prototypes have accessibility debt. Surface it now without
    // blocking unrelated work; touched components can ratchet warnings down.
    rules: jsxA11yWarnings,
  },
  {
    files: ['api/**/*.js', 'scripts/**/*.{js,mjs,cjs}', 'tests/**/*.{js,mjs,cjs}', '*.config.js'],
    languageOptions: {
      globals: {
        Buffer: 'readonly',
        TextDecoder: 'readonly',
        TextEncoder: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-debugger': 'error',
      'no-constant-binary-expression': 'error',
      // Keep debug logs out of the shipped demo; error/warn stay for real diagnostics.
      'no-console': ['error', { allow: ['error', 'warn'] }],
    },
  },
  {
    // Node-side dev scripts and API handlers legitimately log progress/results.
    files: ['api/**/*.js', 'scripts/**/*.{js,mjs,cjs}'],
    rules: {
      'no-console': 'off',
    },
  },
)
