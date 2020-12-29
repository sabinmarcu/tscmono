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
