export type LoggingNaming = {
  name: string,
  prefix?: string,
};

export type LoggingNamingParser<T extends any[]> = (...args: T) => LoggingNaming;
export type LoggingNamingParserBinding = () => LoggingNaming;
export type LoggingNamingParserValidator = () => string | undefined;
export type LoggingNamingParsers = 'name' | 'file' | 'package';
