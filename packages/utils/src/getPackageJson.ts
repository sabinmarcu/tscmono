import path from 'path';

/**
 * Load a `package.json` file from a path
 * @param pwd The path
 * @category Util
 */
export const getPackageJson = (pwd: string) => require(
  path.resolve(pwd, 'package.json'),
);
