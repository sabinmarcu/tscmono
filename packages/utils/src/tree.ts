import merge from 'ts-deepmerge';

export type TreeNode = {
  path: string,
  children: Record<string, TreeNode | string>,
};

export const rootString = '<root>';

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
