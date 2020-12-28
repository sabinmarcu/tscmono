import fs from 'fs';
import path from 'path';

export const hasPackageJson = (pwd: string) => fs.existsSync(
  path.resolve(pwd, 'package.json'),
);
