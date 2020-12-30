import { registerCache } from './cache';

import workspaceFinder from './package/workspace';
import gitFinder from './package/git';

/**
 * Finds the monorepo root, either via the [[findWithWorkspaces | Workspace Finder]]
 * or the [[findWithGit | Git Finder]]
 * @param cwd
 * @category Workspace Root Finder
 */
export const findRoot = async (
  cwd = process.cwd(),
) => workspaceFinder()
  .catch(() => gitFinder(cwd));

/**
 * Cached version of the [[findRoot | Find Root]] function
 * @category Cache
 */
export const root = registerCache(
  'repoRoot',
  findRoot,
);
