import path from 'path';
import micromatch from 'micromatch';
import { findPackageJson, getPackageJson } from '../package';
import { WorkspaceRootFinder } from '../types/WorkspaceRoot';
import { makeLogger } from '../logger';

/**
 * @ignore
 */
const debug = makeLogger(__filename);

/**
 * Determines if a package.json has workspaces
 * @param {JSON} json The contents of a package.json
 * @category Util
 */
const hasWorkspaces = (json: any) => {
  const { workspaces } = (json || {});
  return !!workspaces;
};

/**
 * Extracts an array of workspaces from a package.json
 * @param {JSON} json The contents of a package.json
 * @category Util
 */
const extractWorkspaces = (json: any): string[] => {
  const { workspaces } = json;
  if (Array.isArray(workspaces)) {
    return workspaces;
  }
  return [workspaces];
};

/**
 * Checks if the current folder (pwd) contains a package.json with
 * workspaces and then checks a relative path against workspaces
 * to determine if the relative path belongs to the current monorepo
 * @param pwd The path to check if it is the monorepo root
 * @param relative Relative path to be checked against workspaces
 * @category Util
 */
const isRoot = (
  pwd: string,
  relative: string,
): boolean => {
  debug(`Trying "${pwd}"`);
  const pkg = getPackageJson(pwd);
  if (!hasWorkspaces(pkg)) {
    return false;
  }
  const workspaces = extractWorkspaces(pkg);
  return micromatch.isMatch(relative, workspaces.map((it) => `${it}/**/*`));
};

/**
 * Crawl directory structure to find root workspaces dir
 * @param root Root dir to begin crawling
 * @category Workspace Root Finder
 */
export const findWithWorkspaces: WorkspaceRootFinder['find'] = async (
  root: string = process.cwd(),
) => {
  debug('Finding Repo Root through Workspaces field');
  let pwd = findPackageJson(root);
  while (!isRoot(pwd, path.relative(pwd, root))) {
    pwd = findPackageJson(path.dirname(pwd));
  }
  debug(`Found at "${pwd}"`);
  return pwd;
};

export default findWithWorkspaces;

if (require.main?.filename === __filename) {
  // eslint-disable-next-line no-console
  findWithWorkspaces().then((data) => console.log(data));
}
