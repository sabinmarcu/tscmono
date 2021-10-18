import path from 'path';
import fs from 'fs';
import { Command } from 'clipanion';
import { root, normalizePath, makeLogger } from '@tscmono/utils';
import merge from 'ts-deepmerge';
import { repoConfig } from './config';
import { generateTsConfigs } from './tree';

/**
 * @ignore
 */
const debug = makeLogger(__filename);

/**
 * Command path of the [[RepoCommand]]
 * @category Command
 */
export const commandPath = ['generate', 'repo'];

/**
 * Command used to generate all repo tsconfigs
 * @category Command
 */
export class RepoCommand extends Command {
  @Command.Path(...commandPath)
  async execute() {
    const rootDir = await root.value;
    const config = await repoConfig.value;
    const list = await generateTsConfigs(config);
    const rootExtra = {
      extends: normalizePath(rootDir, config.baseConfig),
    };
    list.forEach(
      ({ path: p, isRoot, content }) => {
        const conf = isRoot
          ? merge(rootExtra, content)
          : content;
        debug('Emitting', p);
        fs.writeFileSync(
          p,
          JSON.stringify({
            ...conf,
            references: conf.references.map(
              (
                { path: ref }: { path: string },
              ) => ({
                path: normalizePath(
                  path.dirname(p),
                  ref,
                ),
              }),
            ),
          }, undefined, 2),
        );
      },
    );
  }
}
