import semver from 'semver';

import { registerCache } from './cache';

import { WorkspaceParser } from './types/WorkspaceParser';
import { WorkspacesConfig } from './types/WorkspaceConfig';
import { execPromised } from './execPromised';

import V1Parser from './parsers/v1';
import V2Parser from './parsers/v2';
import { root } from './findRoot';
import { makeLogger } from './logger';

/**
 * @ignore
 */
const debug = makeLogger(__filename, 'file');

/**
 * @ignore
 */
const parsers: Record<number, WorkspaceParser> = {
  1: V1Parser,
  2: V2Parser,
  3: V2Parser,
  4: V2Parser,
};

/**
 * Invoke a [[WorkspaceParser | Workspace Parser]] in a certain path
 * @param parser Parser to be invoked on the path
 * @param cwd Path to be used when parsing
 * @category Yarn Workspace Parsers
 */
const runParser = async (
  parser: WorkspaceParser,
  cwd: string,
): Promise<WorkspacesConfig> => {
  const input = await parser.call(cwd);
  const config = await parser.parse(input, cwd);
  return config;
};

/**
 * Attempt to parse repo workspaces from a certain path.
 * It will attempt to parse by using parsers made for
 * Yarn [[YarnV1Parser | V1]] and [[YarnV2Parser | V2]]
 * @param rootDir Path to be used when parsing
 * @category Yarn Workspace Parsers
 */
export const parseWorkspaces = async (
  rootDir?: string,
): Promise<WorkspacesConfig> => {
  const pwd = rootDir || await root.value;
  debug('Parsing workspaces from: %s', pwd);
  const version = (await execPromised('yarn --version', { cwd: pwd }))[0];
  debug('Parsing workspaces using yarn version: %s', version);
  const yarnVersion = semver.major(version);
  if (!(yarnVersion in parsers)) {
    throw new Error('Unknown Yarn Version');
  }
  debug('Running Parser');
  const result = runParser(parsers[yarnVersion], pwd);
  debug('Parser complete, resolving');
  return result;
};

/**
 * Cached version of the [[parseWorkspaces | Parse Workspaces]] function
 * @category Cache
 */
export const workspaces = registerCache(
  'workspaces',
  parseWorkspaces,
);

export default parseWorkspaces;
