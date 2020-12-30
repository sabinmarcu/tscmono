import { execPromised } from '../execPromised';
import { makeLogger } from '../logger';
import { WorkspacesConfig } from '../types/WorkspaceConfig';
import { WorkspaceParser } from '../types/WorkspaceParser';

/**
 * @ignore
 */
const debug = makeLogger(__filename);

/**
 * Yarn V1 Workspace List Parser
 * @category Yarn Workspace Parsers
 */
export const YarnV1Parser: WorkspaceParser = {

  /**
   * Obtain an Yarn V1 workspace list output
   * @param cwd The cwd of execution
   */
  call: (cwd: string): Promise<string[]> => {
    const cmd = 'yarn workspaces info';
    debug('Discovering Yarn Workspaces');
    return execPromised(
      cmd,
      { cwd },
    );
  },

  /**
   * Parse a Yarn V1 workspace list output
   * @param input The input to parse
   */
  parse: async (input: string[]): Promise<WorkspacesConfig> => {
    debug('Parsing output');
    const output = input.join('\n');
    const [start, end] = [
      output.indexOf('{'),
      output.lastIndexOf('}'),
    ];
    return JSON.parse(
      output.substr(
        start,
        end - start + 1,
      ),
    ) as WorkspacesConfig;
  },
};

export default YarnV1Parser;
