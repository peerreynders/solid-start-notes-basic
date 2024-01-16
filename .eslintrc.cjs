module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
	],
	rules: {
		quotes: ['error', 'single', { avoidEscape: true }],
		'@typescript-eslint/no-unused-vars': [
			2,
			{ args: 'all', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
		],
	},
};
