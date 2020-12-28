import semver from 'semver';

import { WorkspaceParser } from './types/WorkspaceParser';
import { WorkspaceConfig } from './types/WorkspaceConfig';
import { execPromised } from './execPromised';

import V1Parser from './parsers/v1';
import V2Parser from './parsers/v2';
import { findRoot } from './findRoot';

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
  const pwd = rootDir || await findRoot();
  const version = (await execPromised('yarn --version'))[0];
  const yarnVersion = semver.major(version);
  if (!(yarnVersion in parsers)) {
    throw new Error('Unknown Yarn Version');
  }
  return runParser(parsers[yarnVersion], pwd);
};

export default parseWorkspaces;

if (require.main?.filename === __filename) {
  // eslint-disable-next-line no-console
  parseWorkspaces().then((data) => console.log(data));
}
