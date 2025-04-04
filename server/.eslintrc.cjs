module.exports = {
    env: {
        node: true,
        es2021: true,
    },
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        'import/no-case-sensitive': 'off',
        'import/case-sensitivity': 'off',
        'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
    },
}
