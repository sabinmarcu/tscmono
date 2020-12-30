import {
  TreeNode,
  pathToTree,
  rootString,
  pathsToTree,
} from './tree';

type TestSet<I, O> = {
  input: I,
  output: O,
};

const makeTest = <I, O, T extends TestSet<I, O>>(
  set: T,
  func: (input: I) => O,
) => {
  it(`test ${JSON.stringify(set.input)}`, () => {
    expect(func(set.input)).toEqual(set.output);
  });
};

describe('pathToTree', () => {
  const testSets: TestSet<string, TreeNode | undefined>[] = [
    {
      input: 'packages/utils',
      output: {
        path: 'packages',
        children: {
          utils: 'packages/utils',
        },
      },
    },
    {
      input: 'packages/some/thing',
      output: {
        path: 'packages',
        children: {
          some: {
            path: 'packages/some',
            children: {
              thing: 'packages/some/thing',
            },
          },
        },
      },
    },
    {
      input: 'awesome',
      output: undefined,
    },
    {
      input: `${rootString}/packages`,
      output: {
        path: '',
        children: {
          packages: 'packages',
        },
      },
    },
    {
      input: `${rootString}/packages/things`,
      output: {
        path: '',
        children: {
          packages: {
            path: 'packages',
            children: {
              things: 'packages/things',
            },
          },
        },
      },
    },
  ];
  testSets.forEach((set) => makeTest(set, pathToTree));
});

describe('pathsToTree', () => {
  const testSets: TestSet<string[], TreeNode>[] = [
    {
      input: [
        'packages/utils',
        'packages/things',
        'packages/others',
      ],
      output: {
        path: '',
        children: {
          packages: {
            path: 'packages',
            children: {
              utils: 'packages/utils',
              things: 'packages/things',
              others: 'packages/others',
            },
          },
        },
      },
    },
    {
      input: [
        'packages/utils',
        'packages/things',
        'packages/things/awesome',
        'packages/things/shitty',
        'packages/others',
        'test/things',
        'test/awesome',
        'thing',
      ],
      output: {
        path: '',
        children: {
          packages: {
            path: 'packages',
            children: {
              utils: 'packages/utils',
              things: {
                path: 'packages/things',
                children: {
                  awesome: 'packages/things/awesome',
                  shitty: 'packages/things/shitty',
                },
              },
              others: 'packages/others',
            },
          },
          test: {
            path: 'test',
            children: {
              things: 'test/things',
              awesome: 'test/awesome',
            },
          },
          thing: 'thing',
        },
      },
    },
  ];
  testSets.forEach((set) => makeTest(set, pathsToTree));
});
