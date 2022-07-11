const rules = {
    'prettier/prettier': ['error'],
    '@typescript-eslint/ban-ts-comment': 'error',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
            assertionStyle: 'never'
        }
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/dot-notation': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
            accessibility: 'explicit',
            overrides: {
                constructors: 'no-public'
            }
        }
    ],
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/member-ordering': [
        'error',
        {
            default: [
                'static-field',
                'instance-field',
                'public-static-method',
                'public-instance-method',
                'private-static-method',
                'private-instance-method'
            ]
        }
    ],
    '@typescript-eslint/naming-convention': [
        'error',
        {
            selector: 'class',
            format: ['PascalCase']
        }
    ],
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-shadow': [
        'error',
        {
            builtinGlobals: false,
            hoist: 'functions',
            allow: ['resolve', 'reject', 'done', 'cb']
        }
    ],
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/no-unused-vars': [
        'error',
        {
            vars: 'all',
            args: 'all',
            argsIgnorePattern: '^_|^args',
            varsIgnorePattern: '^.*Mock'
        }
    ],
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/quotes': 'off',
    '@typescript-eslint/semi': 'off',
    '@typescript-eslint/sort-type-union-intersection-members': 'error',
    '@typescript-eslint/type-annotation-spacing': 'off',
    '@typescript-eslint/typedef': [
        'error',
        {
            arrayDestructuring: false,
            arrowParameter: false,
            memberVariableDeclaration: true,
            objectDestructuring: false,
            parameter: true,
            propertyDeclaration: true,
            variableDeclaration: false,
            variableDeclarationIgnoreFunction: true
        }
    ],
    '@typescript-eslint/unified-signatures': 'error',
    'arrow-body-style': 'off',
    'arrow-parens': 'off',
    'brace-style': 'off',
    'constructor-super': 'error',
    curly: 'error',
    'eol-last': 'error',
    eqeqeq: ['error', 'always'],
    'guard-for-in': 'error',
    'id-blacklist': 'off',
    'id-match': 'off',
    'jsdoc/newline-after-description': 'off',
    'jsdoc/no-types': 'off',
    'linebreak-style': 'off',
    'max-len': 'off',
    'new-parens': 'off',
    'newline-per-chained-call': 'off',
    'no-bitwise': 'error',
    'no-caller': 'error',
    'no-case-declarations': 'off',
    'no-cond-assign': 'error',
    'no-console': ['error', {}],
    'no-constructor-return': 'error',
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'no-empty-pattern': 'off',
    'no-eval': 'error',
    'no-extra-semi': 'off',
    'no-fallthrough': 'error',
    'no-irregular-whitespace': 'off',
    'no-labels': 'error',
    'no-multi-spaces': 'error',
    'no-negated-condition': 'off',
    'no-prototype-builtins': 'off',
    'no-restricted-globals': [
        'error',
        {
            name: 'fdescribe',
            message: 'Do not commit fdescribe. Use describe instead.'
        },
        {
            name: 'xdescribe',
            message: 'Do not commit xdescribe. Use describe instead.'
        },
        {
            name: 'fit',
            message: 'Do not commit fit.'
        },
        {
            name: 'xit',
            message: 'Do not commit fit.'
        }
    ],
    'no-return-await': 'error',
    'no-sparse-arrays': 'error',
    'no-template-curly-in-string': 'error',
    'no-throw-literal': 'error',
    'no-trailing-spaces': 'error',
    'no-undef-init': 'error',
    'no-underscore-dangle': 'off',
    'no-unsafe-finally': 'off',
    'no-useless-catch': 'off',
    'no-useless-escape': 'off',
    'no-var': 'error',
    'object-shorthand': 'off',
    'one-var-declaration-per-line': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-arrow/prefer-arrow-functions': 'off',
    'prefer-const': 'error',
    'prefer-template': 'error',
    'quote-props': 'off',
    radix: 'error',
    'sort-imports': 'off',
    'sort-keys': 'off',
    'space-before-function-paren': 'off',
    'space-in-parens': 'off',
    'spaced-comment': [
        'error',
        'always',
        {
            exceptions: ['**']
        }
    ]
};

module.exports = {
    root: true,
    ignorePatterns: ['**/dist/**', 'jest.config.js', '**/fixtures/**'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    extends: ['prettier'],
    env: {
        jest: true,
        node: true
    },
    parserOptions: {
        project: ['tsconfig.eslint.json'],
        createDefaultProgram: false
    },
    overrides: [
        {
            files: [`**/*.ts`],
            rules
        }
    ]
};
