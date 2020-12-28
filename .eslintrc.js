const rules = {
  'import/prefer-default-export': 0,
};

module.exports = {
  extends: ['eslint-config-airbnb-base'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules,
  overrides: [
    {
      files: ['*.ts'],
      extends: ['eslint-config-airbnb-typescript'],
    },
    {
      files: ['packages/utils/**/*'],
      rules: {
        ...rules,
        'import/no-dynamic-require': 0,
        'global-require': 0,
      },
    },
  ],
};
