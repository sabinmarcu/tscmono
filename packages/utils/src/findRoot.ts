import { WorkspaceRootFinder } from './types/WorkspaceRoot';

import { find as workspaceFinder } from './package/workspace';
import { find as gitFinder } from './package/git';

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
