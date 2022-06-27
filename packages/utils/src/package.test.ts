import { vol } from 'memfs';
import { hasPackageJson, getPackageJson } from './package';

jest.mock('fs', () => require('memfs').fs);
jest.mock('fs/promises', () => require('memfs').fs.promises);

const content = { awesome: 'stuff' };
const testCases: {
  text: string,
  exists: boolean,
  fs: Record<string, any>,
  expected?: Record<string, any>
}[] = [
  {
    text: 'default usage',
    fs: {
      'package.json': JSON.stringify(content),
    },
    exists: true,
    expected: content,
  },
  {
    text: 'no json',
    fs: {
    },
    exists: false,
  },
  {
    text: 'yml case',
    fs: {
      'package.yml': JSON.stringify(content),
    },
    exists: true,
    expected: content,
  },
  {
    text: 'yaml usage',
    fs: {
      'package.yaml': JSON.stringify(content),
    },
    exists: true,
    expected: content,
  },
];

describe('hasPackageJson', () => {
  it('should be a function', () => {
    expect(hasPackageJson).toBeInstanceOf(Function);
  });
  it('should have one parameter', () => {
    expect(hasPackageJson.length).toBe(1);
  });
  it.each(testCases)('hasPackageJson(%s)', ({ fs, exists }) => {
    vol.reset();
    vol.fromNestedJSON(fs);
    expect(hasPackageJson('')).toBe(exists);
  });
});

describe('getPackageJson', () => {
  it('should be a function', () => {
    expect(getPackageJson).toBeInstanceOf(Function);
  });
  it('should have one parameter', () => {
    expect(getPackageJson.length).toBe(1);
  });
  describe.each(testCases)('getPackageJson(%s)', ({ fs, exists, expected }) => {
    beforeAll(() => {
      vol.reset();
      vol.fromNestedJSON(fs);
    });
    if (!exists) {
      it('should error out', () => {
        expect(() => getPackageJson('')).toThrow();
      });
    } else {
      it('should return the proper value', () => {
        expect(getPackageJson('')).toEqual(expected);
      });
    }
  });
});
