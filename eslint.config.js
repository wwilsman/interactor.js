import { fileURLToPath } from 'node:url';
import { defineConfig, globalIgnores } from 'eslint/config';
import { includeIgnoreFile } from '@eslint/compat';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import js from '@eslint/js';

export default defineConfig([
  js.configs.recommended,
  includeIgnoreFile(fileURLToPath(
    new URL('.gitignore', import.meta.url)
  )),
  globalIgnores([
    'nyc.config.cjs'
  ]),
  {
    languageOptions: {
      globals: {
        ...globals.browser
      }
    },
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      'curly': 'off',
      'no-extra-parens': 'off',
      'no-return-assign': 'off',
      'no-sequences': 'off',
      'no-sparse-arrays': 'off',
      'no-void': 'off',
      'one-var': 'off',
      'prefer-const': 'off',
      'require-yield': 'off',
      '@stylistic/comma-dangle': ['error', 'never'],
      '@stylistic/generator-star-spacing': ['error', {
        before: false,
        after: true,
        anonymous: 'neither',
        method: 'before'
      }],
      '@stylistic/multiline-ternary': 'off',
      '@stylistic/quotes': ['error', 'single', {
        avoidEscape: true,
        allowTemplateLiterals: 'avoidEscape'
      }],
      '@stylistic/quote-props': ['error', 'consistent-as-needed'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'never',
        asyncArrow: 'always',
        named: 'never'
      }],
      '@stylistic/yield-star-spacing': ['error', 'after']
    }
  }
]);
