import 'debug-extend';

import path from 'path';
import debug from 'debug';
import { findPackageJson, getPackageJson } from './package';
import {
  LoggingNaming,
  LoggingNamingParser,
  LoggingNamingParserBinding,
  LoggingNamingParserValidator,
  LoggingNamingParsers,
} from './types/LoggerNaming';

/**
 * @ignore
 */
const privateConfig = {
  separator: ':',
};

/**
 * Configure the Logger
 * @category Logging
 */
export const config = {
  /**
   * The separator to be used when generating logger names
   */
  get separator() {
    return privateConfig.separator;
  },
  /**
   * NOOP Setting the separator through dot notation (TS)
   */
  set separator(_: string) {
    // NOOP
  },
  /**
   * Set the separator to be used when generating logger names
   * @param value The new separator
   */
  setSeparator(value: string): string {
    privateConfig.separator = value;
    return value;
  },
};

/**
 * Paths to be excluded from [[normalizePath | Path Normalization]]
 */
export const excludeFromPathNormalization = ['src', 'dist', 'types'];

/**
 * Normalize path by replacing slashes with [[config.separator | naming separator]]
 * stripping [[excludeFromPathNormalization | excluded path segments]] and
 * removing extensions
 * @param filePath Path to be normalized
 */
export const normalizePath = (
  filePath: string,
): string => filePath
  .split('/')
  .filter(Boolean)
  .filter((it) => !excludeFromPathNormalization.includes(it))
  .join(config.separator)
  .replace(/\..*$/, '');

/**
 * Normalize a Logging Naming by applying the prefix to the name,
 * if possible
 * @param loggingNaming Logging Naming to be normalized
 * @category Logging
 */
export const normalizeLoggingNaming = (
  loggingNaming: LoggingNaming,
): LoggingNaming => (loggingNaming.prefix
  ? { name: [loggingNaming.prefix, loggingNaming.name].join(config.separator) }
  : loggingNaming);

/**
 * Obtain a [[LoggingNaming | Logging Naming Convention]] from a package name
 * @param packageName Name of the package
 * @category Util
 */
export const getLoggingNamingFromPackageName = (
  packageName: string,
): LoggingNaming => {
  if (packageName.match(/^@[^/]+\/[^/]+$/)) {
    const [prefix, name] = packageName.substr(1).split('/');
    return {
      name,
      prefix,
    };
  }
  return {
    name: packageName,
  };
};

/**
 * Generate a [[LoggingNaming | Logger Naming Convention]] based on the current package name
 * @param rootDir The `__dirname` of the current script
 * @category Logging
 */
export const parseLoggingNameByPackageName: LoggingNamingParser<[string]> = (
  rootDir: string,
) => {
  const { name } = getPackageJson(findPackageJson(rootDir));
  return normalizeLoggingNaming(
    getLoggingNamingFromPackageName(name),
  );
};

/**
 * Generate a [[LoggingNaming | Logger Naming Convention]]
 * based on the current file and package name
 * @param fileName The `__filename` of the current script
 * @category Logging
 */
export const parseLoggingNameByFileName: LoggingNamingParser<[string]> = (
  fileName: string,
) => {
  const absPath = path.resolve(fileName);
  const pkgDir = findPackageJson(path.dirname(absPath));
  const name = normalizePath(
    absPath.replace(pkgDir, ''),
  );
  return normalizeLoggingNaming(
    {
      name,
      prefix: parseLoggingNameByPackageName(path.dirname(fileName)).name,
    },
  );
};

/**
 * Generate a [[LoggingNaming | Logger Naming Convention]]
 * based on a name and current package
 * @param dirName The `__dirname` of the current script
 * @param name The name to be attributed
 * @category Logging
 */
export const parseLoggingNameByName: LoggingNamingParser<[string, string]> = (
  dirName: string,
  name: string,
) => normalizeLoggingNaming({
  name,
  prefix: parseLoggingNameByPackageName(dirName).name,
});

/**
 * @ignore
 */
export const nameValidator = (
  name?: string,
): LoggingNamingParserValidator => (): string | undefined => {
  if (!name) {
    return 'must supply name';
  }
  return undefined;
};

/**
 * @ignore
 */
export const fileNameValidator = (
  fileName?: string,
): LoggingNamingParserValidator => (): string | undefined => {
  if (!fileName) {
    return 'must supply fileName';
  }
  return undefined;
};

/**
 * @ignore
 */
export const validate = (
  type: LoggingNamingParsers,
  ...validators: LoggingNamingParserValidator[]
) => {
  const errors = validators.map((it) => it()).filter(Boolean);
  if (errors.length > 0) {
    throw new Error(`Could not create logger of type '${type}. Reasons:
${errors.map((it) => `  - ${it}`)}
    `);
  }
};

/**
 * @ignore
 */
export const bindNameParsers = (
  fileName: string,
  name?: string,
): Record<LoggingNamingParsers, LoggingNamingParserBinding> => ({
  name: () => {
    validate(
      'name',
      nameValidator(name),
      fileNameValidator(fileName),
    );
    return parseLoggingNameByName(
      path.dirname(fileName),
      name!,
    );
  },
  file: () => {
    validate(
      'file',
      fileNameValidator(fileName),
    );
    return parseLoggingNameByFileName(fileName);
  },
  package: () => {
    validate(
      'file',
      fileNameValidator(fileName),
    );
    return parseLoggingNameByPackageName(path.dirname(fileName));
  },
});

/**
 * Extend a logging naming with an extension string
 * @param loggingNaming The Logging Naming
 * @param input The extension string
 * @category Logging
 */
export const extendLoggingNaming = (
  loggingNaming: LoggingNaming,
  input: string,
): LoggingNaming => normalizeLoggingNaming({
  name: input,
  prefix: loggingNaming.name,
});

/**
 * Generate a logging name based on user input
 * @param parser The parser to use when generating a logging name
 * @param input The input used for generation
 * @category Logging
 */
export const parseLoggerName = (
  parser: LoggingNamingParsers,
  input: { name?: string, fileName: string },
): LoggingNaming => {
  const { name, fileName } = input;
  const parsers = bindNameParsers(fileName, name);
  return parsers[parser]();
};

if (require.main?.filename === __filename) {
  // eslint-disable-next-line no-console
  console.log(
    parseLoggerName(
      'file',
      { fileName: __filename },
    ),
  );
}

/**
 * Create a logger to be used in the app
 * @param fileName The filename from which to generate the logger name
 * @param parser The parser to use for generating the logger name
 * @param loggerName Optional name to be used when generating the logger name
 */
export const makeLogger = (
  fileName: string,
  parser: LoggingNamingParsers = 'file',
  loggerName?: string,
) => {
  const { name } = parseLoggerName(parser, { fileName, name: loggerName });
  return debug(name);
};
