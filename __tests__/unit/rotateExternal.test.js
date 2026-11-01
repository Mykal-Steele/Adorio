import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  rmSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createVmTokenExternal } from '../../scripts/lib/externals/vm-token.mjs';

const OLD = 'old-token-0123456789abcdef';
const NEW = 'new-token-0123456789abcdef';

const config = {
  id: 'runner',
  type: 'vm-token',
  label: 'Updating the code runner VM',
  vmName: 'vm-test',
  deployEnv: 'infra/.secrets/vm-deploy.env',
  deployEnvKeys: { resourceGroup: 'VM_RESOURCE_GROUP', token: 'VM_AUTH_TOKEN' },
  onVm: {
    confFile: '/opt/app/nginx.conf',
    container: 'app_proxy',
    port: 2358,
    scrubDirs: ['/var/lib/cloud'],
  },
  tokenKey: 'VM_TOKEN',
  urlKey: 'VM_URL',
  caKey: 'VM_CA_CERT',
  tokenHeader: 'X-Auth-Token',
  probePath: '/api/v2/runtimes',
  readyTimeoutMinutes: 0.01,
};

const item = (key, value, old = OLD, status = 'changed') => ({ key, spec: {}, value, old, status });
const ok = (stdout = '') => ({ code: 0, stdout, stderr: '' });

// A VM that starts out accepting OLD. Running the script file on it swaps the token.
function fakeVm({
  power = 'PowerState/deallocated',
  scriptOutput = 'Enable succeeded:\n[stdout]\nROTATION_OK\n[stderr]\n',
  failFirstRuns = 0,
} = {}) {
  const state = { accepted: [OLD], calls: [], scripts: [], scriptModes: [], runs: 0, power };
  const run = async (command, args) => {
    state.calls.push(args);
    const line = args.join(' ');
    if (line.includes('get-instance-view')) return ok(`${state.power}\n`);
    if (line.startsWith('vm start')) {
      state.power = 'PowerState/running';
      return ok();
    }
    if (line.startsWith('vm deallocate')) {
      state.power = 'PowerState/deallocated';
      return ok();
    }
    if (line.startsWith('vm run-command invoke')) {
      state.runs += 1;
      if (state.runs <= failFirstRuns)
        return {
          code: 1,
          stdout: '',
          stderr: 'VMAgentStatusCommunicationError: the VM agent is not ready',
        };
      const file = args.find((a) => a.startsWith('@')).slice(1);
      const script = readFileSync(file, 'utf8');
      state.scripts.push(script);
      state.scriptModes.push(statSync(file).mode & 0o777);
      const from = /OLD='([^']*)'/.exec(script)?.[1];
      const to = /NEW='([^']*)'/.exec(script)?.[1];
      const mode = /MODE='([^']*)'/.exec(script)?.[1];
      if (scriptOutput.includes('ROTATION_OK') && to) {
        state.accepted = mode === 'open' ? [from, to] : [to];
      }
      return ok(scriptOutput);
    }
    return ok();
  };
  return { state, run };
}

