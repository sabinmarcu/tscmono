import { commandPath, WorkspaceCommand } from './WorkspaceCommand';

export * from './graph';

/**
 * Define commands exported from this plugin
 * @category Plugin Definition
 */
export const commands = [
  WorkspaceCommand,
];

/**
 * State that this plugin should be run from [[BaseCommand]]
 * @category Plugin Definition
 */
export const runOnDefault = true;

/**
 * Path to be run from [[BaseCommand]]
 * @category Plugin Definition
 */
export const runOnDefaultPath = commandPath;

/**
 * Run priority of this plugin when evaluated by [[BaseCommand]]
 * @category Plugin Definition
 */
export const runOnDefaultPriority = 20;
