import { exec } from 'child_process';

/**
 * @link [[execPromised]]
 */
export type ExecOptions = {
  /**
   * CWD to run the process into
   */
  cwd?: string,
  /**
   * Should exit when STDERR is not empty
   */
  exitOnSTDERR?: boolean,
};

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
    const { cwd, exitOnSTDERR } = options;
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
