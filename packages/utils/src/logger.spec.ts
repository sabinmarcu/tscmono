import path from 'path';
import { Volume } from 'memfs';
import { IFS } from 'unionfs/lib/fs';
import { IUnionFs } from 'unionfs';

beforeEach(() => {
  jest.resetModules();
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

describe('nameValidator', () => {
  let testFunc;
  beforeAll(() => {
    const { nameValidator } = require('./logger');
    testFunc = nameValidator;
  });
  it('should properly validate a name', () => {
    expect(testFunc('test')()).toBeUndefined();
  });
  it('should bail on an invalid name', () => {
    expect(testFunc(undefined)()).toEqual('must supply name');
  });
});

describe('fileNameValidator', () => {
  let testFunc;
  beforeAll(() => {
    const { fileNameValidator } = require('./logger');
    testFunc = fileNameValidator;
  });
  it('should properly validate a name', () => {
    expect(testFunc('test')()).toBeUndefined();
  });
  it('should bail on an invalid name', () => {
    expect(testFunc(undefined)()).toEqual('must supply fileName');
  });
});

describe('config', () => {
  let testItem;
  beforeAll(() => {
    const { config } = require('./logger');
    testItem = config;
  });
  let origSeparator;
  beforeEach(() => {
    origSeparator = testItem.separator;
  });
  afterEach(() => {
    testItem.setSeparator(origSeparator);
  });
  it('should retrieve the correct separator', () => {
    expect(testItem.separator).toEqual(':');
  });
  it('should not do anything when attempting to set separator via setter', () => {
    expect(testItem.separator).toEqual(':');
    expect(() => { testItem.separator = 'abc'; }).not.toThrow();
    expect(testItem.separator).toEqual(':');
  });
  it('should properly set separator when using set function', () => {
    expect(testItem.separator).toEqual(':');
    const newSeparator = '|';
    expect(() => { testItem.setSeparator(newSeparator); }).not.toThrow();
    expect(testItem.separator).toEqual(newSeparator);
  });
});

describe('normalizePath', () => {
  let testFunc;
  beforeAll(() => {
    const { normalizePath } = require('./logger');
    testFunc = normalizePath;
  });
  it('should properly normalize a path', () => {
    expect(testFunc('this/is/awesome')).toEqual('this:is:awesome');
  });
  it('should properly normalize a path with filename extension', () => {
    expect(testFunc('this/is/awesome.my.extensions')).toEqual('this:is:awesome');
  });
  it('should properly normalize a path with forbidden', () => {
    expect(testFunc('this/is/src/dist/awesome')).toEqual('this:is:awesome');
  });
});

describe('normalizeLoggingNaming', () => {
  let testFunc;
  beforeAll(() => {
    const { normalizeLoggingNaming } = require('./logger');
    testFunc = normalizeLoggingNaming;
  });
  it('should do nothing for a {name} only loggingNaming', () => {
    expect(testFunc({ name: 'awesome' })).toEqual({ name: 'awesome' });
  });
  it('should prepend prefix for a {name, prefix} loggingNaming', () => {
    expect(testFunc({ prefix: 'awesome', name: 'thing' }))
      .toEqual({ name: 'awesome:thing' });
  });
});

describe('getLoggingNamingFromPackageName', () => {
  let testFunc;
  beforeAll(() => {
    const { getLoggingNamingFromPackageName } = require('./logger');
    testFunc = getLoggingNamingFromPackageName;
  });
  it('should use package name if package doesn\'t contain scope', () => {
    expect(testFunc('thing')).toEqual({ name: 'thing' });
  });
  it('should use return prefix and name with scoped package', () => {
    expect(testFunc('@awesome/thing'))
      .toEqual({ name: 'thing', prefix: 'awesome' });
  });
});

describe('parseLoggingNameByPackageName', () => {
  it('should properly infer package name from package json', () => {
    const requireTestPath = 'some/path';
    const requireMockPath = path.resolve(requireTestPath, 'package.json');
    const name = 'package';
    const vol = Volume.fromJSON(
      {
        'package.json': 'nope',
      },
      requireMockPath,
    );
    jest.doMock(
      requireMockPath,
      () => ({ name }),
      { virtual: true },
    );
    (require('fs') as IUnionFs).use(vol as any as IFS);
    expect(require('./logger').parseLoggingNameByPackageName(requireTestPath)).toEqual({ name });
  });
  it('should properly infer package name and prefix from package json', () => {
    const requireTestPath = 'some/path';
    const requireMockPath = path.resolve(requireTestPath, 'package.json');
    const name = 'pkg';
    const prefix = 'some';
    const vol = Volume.fromJSON(
      {
        'package.json': 'nope',
      },
      requireTestPath,
    );
    jest.doMock(
      requireMockPath,
      () => ({ name: [`@${prefix}`, name].join('/') }),
      { virtual: true },
    );
    (require('fs') as IUnionFs).use(vol as any as IFS);
    expect(require('./logger').parseLoggingNameByPackageName(requireTestPath))
      .toEqual({ name: [prefix, name].join(':') });
  });
  it('should properly infer package name from parent package json', () => {
    const requireTestPath = 'some/path';
    const requireMockPath = path.resolve(requireTestPath, 'package.json');
    const name = 'package';
    const vol = Volume.fromJSON(
      {
        'package.json': 'nope',
      },
      requireTestPath,
    );
    jest.doMock(
      requireMockPath,
      () => ({ name }),
      { virtual: true },
    );
    (require('fs') as IUnionFs).use(vol as any as IFS);
    expect(require('./logger').parseLoggingNameByPackageName(path.join(requireTestPath, 'some', 'extra', 'path'))).toEqual({ name });
  });
});

describe('parseLoggingNameByFileName', () => {
  it('should properly infer package name from package json', () => {
    const testPath = 'some/path';
    const mockPath = path.resolve(testPath, 'package.json');
    const name = 'package';
    const fileName = 'fileName';
    const vol = Volume.fromJSON(
      {
        'package.json': 'nope',
      },
      mockPath,
    );
    jest.doMock(
      mockPath,
      () => ({ name }),
      { virtual: true },
    );
    (require('fs') as IUnionFs).use(vol as any as IFS);
    expect(
      require('./logger')
        .parseLoggingNameByFileName([testPath, fileName].join('/')),
    ).toEqual({ name: [name, fileName].join(':') });
  });
  it('should properly infer package name from package json', () => {
    const testPath = 'some/path';
    const mockPath = path.resolve(testPath, 'package.json');
    const name = 'package';
    const prefix = 'some';
    const fileName = 'fileName';
    const vol = Volume.fromJSON(
      {
        'package.json': 'nope',
      },
      mockPath,
    );
    jest.doMock(
      mockPath,
      () => ({ name: [`@${prefix}`, name].join('/') }),
      { virtual: true },
    );
    (require('fs') as IUnionFs).use(vol as any as IFS);
    expect(
      require('./logger')
        .parseLoggingNameByFileName([testPath, fileName].join('/')),
    ).toEqual({ name: [prefix, name, fileName].join(':') });
  });
  it('should properly infer package name from package json', () => {
    const testPath = 'some/path';
    const mockPath = path.resolve(testPath, 'package.json');
    const name = 'package';
    const fileName = 'fileName';
    const extraPath = ['some', 'long', 'path'];
    const vol = Volume.fromJSON(
      {
        'package.json': 'nope',
      },
      mockPath,
    );
    jest.doMock(
      mockPath,
      () => ({ name }),
      { virtual: true },
    );
    (require('fs') as IUnionFs).use(vol as any as IFS);
    expect(
      require('./logger')
        .parseLoggingNameByFileName([testPath, ...extraPath, fileName].join('/')),
    ).toEqual({ name: [name, ...extraPath, fileName].join(':') });
  });
});

describe('parseLoggingNameByName', () => {
  it('should properly infer package name from package json', () => {
    const requireTestPath = 'some/path';
    const requireMockPath = path.resolve(requireTestPath, 'package.json');
    const name = 'name';
    const packageName = 'package';
    const vol = Volume.fromJSON(
      {
        'package.json': 'nope',
      },
      requireMockPath,
    );
    jest.doMock(
      requireMockPath,
      () => ({ name: packageName }),
      { virtual: true },
    );
    (require('fs') as IUnionFs).use(vol as any as IFS);
    expect(
      require('./logger')
        .parseLoggingNameByName(requireTestPath, name),
    ).toEqual({ name: [packageName, name].join(':') });
  });
  it('should properly infer package name from package json', () => {
    const requireTestPath = 'some/path';
    const requireMockPath = path.resolve(requireTestPath, 'package.json');
    const name = 'name';
    const prefix = 'some';
    const packageName = 'package';
    const vol = Volume.fromJSON(
      {
        'package.json': 'nope',
      },
      requireMockPath,
    );
    jest.doMock(
      requireMockPath,
      () => ({ name: [`@${prefix}`, packageName].join('/') }),
      { virtual: true },
    );
    (require('fs') as IUnionFs).use(vol as any as IFS);
    expect(
      require('./logger')
        .parseLoggingNameByName(requireTestPath, name),
    ).toEqual({ name: [prefix, packageName, name].join(':') });
  });
  it('should properly infer package name from package json', () => {
    const requireTestPath = 'some/path';
    const requireMockPath = path.resolve(requireTestPath, 'package.json');
    const name = 'name';
    const packageName = 'package';
    const vol = Volume.fromJSON(
      {
        'package.json': 'nope',
      },
      requireMockPath,
    );
    jest.doMock(
      requireMockPath,
      () => ({ name: packageName }),
      { virtual: true },
    );
    (require('fs') as IUnionFs).use(vol as any as IFS);
    expect(
      require('./logger')
        .parseLoggingNameByName([requireTestPath, 'some/long/path'].join('/'), name),
    ).toEqual({ name: [packageName, name].join(':') });
  });
});

describe('validate', () => {
  it('should properly validate', () => {
    const { validate, nameValidator } = require('./logger');
    expect(
      () => validate('name', nameValidator('someone')),
    ).not.toThrow();
  });
  it('should properly throw when invalid', () => {
    const { validate, nameValidator } = require('./logger');
    expect(
      () => validate('name', nameValidator()),
    ).toThrow('must supply name');
  });
});

describe('extendLoggingNaming', () => {
  it('should properly extend a logging naming', () => {
    const { extendLoggingNaming } = require('./logger');
    expect(extendLoggingNaming({ name: 'awesome' }, 'thing'))
      .toEqual({
        name: ['awesome', 'thing'].join(':'),
      });
    expect(extendLoggingNaming({ name: 'awesome', prefix: 'some' }, 'thing'))
      .toEqual({
        name: ['some', 'awesome', 'thing'].join(':'),
      });
  });
});

describe('bindNameParsers', () => {
  it('should properly bind name parsers', () => {
    const { bindNameParsers } = require('./logger');
    const nameParsers = bindNameParsers('file');
    expect(typeof nameParsers).toEqual('object');
    expect(Object.keys(nameParsers)).toEqual(['name', 'file', 'package']);
  });
  describe('name parser', () => {
    it('should fail without name', () => {
      const requireTestPath = 'some/path';
      expect(() => require('./logger')
        .bindNameParsers([requireTestPath, 'file'].join('/'))
        .name()).toThrow();
    });
    it('should properly run name parser', () => {
      const requireTestPath = 'some/path';
      const requireMockPath = path.resolve(requireTestPath, 'package.json');
      const name = 'name';
      const packageName = 'package';
      const vol = Volume.fromJSON(
        {
          'package.json': 'nope',
        },
        requireMockPath,
      );
      jest.doMock(
        requireMockPath,
        () => ({ name: packageName }),
        { virtual: true },
      );
      (require('fs') as IUnionFs).use(vol as any as IFS);
      expect(
        require('./logger')
          .bindNameParsers([requireTestPath, 'file'].join('/'), name)
          .name(),
      ).toEqual({ name: [packageName, name].join(':') });
    });
  });
  describe('file parser', () => {
    it('should properly run file parser', () => {
      const requireTestPath = 'some/path';
      const requireMockPath = path.resolve(requireTestPath, 'package.json');
      const packageName = 'package';
      const fileName = 'fileName';
      const vol = Volume.fromJSON(
        {
          'package.json': 'nope',
        },
        requireMockPath,
      );
      jest.doMock(
        requireMockPath,
        () => ({ name: packageName }),
        { virtual: true },
      );
      (require('fs') as IUnionFs).use(vol as any as IFS);
      expect(
        require('./logger')
          .bindNameParsers([requireTestPath, fileName].join('/'))
          .file(),
      ).toEqual({ name: [packageName, fileName].join(':') });
    });
  });
  describe('package parser', () => {
    it('should properly run package parser', () => {
      const requireTestPath = 'some/path';
      const requireMockPath = path.resolve(requireTestPath, 'package.json');
      const packageName = 'package';
      const vol = Volume.fromJSON(
        {
          'package.json': 'nope',
        },
        requireMockPath,
      );
      jest.doMock(
        requireMockPath,
        () => ({ name: packageName }),
        { virtual: true },
      );
      (require('fs') as IUnionFs).use(vol as any as IFS);
      expect(
        require('./logger')
          .bindNameParsers([requireTestPath, 'file'].join('/'))
          .package(),
      ).toEqual({ name: packageName });
    });
  });
});

describe('parseLoggerName', () => {
  describe('name parser', () => {
    it('should fail without name', () => {
      const requireTestPath = 'some/path';
      const fileName = 'file';
      expect(() => require('./logger')
        .parseLoggerName(
          'name',
          { fileName: path.join(requireTestPath, fileName) },
        )).toThrow();
    });
    it('should properly run name parser', () => {
      const requireTestPath = 'some/path';
      const requireMockPath = path.resolve(requireTestPath, 'package.json');
      const name = 'name';
      const packageName = 'package';
      const fileName = 'file';
      const vol = Volume.fromJSON(
        {
          'package.json': 'nope',
        },
        requireMockPath,
      );
      jest.doMock(
        requireMockPath,
        () => ({ name: packageName }),
        { virtual: true },
      );
      (require('fs') as IUnionFs).use(vol as any as IFS);
      expect(
        require('./logger')
          .parseLoggerName(
            'name',
            { name, fileName: path.join(requireTestPath, fileName) },
          ),
      ).toEqual({ name: [packageName, name].join(':') });
    });
  });
  describe('file parser', () => {
    it('should properly run file parser', () => {
      const requireTestPath = 'some/path';
      const requireMockPath = path.resolve(requireTestPath, 'package.json');
      const packageName = 'package';
      const fileName = 'fileName';
      const vol = Volume.fromJSON(
        {
          'package.json': 'nope',
        },
        requireMockPath,
      );
      jest.doMock(
        requireMockPath,
        () => ({ name: packageName }),
        { virtual: true },
      );
      (require('fs') as IUnionFs).use(vol as any as IFS);
      expect(
        require('./logger')
          .parseLoggerName(
            'file',
            { fileName: path.join(requireTestPath, fileName) },
          ),
      ).toEqual({ name: [packageName, fileName].join(':') });
    });
  });
  describe('package parser', () => {
    it('should properly run package parser', () => {
      const requireTestPath = 'some/path';
      const requireMockPath = path.resolve(requireTestPath, 'package.json');
      const packageName = 'package';
      const fileName = 'fileName';
      const vol = Volume.fromJSON(
        {
          'package.json': 'nope',
        },
        requireMockPath,
      );
      jest.doMock(
        requireMockPath,
        () => ({ name: packageName }),
        { virtual: true },
      );
      (require('fs') as IUnionFs).use(vol as any as IFS);
      expect(
        require('./logger')
          .parseLoggerName(
            'package',
            { fileName: path.join(requireTestPath, fileName) },
          ),
      ).toEqual({ name: packageName });
    });
  });
});

describe('makeLogger', () => {
  describe('name parser', () => {
    it('should fail without name', () => {
      const requireTestPath = 'some/path';
      const fileName = 'file';
      expect(() => require('./logger')
        .makeLogger(
          path.join(requireTestPath, fileName),
          'name',
        )).toThrow();
    });
    it('should properly run name parser', () => {
      const requireTestPath = 'some/path';
      const requireMockPath = path.resolve(requireTestPath, 'package.json');
      const name = 'name';
      const packageName = 'package';
      const fileName = 'file';
      const vol = Volume.fromJSON(
        {
          'package.json': 'nope',
        },
        requireMockPath,
      );
      jest.doMock(
        requireMockPath,
        () => ({ name: packageName }),
        { virtual: true },
      );
      (require('fs') as IUnionFs).use(vol as any as IFS);
      expect(
        require('./logger')
          .makeLogger(
            path.join(requireTestPath, fileName),
            'name',
            name,
          ).namespace,
      ).toEqual([packageName, name].join(':'));
    });
  });
  describe('file parser', () => {
    it('should properly run file parser', () => {
      const requireTestPath = 'some/path';
      const requireMockPath = path.resolve(requireTestPath, 'package.json');
      const packageName = 'package';
      const fileName = 'fileName';
      const vol = Volume.fromJSON(
        {
          'package.json': 'nope',
        },
        requireMockPath,
      );
      jest.doMock(
        requireMockPath,
        () => ({ name: packageName }),
        { virtual: true },
      );
      (require('fs') as IUnionFs).use(vol as any as IFS);
      expect(
        require('./logger')
          .makeLogger(
            path.join(requireTestPath, fileName),
            'file',
          ).namespace,
      ).toEqual([packageName, fileName].join(':'));
    });
  });
  describe('package parser', () => {
    it('should properly run package parser', () => {
      const requireTestPath = 'some/path';
      const requireMockPath = path.resolve(requireTestPath, 'package.json');
      const packageName = 'package';
      const fileName = 'fileName';
      const vol = Volume.fromJSON(
        {
          'package.json': 'nope',
        },
        requireMockPath,
      );
      jest.doMock(
        requireMockPath,
        () => ({ name: packageName }),
        { virtual: true },
      );
      (require('fs') as IUnionFs).use(vol as any as IFS);
      expect(
        require('./logger')
          .makeLogger(
            path.join(requireTestPath, fileName),
            'package',
          ).namespace,
      ).toEqual(packageName);
    });
  });
});