describe('vm-token external', () => {
  let root;

  const build = (vm, overrides = {}) => {
    const probes = [];
    const external = createVmTokenExternal({
      config,
      root,
      hold: overrides.hold,
      run: overrides.run ?? vm.run,
      probe: async (request) => {
        probes.push(request);
        if (overrides.probeStatus) return overrides.probeStatus(request, probes.length);
        return vm.state.accepted.includes(request.token) ? 200 : 401;
      },
      current: (key) => ({ VM_URL: 'https://vm.example:2358', VM_CA_CERT: 'CA\\nPEM' })[key],
      paramsDir: path.join(root, 'tmp'),
      sleep: async () => {},
    });
    return { external, probes };
  };

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'vmtoken-'));
    mkdirSync(path.join(root, 'infra/.secrets'), { recursive: true });
    mkdirSync(path.join(root, 'tmp'));
    writeFileSync(
      path.join(root, 'infra/.secrets/vm-deploy.env'),
      `VM_RESOURCE_GROUP=rg-test\nVM_AUTH_TOKEN=${OLD}\n`,
    );
  });
  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  const words = (vm) =>
    vm.state.calls.map((a) => a.slice(0, 2).join(' ')).filter((w) => w !== 'vm get-instance-view');

  test('has an id and a label for the screen', () => {
    const { external } = build(fakeVm());
    expect(external.id).toBe('runner');
    expect(external.label).toBe('Updating the code runner VM');
  });

  test('applies only when the token changed', () => {
    const { external } = build(fakeVm());
    expect(external.applies([item('VM_TOKEN', NEW)])).toBe(true);
    expect(external.applies([item('VM_TOKEN', 'same', 'same', 'unchanged')])).toBe(false);
    expect(external.applies([item('OTHER', NEW)])).toBe(false);
  });

  test('snapshot keeps the token the VM has now, from the deploy file, and its power state', async () => {
    const { external } = build(fakeVm());
    expect(await external.snapshot()).toEqual({
      token: OLD,
      resourceGroup: 'rg-test',
      power: 'deallocated',
    });
  });

  test('snapshot says what is missing from the deploy file', async () => {
    writeFileSync(path.join(root, 'infra/.secrets/vm-deploy.env'), 'VM_RESOURCE_GROUP=rg-test\n');
    const { external } = build(fakeVm());
    await expect(external.snapshot()).rejects.toThrow(/VM_AUTH_TOKEN/);
  });

  test('starts a stopped VM, changes the token on it, proves it, and stops it again', async () => {
    const vm = fakeVm();
    const { external } = build(vm);
    const snapshot = await external.snapshot();
    await external.apply([item('VM_TOKEN', NEW)], snapshot);
    expect(words(vm)).toEqual(['vm start', 'vm run-command', 'vm deallocate']);
    expect(vm.state.power).toBe('PowerState/deallocated');
  });

  test('applying makes the VM accept the new token next to the old one, so the running app is not turned away', async () => {
    const vm = fakeVm({ power: 'PowerState/running' });
    const { external } = build(vm);
    await external.apply([item('VM_TOKEN', NEW)], await external.snapshot());
    expect(vm.state.accepted).toEqual([OLD, NEW]);
  });

  test('finishing retires the old token and leaves only the new one, then stops the VM again', async () => {
    const vm = fakeVm();
    const { external } = build(vm);
    const snapshot = await external.snapshot();
    await external.apply([item('VM_TOKEN', NEW)], snapshot);
    vm.state.calls.length = 0;
    await external.finish([item('VM_TOKEN', NEW)], snapshot);
    expect(words(vm)).toEqual(['vm start', 'vm run-command', 'vm deallocate']);
    expect(vm.state.accepted).toEqual([NEW]);
    expect(vm.state.power).toBe('PowerState/deallocated');
  });

  test('finishing leaves a VM that was running as it found it', async () => {
    const vm = fakeVm({ power: 'PowerState/running' });
    const { external } = build(vm);
    const snapshot = await external.snapshot();
    await external.apply([item('VM_TOKEN', NEW)], snapshot);
    vm.state.calls.length = 0;
    await external.finish([item('VM_TOKEN', NEW)], snapshot);
    expect(words(vm)).toEqual(['vm run-command']);
  });

  test('finishing fails when the old token is still accepted afterwards, because then it is not retired', async () => {
    const vm = fakeVm();
    const { external } = build(vm, { probeStatus: () => 200 });
    const snapshot = await external.snapshot();
    await external.apply([item('VM_TOKEN', NEW)], snapshot);
    await expect(external.finish([item('VM_TOKEN', NEW)], snapshot)).rejects.toThrow(
      /still accepts the old token/,
    );
  });

  test('finishing takes the VM hold like applying does', async () => {
    const vm = fakeVm();
    const events = [];
    const hold = {
      acquire: async () => {
        events.push('hold');
        return { release: async () => events.push('release') };
      },
    };
    const { external } = build(vm, { hold });
    const snapshot = await external.snapshot();
    await external.finish([item('VM_TOKEN', NEW)], snapshot);
    expect(events).toEqual(['hold', 'release']);
  });

  test('reopening makes the VM accept both tokens again, also after the old one was retired', async () => {
    const vm = fakeVm({ power: 'PowerState/running' });
    const { external } = build(vm);
    const snapshot = await external.snapshot();
    await external.apply([item('VM_TOKEN', NEW)], snapshot);
    await external.finish([item('VM_TOKEN', NEW)], snapshot);
    expect(vm.state.accepted).toEqual([NEW]);
    await external.reopen(snapshot, [item('VM_TOKEN', NEW)]);
    expect(vm.state.accepted).toEqual([OLD, NEW]);
  });

  test('leaves a VM that was running as it found it', async () => {
    const vm = fakeVm({ power: 'PowerState/running' });
    const { external } = build(vm);
    await external.apply([item('VM_TOKEN', NEW)], await external.snapshot());
    expect(words(vm)).toEqual(['vm run-command']);
  });

  test('the script swaps the token in the proxy config without replacing the file, and restarts the proxy', async () => {
    const vm = fakeVm();
    const { external } = build(vm);
    await external.apply([item('VM_TOKEN', NEW)], await external.snapshot());
    const script = vm.state.scripts[0];
    expect(script).toContain(`OLD='${OLD}'`);
    expect(script).toContain(`NEW='${NEW}'`);
    expect(script).toContain("CONF='/opt/app/nginx.conf'");
    expect(script).toContain('cat /tmp/nginx.conf.rotating > "$CONF"');
    expect(script).not.toMatch(/sed -i[^\n]*"\$CONF"/);
    expect(script).toContain('docker restart app_proxy');
    expect(script).toContain('ROTATION_OK');
  });

  test('the old token is scrubbed from boot-time copies only when it is retired, not while it is still in use', async () => {
    const vm = fakeVm({ power: 'PowerState/running' });
    const { external } = build(vm);
    const snapshot = await external.snapshot();
    await external.apply([item('VM_TOKEN', NEW)], snapshot);
    await external.finish([item('VM_TOKEN', NEW)], snapshot);
    expect(vm.state.scripts[0]).not.toContain('/var/lib/cloud');
    expect(vm.state.scripts[1]).toContain('/var/lib/cloud');
  });

  test('the tokens are in a private file and never on a command line', async () => {
    const vm = fakeVm();
    const { external } = build(vm);
    await external.apply([item('VM_TOKEN', NEW)], await external.snapshot());
    expect(vm.state.scriptModes).toEqual([0o600]);
    const lines = JSON.stringify(vm.state.calls);
    expect(lines).not.toContain(NEW);
    expect(lines).not.toContain(OLD);
  });

  test('deletes the script file afterwards, also when the script fails', async () => {
    const good = fakeVm();
    await build(good).external.apply(
      [item('VM_TOKEN', NEW)],
      await build(good).external.snapshot(),
    );
    expect(readdirSync(path.join(root, 'tmp'))).toEqual([]);

    const bad = fakeVm({
      scriptOutput: `Enable succeeded:\n[stdout]\nthe proxy config holds neither token ${OLD}\n[stderr]\n`,
    });
    const { external } = build(bad);
    await expect(
      external.apply([item('VM_TOKEN', NEW)], await external.snapshot()),
    ).rejects.toThrow(/holds neither token \*\*\*/);
    expect(readdirSync(path.join(root, 'tmp'))).toEqual([]);
  });

  test('treats a script that did not print its marker as a failure and stops the VM again', async () => {
    const vm = fakeVm({ scriptOutput: 'Enable succeeded:\n[stdout]\n[stderr]\nsomething broke\n' });
    const { external } = build(vm);
    await expect(
      external.apply([item('VM_TOKEN', NEW)], await external.snapshot()),
    ).rejects.toThrow(/did not finish/);
    expect(vm.state.power).toBe('PowerState/deallocated');
  });

  test('refuses a token it could not edit into the config safely, before running anything', async () => {
    const vm = fakeVm();
    const { external } = build(vm);
    const snapshot = await external.snapshot();
    await expect(
      external.apply([item('VM_TOKEN', "bad'token with spaces")], snapshot),
    ).rejects.toThrow(/characters/);
    expect(vm.state.calls.filter((a) => a.join(' ').startsWith('vm start'))).toEqual([]);
  });

  test('retries while the VM agent is not ready yet', async () => {
    const vm = fakeVm({ failFirstRuns: 2 });
    const { external } = build(vm);
    await external.apply([item('VM_TOKEN', NEW)], await external.snapshot());
    expect(vm.state.runs).toBe(3);
    expect(vm.state.accepted).toEqual([OLD, NEW]);
  });

  test('gives up with the reason when the agent never becomes ready', async () => {
    const vm = fakeVm({ failFirstRuns: 99 });
    const { external } = build(vm);
    await expect(
      external.apply([item('VM_TOKEN', NEW)], await external.snapshot()),
    ).rejects.toThrow(/agent is not ready/);
  });

  test('waits until the runner accepts the new token, then checks the old one still works', async () => {
    const vm = fakeVm();
    const { external, probes } = build(vm, {
      probeStatus: (request, n) => {
        if (request.token === NEW) return n < 3 ? 502 : 200;
        return 200;
      },
    });
    await external.apply([item('VM_TOKEN', NEW)], await external.snapshot());
    expect(probes.filter((p) => p.token === NEW).length).toBe(3);
    expect(probes.at(-1).token).toBe(OLD);
    expect(probes[0]).toMatchObject({
      url: 'https://vm.example:2358/api/v2/runtimes',
      header: 'X-Auth-Token',
      ca: 'CA\nPEM',
    });
  });

  test('gives up with the last answer when the runner never accepts the new token', async () => {
    const vm = fakeVm();
    const { external } = build(vm, { probeStatus: () => 401 });
    await expect(
      external.apply([item('VM_TOKEN', NEW)], await external.snapshot()),
    ).rejects.toThrow(/did not accept the new token.*401/s);
  });

  test('fails when the old token stops working during the overlap, because the running app would be turned away', async () => {
    const vm = fakeVm();
    const { external } = build(vm, {
      probeStatus: (request) => (request.token === NEW ? 200 : 401),
    });
    await expect(
      external.apply([item('VM_TOKEN', NEW)], await external.snapshot()),
    ).rejects.toThrow(/stopped accepting the old token/);
  });

  test('restore puts the old token back the same way and checks the new one is refused', async () => {
    const vm = fakeVm();
    const { external, probes } = build(vm);
    const snapshot = await external.snapshot();
    await external.apply([item('VM_TOKEN', NEW)], snapshot);
    vm.state.calls.length = 0;
    probes.length = 0;
    await external.restore(snapshot, [item('VM_TOKEN', NEW)]);
    expect(vm.state.scripts.at(-1)).toContain(`OLD='${NEW}'`);
    expect(vm.state.scripts.at(-1)).toContain(`NEW='${OLD}'`);
    expect(vm.state.accepted).toEqual([OLD]);
    expect(probes.at(-1).token).toBe(NEW);
    expect(existsSync(path.join(root, 'tmp'))).toBe(true);
    expect(readdirSync(path.join(root, 'tmp'))).toEqual([]);
  });

  test('holds the runner on before starting the VM, and lets go only after stopping it', async () => {
    const vm = fakeVm();
    const order = [];
    const run = async (command, args) => {
      order.push(args.slice(0, 2).join(' '));
      return vm.run(command, args);
    };
    const hold = {
      acquire: async () => {
        order.push('hold');
        return { release: async () => order.push('release') };
      },
    };
    const { external } = build(vm, { run, hold });
    await external.apply([item('VM_TOKEN', NEW)], await external.snapshot());
    expect(order.filter((w) => w !== 'vm get-instance-view')).toEqual([
      'hold',
      'vm start',
      'vm run-command',
      'vm deallocate',
      'release',
    ]);
  });

  test('does not start the VM when the hold cannot be taken', async () => {
    const vm = fakeVm();
    const hold = {
      acquire: async () => {
        throw new Error('Could not hold the runner on: the database login failed.');
      },
    };
    const { external } = build(vm, { hold });
    await expect(
      external.apply([item('VM_TOKEN', NEW)], await external.snapshot()),
    ).rejects.toThrow(/hold the runner on/);
    expect(vm.state.calls.filter((a) => a.join(' ').startsWith('vm start'))).toEqual([]);
  });

  test('lets go of the hold when the change fails too', async () => {
    const vm = fakeVm({ scriptOutput: 'Enable succeeded:\n[stdout]\n[stderr]\nbroke' });
    let released = 0;
    const hold = { acquire: async () => ({ release: async () => (released += 1) }) };
    const { external } = build(vm, { hold });
    await expect(
      external.apply([item('VM_TOKEN', NEW)], await external.snapshot()),
    ).rejects.toThrow();
    expect(released).toBe(1);
  });

  test('stops waiting at once when the VM is no longer running, instead of waiting out the timeout', async () => {
    const vm = fakeVm();
    const { external } = build(vm, {
      probeStatus: () => {
        vm.state.power = 'PowerState/deallocated';
        return 502;
      },
    });
    await expect(
      external.apply([item('VM_TOKEN', NEW)], await external.snapshot()),
    ).rejects.toThrow(/no longer running/);
  });

  test('the script proves the token from inside the VM before it reports success', async () => {
    const vm = fakeVm();
    const { external } = build(vm);
    await external.apply([item('VM_TOKEN', NEW)], await external.snapshot());
    const script = vm.state.scripts[0];
    expect(script).toContain('https://localhost:2358/api/v2/runtimes');
    expect(script).toContain('X-Auth-Token: $NEW');
    expect(script).toContain('X-Auth-Token: $OLD');
    expect(script.indexOf('docker restart')).toBeLessThan(script.indexOf('ROTATION_OK'));
    expect(script.indexOf('X-Auth-Token: $NEW')).toBeLessThan(script.indexOf('ROTATION_OK'));
  });

  test('applying insists the VM holds the token it was said to hold, so drift is caught', async () => {
    const vm = fakeVm();
    const { external } = build(vm);
    await external.apply([item('VM_TOKEN', NEW)], await external.snapshot());
    const script = vm.state.scripts[0];
    expect(script).toContain('holds neither the old nor the new token');
  });

  test('finishing insists the VM already holds the new token, so it never retires the old one first', async () => {
    const vm = fakeVm();
    const { external } = build(vm);
    await external.finish([item('VM_TOKEN', NEW)], await external.snapshot());
    const script = vm.state.scripts[0];
    expect(script).toContain("MODE='close'");
    expect(script).toContain('does not hold the new token');
  });

  test('restoring overwrites whatever token is on the VM, because the failed one may be unknown', async () => {
    const vm = fakeVm();
    const { external } = build(vm);
    const snapshot = await external.snapshot();
    await external.restore(snapshot, [item('VM_TOKEN', NEW)]);
    const script = vm.state.scripts.at(-1);
    expect(script).toContain("MODE='restore'");
    expect(script).not.toContain('holds neither the old nor the new token');
    expect(script).toContain(`NEW='${OLD}'`);
  });

  test('the script checks the config has exactly one token check before it edits anything', async () => {
    const vm = fakeVm();
    const { external } = build(vm);
    await external.apply([item('VM_TOKEN', NEW)], await external.snapshot());
    const script = vm.state.scripts[0];
    expect(script.indexOf("grep -c 'http_x_auth_token'")).toBeGreaterThan(-1);
    expect(script.indexOf("grep -c 'http_x_auth_token'")).toBeLessThan(script.indexOf('sed '));
  });

  describe('the script, run in a real shell against a copy of the proxy config', () => {
    const CONF_LINE = (token) => `        if ($http_x_auth_token = "${token}") {`;
    let conf;
    let bin;

    // Stands in for the proxy: answers 200 to a token the config's check lets through.
    const stubs = () => {
      writeFileSync(
        path.join(bin, 'curl'),
        [
          '#!/bin/bash',
          'while [ $# -gt 0 ]; do case "$1" in -H) tok="${2#*: }"; shift;; esac; shift; done',
          'line=$(grep -F \'$http_x_auth_token\' "$CONF_PATH")',
          'if echo "$line" | grep -qE "(\\"|\\(|\\|)$tok(\\"|\\)|\\|)"; then printf 200; else printf 401; fi',
          '',
        ].join('\n'),
        { mode: 0o755 },
      );
      writeFileSync(path.join(bin, 'docker'), '#!/bin/bash\nexit 0\n', { mode: 0o755 });
    };

    const shellBuild = () => {
      const cloud = path.join(root, 'cloud');
      mkdirSync(cloud, { recursive: true });
      writeFileSync(path.join(cloud, 'user-data'), `token ${OLD}\n`);
      const run = async (command, args) => {
        const line = args.join(' ');
        if (line.includes('get-instance-view')) return ok('PowerState/running\n');
        if (line.startsWith('vm run-command invoke')) {
          const file = args.find((a) => a.startsWith('@')).slice(1);
          const { spawnSync } = await import('node:child_process');
          const result = spawnSync('bash', [file], {
            encoding: 'utf8',
            env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, CONF_PATH: conf },
          });
          return ok(`${result.stdout}${result.stderr}`);
        }
        return ok();
      };
      const shellConfig = {
        ...config,
        onVm: { ...config.onVm, confFile: conf, scrubDirs: [cloud] },
      };
      const external = createVmTokenExternal({
        config: shellConfig,
        root,
        run,
        probe: async ({ token }) => {
          const text = readFileSync(conf, 'utf8');
          return new RegExp(`["(|]${token}["|)]`).test(text) ? 200 : 401;
        },
        current: (key) => ({ VM_URL: 'https://vm.example:2358', VM_CA_CERT: '' })[key],
        paramsDir: path.join(root, 'tmp'),
        sleep: async () => {},
      });
      return { external, cloud };
    };

    beforeEach(() => {
      conf = path.join(root, 'nginx.conf');
      bin = path.join(root, 'bin');
      mkdirSync(bin);
      writeFileSync(
        conf,
        [
          'server {',
          '    location / {',
          '        set $auth_ok 0;',
          CONF_LINE(OLD),
          '            set $auth_ok 1;',
          '        }',
          '    }',
          '}',
          '',
        ].join('\n'),
      );
      stubs();
    });

    const gateLines = () =>
      readFileSync(conf, 'utf8')
        .split('\n')
        .filter((l) => l.includes('$http_x_auth_token'));

    test('applying leaves exactly one token check that lets both tokens through', async () => {
      const { external } = shellBuild();
      await external.apply([item('VM_TOKEN', NEW)], await external.snapshot());
      const lines = gateLines();
      expect(lines).toHaveLength(1);
      expect(lines[0]).toContain(OLD);
      expect(lines[0]).toContain(NEW);
      expect(readFileSync(conf, 'utf8')).toContain('set $auth_ok 1;');
    });

    test('finishing leaves exactly one token check that only lets the new token through', async () => {
      const { external, cloud } = shellBuild();
      const snapshot = await external.snapshot();
      await external.apply([item('VM_TOKEN', NEW)], snapshot);
      await external.finish([item('VM_TOKEN', NEW)], snapshot);
      expect(gateLines()).toEqual([CONF_LINE(NEW)]);
      expect(readFileSync(path.join(cloud, 'user-data'), 'utf8')).not.toContain(OLD);
    });

    test('restoring from the overlap puts the single old token check back', async () => {
      const { external } = shellBuild();
      const snapshot = await external.snapshot();
      await external.apply([item('VM_TOKEN', NEW)], snapshot);
      await external.restore(snapshot, [item('VM_TOKEN', NEW)]);
      expect(gateLines()).toEqual([CONF_LINE(OLD)]);
    });

    test('restoring after the old token was retired puts the single old token check back', async () => {
      const { external } = shellBuild();
      const snapshot = await external.snapshot();
      await external.apply([item('VM_TOKEN', NEW)], snapshot);
      await external.finish([item('VM_TOKEN', NEW)], snapshot);
      await external.restore(snapshot, [item('VM_TOKEN', NEW)]);
      expect(gateLines()).toEqual([CONF_LINE(OLD)]);
    });

    test('applying again after an interrupted run works, and finishing refuses a config that never got the new token', async () => {
      const { external } = shellBuild();
      const snapshot = await external.snapshot();
      await external.apply([item('VM_TOKEN', NEW)], snapshot);
      await external.apply([item('VM_TOKEN', NEW)], snapshot);
      expect(gateLines()).toHaveLength(1);

      writeFileSync(
        conf,
        readFileSync(conf, 'utf8').replace(/.*http_x_auth_token.*/, CONF_LINE(OLD)),
      );
      await expect(external.finish([item('VM_TOKEN', NEW)], snapshot)).rejects.toThrow(
        /does not hold the new token/,
      );
      expect(gateLines()).toEqual([CONF_LINE(OLD)]);
    });
  });
});
