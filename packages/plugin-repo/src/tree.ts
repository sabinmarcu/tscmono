import path from 'path';
import {
  makeLogger,
  parseWorkspaces,
  pathsToTree,
  registerCache,
  root,
  TreeNode,
} from '@tscmono/utils';
import merge from 'ts-deepmerge';

// @ts-ignore
import { WorkspaceRootConfig, TSConfigCustomConfig } from '@tscmono/config/types/root';
import template from './template.json';

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
   * The path of the file to be writte
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

export const resolvePreset = (
  rootConfig: WorkspaceRootConfig,
  preset: string,
): any => {
  if (!rootConfig.presets) {
    throw new Error('No presets defined in root config!');
  }
  if (!(preset in rootConfig.presets)) {
    throw new Error(`Preset ${preset} not found in root config!`);
  }
  return rootConfig.presets[preset];
};

export const resolveTsConfig = (
  rootConfig: WorkspaceRootConfig,
  config: TSConfigCustomConfig,
): any => {
  const toMerge = [];
  if (config.overrides) {
    toMerge.push(config.overrides);
  }
  if (config.preset) {
    toMerge.push(resolvePreset(rootConfig, config.preset as string));
  }
  if (config.presets) {
    (config.presets as string[]).forEach(
      (preset: string) => toMerge.push(resolvePreset(rootConfig, preset)),
    );
  }
  if (config.extends) {
    toMerge.push({ extends: config.extends });
  }
  return merge(...toMerge);
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
export const treeNodeToTSConfig = (
  projectPath: string,
  tree: TreeNode,
  tpl: any,
  fileCfg?: [string, TSConfigCustomConfig],
): TSConfigTemplate => {
  const [fName] = fileCfg || [];
  const fileName = fName
    ? `tsconfig.${fName}.json`
    : 'tsconfig.json';

  const isRoot = tree.path === '';

  return ({
    path: path.resolve(projectPath, tree.path, fileName),
    isRoot,
    content: merge(
      tpl,
      {
        references: Object.values(tree.children).map(
          (node) => (typeof node === 'string'
            ? path.resolve(projectPath, node)
            : path.resolve(projectPath, node.path)),
        ).map((it) => ({ path: path.resolve(it, fileName) })),
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
export const reduceTreeNodeToTSConfigList = (
  projectPath: string,
  tree: TreeNode,
  rootConfig: WorkspaceRootConfig,
  tpl: any,
): TSConfigTemplate[] | undefined => {
  const currentTemplate = treeNodeToTSConfig(projectPath, tree, tpl);
  const extraTemplates: TSConfigTemplate[] = [];
  if (rootConfig.files) {
    Object.entries(rootConfig.files).forEach(
      (fileSet) => {
        extraTemplates.push(
          treeNodeToTSConfig(
            projectPath,
            tree,
            tpl,
            fileSet as [string, TSConfigCustomConfig],
          ),
        );
      },
    );
  }
  const childTemplates = Object.values(tree.children).map(
    (child) => {
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
  ).flat().filter(Boolean) as TSConfigTemplate[];
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
  const tsConfigs = reduceTreeNodeToTSConfigList(
    tree.projectRoot,
    tree.tree,
    rootConfig,
    template,
  ) as TSConfigTemplate[];
  return tsConfigs;
};
