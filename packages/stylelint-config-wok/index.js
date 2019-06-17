module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-scss'],
  rules: {
    indentation: [2, { ignore: 'inside-parens' }],
    'at-rule-no-unknown': null,
    'max-empty-lines': 3,
    'value-list-comma-newline-after': null,
    'rule-empty-line-before': [
      'always',
      {
        ignore: ['after-comment', 'inside-block'],
      },
    ],
    'at-rule-empty-line-before': [
      'always',
      {
        ignore: [
          'after-comment',
          'inside-block',
          'blockless-after-same-name-blockless',
        ],
        ignoreAtRules: ['else', 'content', 'return', 'warn'],
      },
    ],
    'block-closing-brace-newline-after': [
      'always',
      {
        ignoreAtRules: ['if', 'else', 'content', 'return', 'warn'],
      },
    ],
    'declaration-colon-newline-after': null,
    'function-comma-newline-after': null,
    'no-missing-end-of-source-newline': null,
    'declaration-empty-line-before': 'never',

    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['export', 'import', 'global', 'local'],
      },
    ],

    'property-no-unknown': [
      true,
      {
        ignoreProperties: ['composes', 'compose-with'],
      },
    ],

    'scss/at-rule-no-unknown': true,
  },
};
