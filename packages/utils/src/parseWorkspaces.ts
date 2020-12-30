import semver from 'semver';

import { registerCache } from './cache';

import { WorkspaceParser } from './types/WorkspaceParser';
import { WorkspaceConfig } from './types/WorkspaceConfig';
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
): Promise<WorkspaceConfig> => {
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
): Promise<WorkspaceConfig> => {
  const pwd = rootDir || await root.value;
  debug('Parsing workspaces from: %s', pwd);
  const version = (await execPromised('yarn --version', { cwd: pwd }))[0];
  debug('Parsing workspaces using yarn version: %s', version);
  const yarnVersion = semver.major(version);
  if (!(yarnVersion in parsers)) {
    throw new Error('Unknown Yarn Version');
  }
  debug('Running Parser');
  return runParser(parsers[yarnVersion], pwd);
};

export const workspaces = registerCache(
  'workspaces',
  parseWorkspaces,
);

export default parseWorkspaces;

if (require.main?.filename === __filename) {
  const val = async () => {
    const value = await workspaces.value;
    console.log('Value', value && Object.keys(value));
  };
  const refresh = async () => {
    await workspaces.refresh(process.cwd());
    console.log('Value');
  };
  const time = async (func: () => Promise<void>) => {
    const start = Date.now();
    console.log('Start');
    await func();
    console.log('End', Date.now() - start);
  };
  (async () => {
    await time(val);
    await time(val);
    await time(val);
    await time(refresh);
    await time(val);
    await time(val);
  })();
}
