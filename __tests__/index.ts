import _execa from 'execa';
import path from 'path';
import waitOn from 'wait-on';
import { makeDir, cleanDir } from 'uwf/src/tools/lib/fs';
import fetch from 'node-fetch';
import assert from 'assert';
import terminate from 'terminate';

const timeout = 1000 * 1000;

const execa = (command: string, args: string[], opts?: _execa.Options) =>
  _execa(command, args, { stdout: process.stdout, ...opts });

const verifyApp = async () => {
  const expected = 'React Starter Kit - www.reactstarterkit.com';
  await waitOn({
    resources: ['http://localhost:3000'],
    timeout,
  });
  const text = await fetch('http://localhost:3000').then(r => r.text());
  const match = text.match(/<title.*?>(.+?)</);
  if (!match) throw new Error('Title text does not exist');
  const [_, actual] = match;
  assert.strictEqual(actual, expected);
};

const startApp = (cwd: string) =>
  execa('yarn', ['run', 'uwf', 'start', '--silent'], {
    cwd,
  });

describe('Command uwf ', () => {
  it(
    '"starts" compiles and starts examples/basic correctly',
    async () => {
      const cwd = path.resolve(__dirname, '../examples/basic');
      const app = startApp(cwd);
      await verifyApp();
      app.kill();
    },
    timeout * 2,
  );
});

describe.only('Command uwf ', () => {
  it(
    '"init" initialize project from scratch correctly',
    async () => {
      const libDir = path.join(__dirname, '../packages/uwf');
      const userDir = path.join(process.env.HOME!, 'tmpUserDir');
      const packedName = './uwf-packed.tgz';

      await cleanDir(userDir);
      await makeDir(userDir);
      await execa('yarn', ['init', '--yes'], { cwd: userDir });

      await execa(
        'yarn',
        ['pack', '--filename', path.join(userDir, packedName)],
        { cwd: libDir },
      );

      await execa('yarn', ['--force', 'add', '-D', packedName], {
        cwd: userDir,
      });

      await execa(
        'yarn',
        [
          'add',
          'react',
          'react-dom',
          'classnames',
          'node-fetch',
          'normalize.css',
        ],
        { cwd: userDir },
      );

      await execa('yarn', ['uwf', 'init', '--verbose'], {
        cwd: userDir,
      });

      console.info('#########################################');
      await execa('find', [`${userDir}/node_modules/uwf/dist`], {
        cwd: userDir,
      });

      const app = startApp(userDir);
      console.log('verifying.................');
      await verifyApp();
      console.log('terminating.................');
      await new Promise((resolve, reject) => {
        terminate(app.pid, (err: any) => (err ? reject(err) : resolve()));
      });
      console.log('terminate...............');

      // Teardown
      await cleanDir(userDir);
    },
    timeout * 2,
  );
});
