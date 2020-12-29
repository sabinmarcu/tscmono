import { loadConfig, JSONSchema } from '@tscmono/config';
import repoSchema from '@tscmono/config/schemas/repo.json';
import type { RepoConfig } from '@tscmono/config/types/repo';

/**
 * @ignore
 */
let cache: RepoConfig;

export const getConfig = async (): Promise<RepoConfig> => {
  if (!cache) {
    const config = await loadConfig<RepoConfig>(
      repoSchema as JSONSchema,
      __dirname,
      'tscmono',
    );
    cache = config;
  }
  return cache;
};

(async () => {
  let start = Date.now();
  console.log('start');
  console.log(
    await getConfig(),
  );
  console.log('end', Date.now() - start);
  start = Date.now();
  console.log('second');
  console.log(
    await getConfig(),
  );
  console.log('second', Date.now() - start);
  start = Date.now();
  console.log('second');
  console.log(
    await getConfig(),
  );
  console.log('second', Date.now() - start);
  start = Date.now();
  console.log('second');
  console.log(
    await getConfig(),
  );
  console.log('second', Date.now() - start);
  start = Date.now();
  console.log('second');
  console.log(
    await getConfig(),
  );
  console.log('second', Date.now() - start);
})();
