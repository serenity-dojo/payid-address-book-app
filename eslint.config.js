import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import globals from 'globals';

export default [
    {
        ...js.configs.recommended,
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2021
            }
        }
    },

    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module'
            }
        },
        plugins: {
            '@typescript-eslint': tseslint
        },
        rules: {
            ...tseslint.configs.recommended.rules
        }
    },

    {
        files: ['**/*.tsx', '**/*.jsx'],
        plugins: {
            react
        },
        rules: {
            ...react.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off'
        },
        settings: {
            react: {
                version: 'detect'
            }
        }
    }
];
