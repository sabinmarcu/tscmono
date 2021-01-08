import path from 'path';

/**
 * Normalize a path relative to root directory,
 * optionally specifying the package root path,
 * turning the path from absolute to relative to
 * package path, prepending `./` if necessary
 * @param rootPath Root directory path
 * @param pathToResolve Path to be resolved
 * @param pkgRootPath Path of the package path to be resolve
 * @category Path
 */
export const normalizePath = (
  rootPath: string,
  pathToResolve: string,
  pkgRootPath?: string,
) => {
  const basePath = path.relative(
    rootPath,
    pathToResolve,
  );
  const newPath = pkgRootPath
    ? path.relative(
      pkgRootPath,
      basePath,
    ) : basePath;
  if (newPath[0] !== '.') {
    return `./${newPath}`;
  }
  return newPath;
};
