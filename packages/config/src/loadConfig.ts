/* eslint-disable import/prefer-default-export */
import { cosmiconfig } from 'cosmiconfig';
import { JSONSchema } from 'json-schema-to-typescript';
import { makeLogger, root } from '@tscmono/utils';
import { validate } from 'jsonschema';

/**
 * @ignore
 */
const debug = makeLogger(__filename);

/**
 * Uses `cosmiconfig` to obtain configuration and then
 * match it against a JSON Schema to validate, and finally
 * resolve the configuration
 * @param schema The JSON Schema to match config against
 * @param rootDir The directory used to find the monorepo root
 * @param name The name of the config module name
 * @category Config
 */
export const loadConfig = async <T>(
  schema: JSONSchema,
  name: string,
  rootDir?: string,
): Promise<T> => {
  const repoRoot = rootDir || await root.value;
  debug(`Loading config for "${name}" from "${repoRoot}"`);
  const explorer = cosmiconfig(name);
  const output = await explorer.search(repoRoot);
  if (!output || output.isEmpty) {
    throw new Error(`Configuration for ${name} cannot be found!`); // TODO: Make this better
  }
  debug('Config found');
  const isValid = validate(output.config, schema).valid;
  if (!isValid) {
    throw new Error(`Configuration for ${name} is invalid! (at: "${output.filepath}")`);
  }
  debug('Config is valid, resolving');
  return output.config as T;
};
