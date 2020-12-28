import path from 'path';
import { hasPackageJson } from './hasPackageJson';

/**
 * Find a directory containing a package.json file, crawling from the
 * starting path, and moving towards the OS root dir, using [[hasPackageJson]]
 * @param pwd Starting point for finding a package.json
 * @param prev Previous visited directory (used for determining OS root dir)
 * @category Util
 */
export const findPackageJson = (
  pwd: string,
  prev?: string,
): string => {
  if (prev && prev === pwd) {
    throw new Error('Reached root folder');
  }
  if (hasPackageJson(pwd)) {
    return pwd;
  }
  return findPackageJson(path.dirname(pwd), pwd);
};
