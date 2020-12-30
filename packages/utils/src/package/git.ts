import { execPromised } from '../execPromised';
import { makeLogger } from '../logger';
import { WorkspaceRootFinder } from '../types/WorkspaceRoot';

/**
 * @ignore
 */
const debug = makeLogger(__filename);

/**
 * Determines the root of a project based on git
 * @param root The root directory to start searching from
 * @category Workspace Root Finder
 */
export const findWithGit: WorkspaceRootFinder['find'] = async (
  root: string = process.cwd(),
) => {
  const cmd = 'git rev-parse --show-toplevel';
  debug('Finding Git Root');
  return (await execPromised(
    cmd,
    { cwd: root },
  )).join('');
};

export default findWithGit;

if (require.main?.filename === __filename) {
  // eslint-disable-next-line no-console
  findWithGit().then((data) => console.log(data));
}
