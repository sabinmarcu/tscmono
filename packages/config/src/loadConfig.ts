/* eslint-disable import/prefer-default-export */
import path from 'path';
import fs from 'fs';
import { cosmiconfig } from 'cosmiconfig';
import { JSONSchema } from 'json-schema-to-typescript';
import { makeLogger, root } from '@tscmono/utils';
import { Validator } from 'jsonschema';
import { nanoid } from 'nanoid';
import { deepCopy } from 'deep-copy-ts';

/**
 * @ignore
 */
const debug = makeLogger(__filename);

/**
 * Resolve a schema reference to schema file
 * @param ref Reference to be resolved
 * @param rootDir Directory to be resolved against
 * @category Config
 */
const resolveRef = (
  ref: string,
  rootDir: string,
) => {
  const paths = [
    path.resolve(__dirname, '../schemas', ref),
    path.resolve(rootDir, ref),
  ];
  return paths.filter((it) => fs.existsSync(it))?.[0] ?? undefined;
};

type SubschemaResolutionType = {
  path: string,
  schema: JSONSchema,
  resolution: JSONSchema
};

/**
 * Obtain a list of sub-schemas (referenced schemas) from a given schema
 * @param schema Schema to be parsed
 * @param rootDir Root directory to be used when resolving schema references
 * @category Config
 */
const getSubSchemas = (
  schema: Partial<JSONSchema>,
  rootDir: string,
): SubschemaResolutionType[] => {
  if (!schema || typeof schema === 'string') {
    return [];
  }
  if (schema.$ref?.startsWith('.')) {
    const schemaPath = resolveRef(schema.$ref, rootDir);
    const id = `/${nanoid()}`;
    // eslint-disable-next-line no-param-reassign
    schema.$ref = id;
    const resolvedSchema = deepCopy(require(schemaPath));
    return [{
      path: id,
      schema: {
        ...resolvedSchema,
        id,
      },
      resolution: resolvedSchema,
    }];
  }
  return Object.values(schema).map(
    (subSchema) => getSubSchemas(subSchema, rootDir),
  ).flat();
};

const resolveSubSchemas = (
  schemaCopy: Partial<JSONSchema>,
  repoRoot: string,
  validator: Validator,
) => {
  const subSchemas = getSubSchemas(schemaCopy, repoRoot);
  subSchemas.forEach(
    ({ path: p, schema: s }) => validator.addSchema(s, p),
  );
  subSchemas.forEach(
    ({ resolution }) => resolveSubSchemas(resolution, repoRoot, validator),
  );
};

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
  const schemaCopy = deepCopy(schema);
  const repoRoot = rootDir || await root.value;
  debug(`Loading config for "${name}" from "${repoRoot}"`);
  const explorer = cosmiconfig(name, { stopDir: repoRoot });
  const output = await explorer.search(repoRoot);
  if (!output || output.isEmpty) {
    throw new Error(`Configuration for ${name} cannot be found!`); // TODO: Make this better
  }
  debug('Config found');
  const validator = new Validator();
  resolveSubSchemas(schemaCopy, repoRoot, validator);
  const validateResult = validator.validate(output.config, schemaCopy);
  const isValid = validateResult.valid;
  if (!isValid) {
    throw new Error(`Configuration for ${name} is invalid! 
    (at: "${output.filepath}")
    (against: "${schemaCopy.title}")
    
${validateResult.errors.map(
    ({ property, message }) => `    ${property}: ${message}`,
  ).join('\n')}
    
    `);
  }
  debug('Config is valid, resolving');
  return output.config as T;
};
