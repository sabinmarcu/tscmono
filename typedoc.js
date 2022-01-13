module.exports = {
  out: 'docs',
  entryPointStrategy: 'packages',
  entryPoints: ['.'],
  exclude: [
    '**/*spec.+(ts|tsx)',
    '**/*.d.ts',
    '**/*.json',
    'packages/website/**/*',
    'packages/preset-default/**/*',
  ],
  emit: 'both',
  includeVersion: true,
  name: 'TSCMono',
  tsconfig: './tsconfig.typedoc.json',
  readme: './README.md',
};
