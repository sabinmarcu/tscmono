import path from 'path';

jest.mock('@tscmono/utils', () => ({
  ...jest.requireActual('../../utils/src/path'),
  makeLogger: () => jest.fn(),
}), { virtual: true });
jest.mock('@tscmono/plugin-repo', () => ({
  getConfig: jest.fn().mockResolvedValue({}),
}), { virtual: true });
jest.mock('@tscmono/plugin-repo/dist/template.json', () => ({}), { virtual: true });

const dependencies = {
  'utils-repo': {
    location: 'workspaces/utils/utils-repo',
    workspaceDependencies: [],
    mismatchedWorkspaceDependencies: [],
  },
  types: {
    location: 'workspaces/libs/types',
    workspaceDependencies: [],
    mismatchedWorkspaceDependencies: [],
  },
  'utils-test': {
    location: 'workspaces/utils/utils-test',
    workspaceDependencies: [],
    mismatchedWorkspaceDependencies: [],
  },
};
const pkg = {
  location: 'workspaces/personal/commitlint-config-workspaces',
  workspaceDependencies: Object.keys(dependencies),
  mismatchedWorkspaceDependencies: [],
};

afterEach(() => {
  jest.dontMock('path');
});

it.each([
  ['POSIX', path.posix, '/repo'],
  ['Windows drive', path.win32, 'C:\\repo'],
  ['Windows UNC', path.win32, '\\\\server\\share\\repo'],
] as const)('preserves dependency directories for custom configs on %s', async (_, pathApi, rootDir) => {
  let packageToTsConfig: typeof import('./graph').packageToTsConfig;
  jest.isolateModules(() => {
    jest.doMock('path', () => pathApi);
    ({ packageToTsConfig } = require('./graph'));
  });

  const configs = await packageToTsConfig!(
    pkg,
    {
      baseConfig: './tsconfig.base.json',
      files: { build: {}, 'build.test': {} },
    },
    rootDir,
    {},
    {},
    dependencies,
  );

  ['', '.build', '.build.test'].forEach((suffix) => {
    const filename = `tsconfig${suffix}.json`;
    const config = configs.find((it) => it.path === pathApi.resolve(rootDir, pkg.location, filename));
    expect(config?.content.references.map(({ path: ref }: { path: string }) => ref.replace(/\\/g, '/')))
      .toEqual([
        `../../utils/utils-repo/${filename}`,
        `../../libs/types/${filename}`,
        `../../utils/utils-test/${filename}`,
      ]);
  });
});
