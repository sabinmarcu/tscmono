import semver from 'semver';

import { WorkspaceParser } from './types/WorkspaceParser';
import { WorkspaceConfig } from './types/WorkspaceConfig';
import { execPromised } from './execPromised';

import * as V1Parser from './parsers/v1';
import * as V2Parser from './parsers/v2';
import { findRoot } from './findRoot';

const parsers: Record<number, WorkspaceParser> = {
  1: V1Parser,
  2: V2Parser,
};

const runParser = async (
  parser: WorkspaceParser,
  cwd: string,
): Promise<WorkspaceConfig> => {
  const input = await parser.call(cwd);
  const config = await parser.parse(input, cwd);
  return config;
};

const parseWorkspaces = async (
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

module.exports = parseWorkspaces;
module.exports.parse = parseWorkspaces;

if (require.main?.filename === __filename) {
  // eslint-disable-next-line no-console
  parseWorkspaces().then((data) => console.log(data));
}
