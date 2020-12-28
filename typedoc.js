module.exports = {
  out: 'docs',
  inputFiles: 'packages',
  plugin: [
    '@strictsoftware/typedoc-plugin-monorepo',
    'typedoc-plugin-jekyll',
  ],
  'external-modulemap': '.*packages/([^/]+)/.*',
  categorizeByGroup: true,
  includeVersion: true,
  name: 'tscmono',
};
