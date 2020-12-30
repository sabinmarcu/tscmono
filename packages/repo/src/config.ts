import { loadConfig, JSONSchema } from '@tscmono/config';
import repoSchema from '@tscmono/config/schemas/repo.json';
import type { RepoConfig } from '@tscmono/config/types/repo';
import { registerCache } from '@tscmono/utils/src/cache';

/**
 * Obtain the monorepo `tscmono` config using cosmiconfig
 * @param rootDir Optional directory from which to obtain the repo config
 */
const getRepoConfig = (
  rootDir: string = process.cwd(),
) => loadConfig<RepoConfig>(
  repoSchema as JSONSchema,
  rootDir,
  'tscmono',
);

/**
 * Cached version of the [[getRepoConfig | Get Repo Config]] function
 */
export const repoConfig = registerCache(
  'repoConfig',
  getRepoConfig,
)
