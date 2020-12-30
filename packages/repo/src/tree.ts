import { findRoot, makeLogger, parseWorkspaces } from '@tscmono/utils';

const debug = makeLogger(__filename);

export const getTree = async (
  rootDir: string,
) => {
  debug(`Starting tree parsing at ${rootDir}`);
  const projectRoot = await findRoot(rootDir);
  debug(`Found project root at ${projectRoot}`);
  const workspaces = await parseWorkspaces(projectRoot);
  const paths = [
    ...new Set(
      Object.values(workspaces)
        .map(({ location }) => {
          const dirs = location.split('/');
          const acc = [];
          while (dirs.length > 0) {
            acc.push(dirs.join('/'));
            dirs.shift();
          }
          return acc;
        })
        .flat(),
    ),
  ];
  debug('Obtained paths', paths);
};

getTree(__dirname).then((data) => console.log(data));
