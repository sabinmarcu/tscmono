import fs from 'fs';
import { Command } from 'clipanion';
import { generateTsConfigs } from './graph';

/**
 * The command path of the [[WorkspaceCommand]]
 * @category Command
 */
export const commandPath = ['generate', 'workspace'];

/**
 * Command used to generate all workspaces tsconfigs
 * @category Command
 */
export class WorkspaceCommand extends Command {
  @Command.Path(...commandPath)
  async execute() {
    const list = await generateTsConfigs();
    list.forEach(
      ({ path: p, content }) => {
        fs.writeFileSync(
          p,
          JSON.stringify(content, undefined, 2),
        );
      },
    );
  }
}
