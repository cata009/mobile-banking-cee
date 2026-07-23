import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'package/**',
      'screenshots/**',
      'src/imports/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: [
      'api/**/*.js',
      'scripts/**/*.{js,mjs,cjs}',
      'tests/**/*.{js,mjs,cjs}',
      '*.config.js',
    ],
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
    files: [
      'api/**/*.js',
      'scripts/**/*.{js,mjs,cjs}',
    ],
    rules: {
      'no-console': 'off',
    },
  },
)
