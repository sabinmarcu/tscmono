import path from 'path';
import {
  makeLogger,
  root,
  workspaces,
  normalizePath,
  makeTsConfigFileName,
} from '@tscmono/utils';
import {
  repoConfig,
  getConfig,
} from '@tscmono/plugin-repo';
import merge from 'ts-deepmerge';

import { WorkspaceRootConfig, TSConfigCustomConfig } from '@tscmono/config/schemas-types/root';
import { WorkspaceConfig as WSConfig } from '@tscmono/config/schemas-types/workspace';
import { WorkspaceConfig } from '@tscmono/utils/src/types/WorkspaceConfig';

// @ts-ignore
import template from './template.json';

/**
 * @ignore
 */
const debug = makeLogger(__filename);

/**
 * Describe what should be written to the filesystem for a tsconfig
 */
type TSConfigTemplate = {
  /**
   * The path of the file to be writte
   */
  path: string,
  /**
   * The content to be written
   */
  content: any & { references: {path: string}[] },
};

export const resolvePreset = (
  rootConfig: WorkspaceRootConfig,
  preset: string,
): any => {
  if (!rootConfig.presets) {
    throw new Error('No presets defined in root config!');
  }
  if (!(preset in rootConfig.presets)) {
    throw new Error(`Preset ${preset} not found in root config!`);
  }
  return rootConfig.presets[preset];
};

export const resolveTsConfig = (
  rootConfig: WorkspaceRootConfig,
  config: TSConfigCustomConfig,
): any => {
  const toMerge = [];
  if (config.overrides) {
    toMerge.push(config.overrides);
  }
  if (config.preset) {
    toMerge.push(resolvePreset(rootConfig, config.preset as string));
  }
  if (config.presets) {
    (config.presets as string[]).forEach(
      (preset: string) => toMerge.push(resolvePreset(rootConfig, preset)),
    );
  }
  if (config.extends) {
    toMerge.push({ extends: config.extends });
  }
  return merge(...toMerge);
};

const getConfigExtras = (
  rootDir: string,
  rootConfig: WorkspaceRootConfig,
  pkgPath: string,
  customName?: string,
) => {
  const tsConfigName = makeTsConfigFileName(customName);

  const rootExtra = {
    extends: normalizePath(
      rootDir,
      rootConfig.baseConfig,
      pkgPath,
    ),
  };
  const tsConfigPath = path.resolve(
    pkgPath,
    tsConfigName,
  );
  return {
    extra: rootExtra,
    path: tsConfigPath,
  };
};

/**
 * Generate a [[TSConfigTemplate]] for a specific
 * workspace, given the root configuration, base
 * template, the root directory and the workspaces list
 * @param pkg The package (workspace) name
 * @param rootConfig The root configuration
 * @param rootDir The root directory
 * @param tpl The base template
 * @param pkgList The packages (workspaces) list
 * @category TSConfig Generation
 */
export const packageToTsConfig = async (
  pkg: WorkspaceConfig,
  rootConfig: WorkspaceRootConfig,
  rootDir: string,
  tpl: any,
  pkgList: Record<string, WorkspaceConfig>,
): Promise<TSConfigTemplate[]> => {
  const pkgPath = path.resolve(
    rootDir,
    pkg.location,
  );
  let conf: WSConfig;
  try {
    conf = await getConfig(pkgPath);
  } catch (e) {
    if (rootConfig.mode !== 'loose') {
      throw e;
    }
    return [];
  }

  const { path: tsConfigPath, extra: rootExtra } = getConfigExtras(
    rootDir,
    rootConfig,
    pkgPath,
  );
  const customConfigs: any[] = [];
  const extendedConf = resolveTsConfig(rootConfig, conf! as TSConfigCustomConfig);
  const references = pkg.workspaceDependencies
    .map((it) => path.resolve(rootDir, pkgList[it].location))
    .map((location) => ({
      path: path.relative(
        pkgPath,
        path.resolve(location, 'tsconfig.json'),
      ),
    }));
  if (rootConfig.files) {
    Object.entries(rootConfig.files).forEach(
      ([file, c]) => {
        const config = resolveTsConfig(rootConfig, c);
        let extra;
        const extraConfig = (conf.files as any)?.[file];
        if (extraConfig) {
          extra = resolveTsConfig(rootConfig, extraConfig);
        }
        const { path: p, extra: confExtra } = getConfigExtras(
          rootDir,
          rootConfig,
          pkgPath,
          file,
        );
        const localReferences = references.map(({ path: rp }) => {
          const rpa = rp.split('/');
          const fn = p.split('/').slice(-1)[0];
          rpa.splice(-1, 1, fn);
          return {
            path: rpa.join('/'),
          };
        });
        customConfigs.push({
          path: p,
          content: merge(...[
            rootExtra,
            tpl,
            extendedConf,
            extra,
            { extends: tsConfigPath },
            confExtra,
            config,
            { references: localReferences },
          ].filter(Boolean)),
        });
      },
    );
  }
  if (customConfigs.length) {
    return customConfigs;
  }
  return [
    {
      path: tsConfigPath,
      content: merge(...[
        rootExtra,
        tpl,
        extendedConf,
        { references },
      ].filter(Boolean)),
    },
  ];
};

/**
 * Generate [[TSConfigTemplate]]s for all workspaces
 * @param rootDir The root directory to be used when generating tsConfigs
 * @category TSConfig Generation
 */
export const generateTsConfigs = async (
  rootDir: string = process.cwd(),
): Promise<TSConfigTemplate[]> => {
  debug('Starting tsconfigs generation');
  const workspaceRoot = rootDir
    ? await root.refresh(rootDir)
    : await root.value;
  const packages = rootDir
    ? await workspaces.refresh(rootDir)
    : await workspaces.value;
  const rootConfig: WorkspaceRootConfig = rootDir
    ? await repoConfig.refresh(rootDir)
    : await repoConfig.value;
  const result = await Promise.all(
    Object.values(packages).map(
      (pkg) => packageToTsConfig(
        pkg,
        rootConfig,
        workspaceRoot,
        template,
        packages,
      ),
    ),
  );
  return result.flat(Infinity) as TSConfigTemplate[];
};
