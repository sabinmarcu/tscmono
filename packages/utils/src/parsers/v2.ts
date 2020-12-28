import path from 'path';
import { execPromised } from '../execPromised';
import { WorkspaceConfig, YarnV2WorkspaceConfig } from '../types/WorkspaceConfig';
import { WorkspaceParser } from '../types/WorkspaceParser';

/**
 * Fixes Yarn V2 Output to conform to V1 Standards
 * @param pwd Root path
 * @param p Package path
 * @category Util
 */
const fixV2Path = (
  pwd: string,
  p: string,
) => require(
  path.resolve(pwd, p, 'package.json'),
).name;

/**
 * Yarn V2 Workspace List Parser
 * @category Yarn Workspace Parsers
 */
export const YarnV2Parser: WorkspaceParser = {
  call: (cwd) => execPromised(
    'yarn workspaces list -v --json',
    { cwd },
  ),
  parse: async (
    input,
    pwd,
  ) => {
    const boundFixV2Path = fixV2Path.bind(undefined, pwd);
    const pkg = require(path.resolve(pwd, 'package.json'));
    const output = input.join(',');
    const packages = (JSON.parse(`[${output.substr(0, output.length - 1)}]`)) as YarnV2WorkspaceConfig[];
    const validPackages = packages.filter(({ name }) => name !== pkg);
    const json = validPackages.reduce(
      (prev, {
        name,
        workspaceDependencies,
        mismatchedWorkspaceDependencies,
        ...rest
      }: YarnV2WorkspaceConfig) => ({
        ...prev,
        [name]: {
          ...rest,
          workspaceDependencies: (workspaceDependencies || [])
            .map(boundFixV2Path),
          mismatchedWorkspaceDependencies: (mismatchedWorkspaceDependencies || [])
            .map(boundFixV2Path),
        },
      }),
      {} as WorkspaceConfig,
    );
    return json;
  },
};

export default YarnV2Parser;
