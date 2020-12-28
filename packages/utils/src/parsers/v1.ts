import { execPromised } from '../execPromised';
import { WorkspaceConfig } from '../types/WorkspaceConfig';
import { WorkspaceParser } from '../types/WorkspaceParser';

export const call: WorkspaceParser['call'] = (cwd: string): Promise<string[]> => execPromised('yarn workspaces info', { cwd });

export const parse: WorkspaceParser['parse'] = async (input: string[]): Promise<WorkspaceConfig> => {
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
};
