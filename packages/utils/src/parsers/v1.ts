import { execPromised } from '../execPromised';
import { WorkspaceConfig } from '../types/WorkspaceConfig';
import { WorkspaceParser } from '../types/WorkspaceParser';

/**
 * Yarn V1 Workspace List Parser
 * @category Yarn Workspace Parsers
 */
export const YarnV1Parser: WorkspaceParser = {

  /**
   * Obtain an Yarn V1 workspace list output
   * @param cwd The cwd of execution
   */
  call: (cwd: string): Promise<string[]> => execPromised(
    'yarn workspaces info',
    { cwd },
  ),

  /**
   * Parse a Yarn V1 workspace list output
   * @param input The input to parse
   */
  parse: async (input: string[]): Promise<WorkspaceConfig> => {
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
    ) as WorkspaceConfig;
  },
};

export default YarnV1Parser;
