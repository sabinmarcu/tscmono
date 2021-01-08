import {
  findRoot,
  getPackageJson,
  makeLogger,
  registerCache,
  root,
} from '@tscmono/utils';

/**
 * @ignore
 */
const baseDebug = makeLogger(__filename);

/**
 * Resolve installed plugins from a given path, and any 
 * installed presets
 * @param pwd Path to be used when resolving plugins
 * @param from Name to be used for logging purposes 
 * (defaults to 'root' and should be used as package name of preset)
 * @category Plugins
 */
export const getPlugins = async (
  pwd: string = process.cwd(),
  from: string = 'root',
) => {
  const debug = baseDebug.extend(from);
  const pkg = getPackageJson(pwd);
  debug('Loaded package.json');

  const deps = [
    'dependencies',
    'devDependencies',
  ]
    .map((it) => pkg[it] || {})
    .map((it) => Object.keys(it))
    .flat()
    .sort()
    .filter((it, idx, arr) => arr.indexOf(it) === idx);

  debug('Extracted deps (%d)', deps.length);

  let allPlugins = new Map<string, any>();

  const presets = deps
    .filter((it) => /@?tscmono[/-]preset-/g.test(it));

  debug('Extracted presets', presets);

  await Promise.all(
    presets.map(async (preset) => {
      const presetPath = require.resolve(preset, { paths: [pwd] });
      debug('Loading preset %s from %s', preset, presetPath);
      const presetPlugins = await getPlugins(presetPath, preset);
      debug('Loading %d plugins of preset %s', presetPlugins.size, preset);
      allPlugins = new Map([...allPlugins, ...presetPlugins]);
    }),
  );

  debug('Loaded presets (%d)', allPlugins.size, Array.from(allPlugins.keys()));

  const plugins = deps
    .filter((it) => /@?tscmono[/-]plugin-/g.test(it));

  debug('Extracted plugins', plugins);

  plugins.forEach((it) => allPlugins.set(
    it,
    require(
      require.resolve(it, { paths: [pwd] }),
    ),
  ));

  debug('Loaded plugins (%d)', allPlugins.size, Array.from(allPlugins.keys()));

  return allPlugins;
};

/**
 * Obtain plugins from installed plugins and presets of 
 * project root
 * @param rootDir Root directory to treat as project root
 * @category Plugins
 */
export const getPluginsFromRoot = async (
  rootDir: string = process.cwd(),
) => {
  const pwd = rootDir
    ? await findRoot(rootDir)
    : await root.value;
  return Array.from(
    (await getPlugins(pwd))
      .values(),
  );
};

/**
 * Cached variant of the [[getPluginsFromRoot]] function
 * @category Plugins
 */
export const plugins = registerCache(
  'plugins',
  getPluginsFromRoot,
);
