import path from 'path';
import micromatch from 'micromatch';
import { findPackageJson } from '../findPackageJson';
import { getPackageJson } from '../getPackageJson';
import { WorkspaceRootFinder } from '../types/WorkspaceRoot';

const hasWorkspaces = (json: any) => {
  const { workspaces } = (json || {});
  return !!workspaces;
};

const extractWorkspaces = (json: any): string[] => {
  const { workspaces } = json;
  if (Array.isArray(workspaces)) {
    return workspaces;
  }
  return [workspaces];
};

const isRoot = (
  pwd: string,
  relative: string,
): boolean => {
  const pkg = getPackageJson(pwd);
  if (!hasWorkspaces(pkg)) {
    return false;
  }
  const workspaces = extractWorkspaces(pkg);
  return micromatch.isMatch(relative, workspaces.map((it) => `${it}/**/*`));
};

export const find: WorkspaceRootFinder['find'] = async (
  root: string = __dirname,
) => {
  let pwd = findPackageJson(root);
  while (!isRoot(pwd, path.relative(pwd, root))) {
    pwd = findPackageJson(path.dirname(pwd));
  }
  return pwd;
};

if (require.main?.filename === __filename) {
  // eslint-disable-next-line no-console
  find().then((data) => console.log(data));
}
