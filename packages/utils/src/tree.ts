import merge from 'ts-deepmerge';

export type TreeNode = {
  path: string,
  children: Record<string, TreeNode | string>,
} & { [key: string]: any };

/**
 * Used in generating a tree from a list of paths, becoming the root
 * scope
 * @category Tree
 */
export const rootString = '<root>';

/**
 * Generate a [[TreeNode | Tree]] from a path
 * @param input The input path
 * @param prev Previous segments to be appended to path
 * @category Tree
 */
export const pathToTree = (
  input: string,
  prev?: string,
): TreeNode | undefined => {
  const [current, ...rest] = input.split('/').filter(Boolean);
  const currentPath = [prev, current]
    .filter(Boolean)
    .join('/')
    .replace(new RegExp(`${rootString}/?`), '');
  let children = {};
  if (rest && rest.length > 0) {
    if (rest.length === 1) {
      children = {
        [rest[0]]: [currentPath, rest[0]].filter(Boolean).join('/'),
      };
    } else {
      children = {
        [rest[0]]: pathToTree(rest.join('/'), currentPath),
      };
    }
    return {
      path: currentPath,
      children,
    };
  }
  return undefined;
};

/**
 * Generate a [[TreeNode | Tree]] from a set of paths. All input
 * paths will be prepended with [[rootString | a root string]] so 
 * that a merge would be possible without overwriting the root scope 
 * ([[rootString]] becomes the root scope instead of the first segment
 * of each input path)
 * @param input The paths to be compiled into a [[TreeNode | Tree]]
 * @category Tree
 */
export const pathsToTree = (
  input: string[],
): TreeNode => {
  const nodes = input.map(
    (child) => pathToTree(`${rootString}/${child}`),
  ) as TreeNode[];
  const tree = nodes
    .reduce(
      (
        prev: TreeNode,
        it: TreeNode,
      ) => merge(prev, it),
      {} as TreeNode,
    );
  return tree;
};
