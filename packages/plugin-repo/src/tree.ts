import path from 'path';
import {
  makeLogger,
  makeTsConfigFileName,
  parseWorkspaces,
  pathsToTree,
  registerCache,
  root,
  TreeNode,
  hasPackageJson,
} from '@tscmono/utils';
import merge from 'ts-deepmerge';

// @ts-ignore
import { WorkspaceRootConfig, TSConfigCustomConfig } from '@tscmono/config/schemas-types/root';
import template from './template.json';
import { getConfig } from './config';

/**
 * @ignore
 */
const debug = makeLogger(__filename);

/**
 * Create a project tree based on workspaces
 * @param rootDir The root directory used in creating the project tree
 * @category Tree
 */
export const getTree = async (
  rootDir: string = process.cwd(),
) => {
  debug(`Starting tree parsing at ${rootDir}`);
  const projectRoot = await root.value;
  debug(`Found project root at ${projectRoot}`);
  const workspaces = await parseWorkspaces(projectRoot);
  const paths = Object.values(workspaces)
    .map(({ location }) => location);
  debug('Obtained paths', paths);
  const tree = pathsToTree(paths);
  return {
    projectRoot,
    tree,
  };
};

/**
 * Cached version of the [[getTree | Workspace Tree Generator]] function
 * @category Cache
 */
export const workspaceTree = registerCache(
  'workspaceTree',
  getTree,
);

/**
 * Describe what should be written to the filesystem for a tsconfig
 */
type TSConfigTemplate = {
  /**
   * The path of the file to be written
   */
  path: string,
  /**
   * The content to be written
   */
  content: any & { references: {path: string}[] },
  /**
   * Used to decide if the `baseConfig` should be added as `extends`
   */
  isRoot: boolean,
};

export const validConfig = async (
  workspacePath: string,
  rootConfig: WorkspaceRootConfig,
): Promise<boolean> => {
  try {
    await getConfig(workspacePath);
  } catch (e) {
    if (rootConfig.mode !== 'loose') {
      throw e;
    }
    return false;
  }
  return true;
};

/**
 * Convert a single [[TreeNode]] instance to a [[TSConfigTemplate]], given the
 * project path, and a template to be used. It will only generate the template for
 * the current node, and not traverse its children
 * @param projectPath The project path
 * @param tree The tree to be converted
 * @param tpl The template to be used
 * @category TSConfig Generation
 */
export const treeNodeToTSConfig = async (
  projectPath: string,
  tree: TreeNode,
  tpl: any,
  rootConfig: WorkspaceRootConfig,
  fileCfg?: [string, TSConfigCustomConfig],
): Promise<TSConfigTemplate> => {
  const [fName] = fileCfg || [];
  const fileName = makeTsConfigFileName(
    (tree.isLinkFile && rootConfig.linkFile)
    || fName
  );

  const isRoot = tree.path === '';

  let references: any[];
  if (!fName && isRoot && !!rootConfig.files && (
    rootConfig.defaultFileMode !== 'default'
    || tree.isLinkFile
  )) {
    references = Object.keys(rootConfig.files)
      .map((it) => ({
        path: path.resolve(
          projectPath,
          tree.path,
          makeTsConfigFileName(it),
        ),
      }));
  } else {
    references = (await Promise.all(
      Object.values(tree.children).map(
        async (node) => {
          const workspaceRelativePath = typeof node === 'string' ? node : node.path;
          const workspacePath = path.resolve(projectPath, workspaceRelativePath);
          const isValid = await validConfig(workspacePath, rootConfig);
          const withPackageJson = await hasPackageJson(workspacePath);
          return {
            path: workspacePath,
            valid: !withPackageJson || isValid,
          };
        },
      ),
    ))
      .filter(({ valid }) => valid)
      .map(({ path: workspacePath }) => workspacePath)
      .map((it) => ({ path: path.resolve(it, fileName) }));
  }

  return ({
    path: path.resolve(projectPath, tree.path, fileName),
    isRoot,
    content: merge(
      tpl,
      {
        references,
      },
    ),
  });
};

/**
 * Reduce an entire [[TreeNode]] to an array of [[TSConfigTemplate]]s, using
 * the [[treeNodeToTSConfig]] function to convert a single node to template,
 * traversing the [[TreeNode.children]] to generate the [[TSConfigTemplate]] array
 * @param projectPath
 * @param tree
 * @param tpl
 * @category TSConfig Generation
 */
export const reduceTreeNodeToTSConfigList = async (
  projectPath: string,
  tree: TreeNode,
  rootConfig: WorkspaceRootConfig,
  tpl: any,
): Promise<TSConfigTemplate[] | undefined> => {
  const currentTemplate = await treeNodeToTSConfig(projectPath, tree, tpl, rootConfig);
  const extraTemplates: TSConfigTemplate[] = [];
  if (rootConfig.files) {
    await Promise.all(
      Object.entries(rootConfig.files).map(
        async (fileSet) => {
          extraTemplates.push(
            await treeNodeToTSConfig(
              projectPath,
              tree,
              tpl,
              rootConfig,
              fileSet as [string, TSConfigCustomConfig],
            ),
          );
        },
      ),
    );
  }
  const isRoot = tree.path === '';
  if (isRoot && rootConfig.linkFile) {
    extraTemplates.push(
      await treeNodeToTSConfig(
        projectPath,
        { isLinkFile: rootConfig.linkFile, path: '', children: {} },
        tpl,
        rootConfig,
      )
    )
  }
  const childTemplates = (await Promise.all(
    Object.values(tree.children).map(
      async (child) => {
        if (typeof child === 'string') {
          return undefined;
        }
        return reduceTreeNodeToTSConfigList(
          projectPath,
          child,
          rootConfig,
          tpl,
        );
      },
    ),
  )).flat().filter(Boolean) as TSConfigTemplate[];
  return [
    currentTemplate,
    ...extraTemplates,
    ...childTemplates,
  ];
};

/**
 * Generate [[TSConfigTemplate]]s for all repo paths
 * @param rootDir The root directory to be used when generating tsConfigs
 * @category TSConfig Generation
 */
export const generateTsConfigs = async (
  rootConfig: WorkspaceRootConfig,
  rootDir: string = process.cwd(),
) => {
  debug('Starting tsconfigs generation');
  const tree = rootDir
    ? await workspaceTree.refresh(rootDir)
    : await workspaceTree.value;
  debug('Generated workspace tree');
  const tsConfigs = await reduceTreeNodeToTSConfigList(
    tree.projectRoot,
    tree.tree,
    rootConfig,
    template,
  ) as TSConfigTemplate[];
  return tsConfigs;
};
