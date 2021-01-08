import { commandPath, RepoCommand } from './RepoCommand';

export * from './config';
export * from './tree';

/**
 * Define commands exported from this plugin
 * @category Plugin Definition
 */
export const commands = [
  RepoCommand,
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
export const runOnDefaultPriority = 10;
