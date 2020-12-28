import { exec } from 'child_process';

export type ExecOptions = {
    cwd?: string,
    exitOnSTDERR?: boolean,
}

export const execPromised = (
    cmd: string, 
    {
      cwd,
      exitOnSTDERR,
    }: ExecOptions = {}
): Promise<string[]> => new Promise(
  (accept, reject) => {
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      if (exitOnSTDERR && stderr) {
        return reject(new Error('STDERR not empty'))
      }
      return accept(stdout.split('\n'));
    });
  },
);
