module.exports = {
  out: 'docs',
  inputFiles: 'packages',
  exclude: '**/*spec.+(ts|tsx)',
  plugin: [
    '@strictsoftware/typedoc-plugin-monorepo',
    'typedoc-plugin-jekyll',
  ],
  'external-modulemap': '.*packages/([^/]+)/.*',
  includeVersion: true,
  name: 'TSCMono',
  tsconfig: './tsconfig.base.json',
  readme: './README.md',
};
