import { WorkspacesConfig } from './WorkspaceConfig';

export interface WorkspaceParser {
  call: (cwd: string) => Promise<string[]>,
  parse: (input: string[], cwd: string) => Promise<WorkspacesConfig>,
}
