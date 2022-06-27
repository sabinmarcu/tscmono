import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';

const packageOptions = {
  'package.json': JSON.parse,
  'package.yml': parse,
  'package.yaml': parse,
} as const;

/**
 * Load a `package.json` file from a path
 * @param pwd The path
 * @category Util
 */
export const getPackageJson = (pwd: string) => {
  const attempts = Object.entries(packageOptions).map(
    ([file, parser]) => {
      try {
        const contents = fs.readFileSync(
          path.resolve(
            pwd.replace(new RegExp(`/${file}$`), ''),
            file,
          ),
          'utf-8',
        );
        return (parser as any)(contents);
      } catch (e) {
        return undefined;
      }
    },
  );
  const match = attempts.find(Boolean);
  if (!match) {
    throw new Error(`Could not find package.json at path ${pwd}`);
  }
  return match;
};

/**
 * Determine if path contains a `package.json` file
 * @param pwd Path
 * @category Util
 */
export const hasPackageJson = (pwd: string) => Object.keys(
  packageOptions,
).some(
  (test) => fs.existsSync(
    path.resolve(pwd, test),
  ),
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
