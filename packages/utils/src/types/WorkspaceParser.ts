import { WorkspaceConfig } from "./WorkspaceConfig";

export interface WorkspaceParser {
  call: (cwd: string) => Promise<string[]>,
  parse: (input: string[], cwd: string) => Promise<WorkspaceConfig>,
}
