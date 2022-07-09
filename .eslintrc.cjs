module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    extends: ['prettier', 'eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    rules: {
        'prettier/prettier': ['error']
    },
    ignorePatterns: ['**/dist/**', 'jest.config.js', '**/fixtures/handle-import-with-doublequotes']
};
