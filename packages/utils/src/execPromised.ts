import { exec } from 'child_process';
import { makeLogger } from './logger';
import { ExecOptions } from './types/ExecOptions';

/**
 * @ignore
 */
const debug = makeLogger(__filename);

/**
 * Will execute a process and return a Promise that
 * would resolve to the STDOUT split by lines
 * @param cmd Command to be executed
 * @param options Options
 * @category Util
 */
export const execPromised = (
  cmd: string,
  options: ExecOptions = {},
): Promise<string[]> => new Promise(
  (accept, reject) => {
    const { cwd = process.cwd(), exitOnSTDERR } = options;
    debug(`Executing "${cmd}" in "${cwd}" ${exitOnSTDERR ? '(exiting on STDERR)' : ''}`);
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      if (exitOnSTDERR && stderr) {
        return reject(new Error('STDERR not empty'));
      }
      return accept(stdout.split('\n'));
    });
  },
);
