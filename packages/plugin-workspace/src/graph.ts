import path from 'path';
import {
  makeLogger,
  root,
  workspaces,
  normalizePath,
} from '@tscmono/utils';
import {
  repoConfig, resolveTsConfig,
} from '@tscmono/plugin-repo';
import merge from 'ts-deepmerge';

import { WorkspaceRootConfig, TSConfigCustomConfig } from '@tscmono/config/types/root';
import { WorkspaceConfig } from '@tscmono/utils/src/types/WorkspaceConfig';

// @ts-ignore
import template from './template.json';
import { getConfig } from './config';

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

const getConfigExtras = (
  rootDir: string,
  rootConfig: WorkspaceRootConfig,
  pkgPath: string,
  customName?: string,
) => {
  const tsConfigName = customName
    ? `tsconfig.${customName}.json`
    : 'tsconfig.json';

  const rootExtra = {
    extends: customName
      ? './tsconfig.json'
      : normalizePath(
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
  const conf = await getConfig(pkgPath);
  const { path: tsConfigPath, extra: rootExtra } = getConfigExtras(
    rootDir,
    rootConfig,
    pkgPath,
  );
  const customConfigs: any[] = [];
  const extendedConf = resolveTsConfig(rootConfig, conf as TSConfigCustomConfig);
  const references = pkg.workspaceDependencies
    .map((it) => path.resolve(rootDir, pkgList[it].location))
    .map((location) => ({
      path: path.relative(pkgPath, location),
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
        customConfigs.push({
          path: p,
          content: merge(...[
            extra,
            { extends: tsConfigPath },
            confExtra,
            config,
            { references },
          ].filter(Boolean)),
        });
      },
    );
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
    ...customConfigs,
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
