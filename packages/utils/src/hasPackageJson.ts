import fs from 'fs';
import path from 'path';

/**
 * Determine if path contains a `package.json` file
 * @param pwd Path
 * @category Util
 */
export const hasPackageJson = (pwd: string) => fs.existsSync(
  path.resolve(pwd, 'package.json'),
);
