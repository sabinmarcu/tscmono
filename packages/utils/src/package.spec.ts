import path from 'path';
import { Volume } from 'memfs';
import { IFS } from 'unionfs/lib/fs';
import { IUnionFs } from 'unionfs';

beforeAll(() => {
  jest.mock('fs', () => {
    const union = require('unionfs').default;
    const fs = jest.requireActual('fs');
    return union.use(fs);
  });
});

afterEach(() => {
  const union = require('unionfs').default as IUnionFs & { fss: any };
  const fs = jest.requireActual('fs');
  union.fss = [fs];
});

describe('getPackageJson', () => {
  let testFunc;
  beforeAll(() => {
    const { getPackageJson } = require('./package');
    testFunc = getPackageJson;
  });
  beforeEach(() => {
    jest.resetModules();
  });
  it('should properly append package.json', () => {
    const result = 'result';
    const testPath = 'some/path';
    jest.doMock(
      path.resolve(testPath, 'package.json'),
      () => result,
      { virtual: true },
    );
    expect(testFunc(testPath)).toEqual(result);
  });
});

describe('hasPackageJson', () => {
  let testFunc;
  beforeAll(() => {
    const { hasPackageJson } = require('./package');
    testFunc = hasPackageJson;
  });
  it('should resolve when path contains a package.json', () => {
    const testPath = 'some/path';
    const vol = Volume.fromJSON(
      {
        'package.json': 'thing',
      },
      path.resolve(testPath),
    );
    (require('fs') as IUnionFs).use(vol as any as IFS);
    expect(testFunc(testPath)).toEqual(true);
  });
  it('should fail when path does not contain a package.json', () => {
    const testPath = 'some/path';
    const vol = Volume.fromJSON(
      {
        'package.nope': 'thing',
      },
      path.resolve(testPath),
    );
    (require('fs') as IUnionFs).use(vol as any as IFS);
    expect(testFunc(testPath)).toEqual(false);
  });
});

describe('findPackageJson', () => {
  let testFunc;
  beforeAll(() => {
    const { findPackageJson } = require('./package');
    testFunc = findPackageJson;
  });
  it('should correctly return when package.json is at pwd', () => {
    const testPath = 'some/path';
    const vol = Volume.fromJSON(
      {
        'package.json': 'thing',
      },
      testPath,
    );
    (require('fs') as IUnionFs).use(vol as any as IFS);
    expect(testFunc(testPath)).toEqual(testPath);
  });
  it('should correctly return when package.json is down the path', () => {
    const end = 'root';
    const resultPath = 'some/path';
    const testPath = path.join(resultPath, end);
    const vol = Volume.fromJSON(
      {
        'package.json': 'thing',
      },
      resultPath,
    );
    (require('fs') as IUnionFs).use(vol as any as IFS);
    expect(testFunc(testPath)).toEqual(resultPath);
  });
  it('should correctly return when package.json is down the path', () => {
    const testPath = '/';
    const vol = Volume.fromJSON(
      {
        'package.nope': 'thing',
      },
      '/',
    );
    (require('fs') as IUnionFs).use(vol as any as IFS);
    expect(() => testFunc(testPath)).toThrow();
  });
});
