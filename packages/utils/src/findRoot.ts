import { WorkspaceRootFinder } from './types/WorkspaceRoot';

import workspaceFinder from './package/workspace';
import gitFinder from './package/git';

/**
 * Finds the monorepo root, either via the [[findWithWorkspaces | Workspace Finder]]
 * or the [[findWithGit | Git Finder]]
 * @param cwd
 * @category Workspace Root Finder
 */
export const findRoot: WorkspaceRootFinder['find'] = async (
  cwd = __dirname,
) => {
  const root = await workspaceFinder()
    .catch(() => gitFinder(cwd));
  process.env.TSMONO_ROOT = root;
  return root;
};

if (require.main?.filename === __filename) {
  // eslint-disable-next-line no-console
  findRoot().then((data) => console.log(data));
}
