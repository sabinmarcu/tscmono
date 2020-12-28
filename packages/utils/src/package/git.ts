import { execPromised } from '../execPromised';
import { WorkspaceRootFinder } from '../types/WorkspaceRoot';

export const find: WorkspaceRootFinder['find'] = async (
  root: string = __dirname,
) => (await execPromised(
  'git rev-parse --show-toplevel',
  { cwd: root },
)).join('');

if (require.main?.filename === __filename) {
  // eslint-disable-next-line no-console
  find().then((data) => console.log(data));
}
