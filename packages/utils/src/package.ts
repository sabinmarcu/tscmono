import fs from 'fs';
import path from 'path';

/**
 * Load a `package.json` file from a path
 * @param pwd The path
 * @category Util
 */
export const getPackageJson = (pwd: string) => require(
  path.resolve(pwd, 'package.json'),
);

/**
 * Determine if path contains a `package.json` file
 * @param pwd Path
 * @category Util
 */
export const hasPackageJson = (pwd: string) => fs.existsSync(
  path.resolve(pwd, 'package.json'),
);

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

/**
 * Fixes Yarn V2 Output to conform to V1 Standards
 * @param pwd Root path
 * @param p Package path
 * @category Util
 */
export const fixV2Path = (
  pwd: string,
  p: string,
) => require(
  path.resolve(pwd, p, 'package.json'),
).name;
