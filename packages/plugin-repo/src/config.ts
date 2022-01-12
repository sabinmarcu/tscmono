import { loadConfig, JSONSchema } from '@tscmono/config';
import repoSchema from '@tscmono/config/schemas/root.json';
import type { WorkspaceRootConfig } from '@tscmono/config/schemas-types/root';
import { registerCache } from '@tscmono/utils';

import workspaceSchema from '@tscmono/config/schemas/workspace.json';
import type { WorkspaceConfig } from '@tscmono/config/schemas-types/workspace';

/**
 * Obtain the monorepo `tscmono` config using cosmiconfig
 * @param rootDir Optional directory from which to obtain the repo config
 * @category Config
 */
const getRepoConfig = (
  rootDir: string = process.cwd(),
) => loadConfig<WorkspaceRootConfig>(
  repoSchema as JSONSchema,
  'tscmono',
  rootDir,
);

/**
 * Cached version of the [[getRepoConfig | Get Repo Config]] function
 * @category Cache
 */
export const repoConfig = registerCache(
  'repoConfig',
  getRepoConfig,
);

/**
 * Obtain the monorepo `tscmono` config using cosmiconfig
 * @param rootDir Optional directory from which to obtain the repo config
 * @category Config
 */
export const getConfig = (
  rootDir: string = process.cwd(),
) => loadConfig<WorkspaceConfig>(
  workspaceSchema as JSONSchema,
  'tscmono',
  rootDir,
);
