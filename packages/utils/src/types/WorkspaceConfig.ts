export type WorkspaceDependencies = {
  workspaceDependencies: string[],
  mismatchedWorkspaceDependencies: string[],
};

export type WorkspaceConfig = {
  location: string,
} & WorkspaceDependencies;

export type YarnV2WorkspaceConfig = {
  name: string,
} & WorkspaceConfig;

export type WorkspacesConfig = Record<string, WorkspaceConfig>;
