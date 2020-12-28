import path from 'path';
import { hasPackageJson } from './hasPackageJson';

export const findPackageJson = (
  cwd: string,
  prev?: string,
): string => {
  if (prev && prev === cwd) {
    throw new Error('Reached root folder');
  }
  if (hasPackageJson(cwd)) {
    return cwd;
  }
  return findPackageJson(path.dirname(cwd), cwd);
};
