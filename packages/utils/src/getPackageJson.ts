import path from 'path';

export const getPackageJson = (pwd: string) => require(
  path.resolve(pwd, 'package.json'),
);
