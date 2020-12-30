import { makeLogger } from './logger';

const cache: Record<string, any> = {};

/**
 * @ignore
 */
const debug = makeLogger(__filename);

/**
 * Proxy for working with caches
 */
export type CacheDescriptor<T, K extends any[]> = {
  value: Promise<T>,
  refresh: (...args: K) => Promise<T>,
};

/**
 * Register a cache key
 * @param name The name of the property to save under
 * @param setter A setter to be used in obtaining the values
 */
export const registerCache = <T, K extends any[]>(
  name: string,
  setter: (...args: K) => Promise<T>,
  defaultArguments?: K,
): CacheDescriptor<T, K> => {
  debug(`Creating cache for "${name}"`);
  const log = debug.extend(name);
  let lastArguments = defaultArguments || [];
  const refresh = async (...args: K) => {
    log('Refreshing with args: ', args);
    lastArguments = args;
    cache[name] = await setter(...args);
    return cache[name];
  };
  return ({
    get value() {
      log('Retrieving value');
      if (!cache[name]) {
        log('Initial load');
        return refresh(...lastArguments as K);
      }
      return Promise.resolve(cache[name]);
    },
    refresh,
  });
};
