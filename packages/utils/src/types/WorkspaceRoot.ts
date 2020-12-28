export interface WorkspaceRootFinder {
  find: (rootUrl?: string) => Promise<string>,
}
