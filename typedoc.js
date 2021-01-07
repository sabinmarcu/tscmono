module.exports = {
  out: 'docs',
  inputFiles: 'packages/**/*.ts',
  exclude: [
    '**/*spec.+(ts|tsx)',
    '**/*.d.ts',
    '**/*.json',
    'packages/website/**/*',
  ],
  plugin: [
    '@strictsoftware/typedoc-plugin-monorepo',
    'typedoc-plugin-jekyll',
  ],
  'external-modulemap': '.*packages/([^/]+)/.*',
  includeVersion: true,
  name: 'TSCMono',
  tsconfig: './tsconfig.typedoc.json',
  readme: './README.md',
};
