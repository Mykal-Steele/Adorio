import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { parseEnvValue } from '../envfile.mjs';
import { redact, secureDelete, withRetry } from '../safety.mjs';
import { defaultRun } from '../cloud.mjs';

// A VM behind a proxy that checks a token header. The token cannot be changed through a
// redeploy: Azure refuses to change a VM's customData once it exists. So the token is
// edited on the running VM through run-command, in the proxy config the container mounts,
// and the proxy is restarted. The old token is kept in the snapshot so a failed rotation
// can put it back. A reimage or a recreate resets the VM to the token it was created with,
// which is why a deploy file that lists the current token has to stay in step.
//
// The app that calls the VM keeps the old token until its own secret is updated and it
// restarts, so the change is made in two steps. `apply` makes the proxy accept both tokens.
// `finish` runs after the app is on the new one and leaves only the new token. Swapping the
// token in one step would turn the app away for the minute in between.
//
// Whatever else manages this VM may switch it off when it looks idle, so the optional
// `hold` keeps it on for the length of the change.
const POWER_QUERY = "instanceView.statuses[?starts_with(code,'PowerState/')].code | [0]";
const LONG_COMMAND_MS = 20 * 60_000;
const POLL_MS = 10_000;
const SAFE_TOKEN = /^[A-Za-z0-9_-]{16,}$/;
const AGENT_NOT_READY =
  /VMAgent|agent is not ready|Conflict|another operation|temporarily|timed out/i;
const realSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function httpsProbe({ url, token, header, ca }) {
  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      { method: 'GET', headers: { [header]: token }, ca, timeout: 10_000 },
      (response) => {
        response.resume();
        resolve(response.statusCode);
      },
    );
    request.on('timeout', () => request.destroy(new Error('timed out')));
    request.on('error', reject);
    request.end();
  });
}

export function createVmTokenExternal({
  config,
  root,
  current,
  paramsDir,
  hold,
  run = defaultRun,
  probe = httpsProbe,
  sleep = realSleep,
}) {
  const absolute = (relative) => path.join(root, relative);
  const { confFile, container, port, scrubDirs = [] } = config.onVm;
  const gate = `http_${config.tokenHeader.toLowerCase().replace(/-/g, '_')}`;
  const loopback = `https://localhost:${port}${config.probePath}`;

  async function az(args, secrets = []) {
    const result = await run('az', args, { timeoutMs: LONG_COMMAND_MS });
    if (result.code !== 0) {
      const text = (result.stderr || result.stdout || `az exited with code ${result.code}`).trim();
      throw new Error(redact(text, secrets).split('\n').slice(-6).join('\n'));
    }
    return result;
  }

  // The edit, as a shell script that runs on the VM. It has three modes:
  //   open     the proxy accepts both tokens (the old one is the first, the new one the second)
  //   close    the proxy accepts only the new token
  //   restore  the proxy accepts only the token given as new
  // Open and close insist the config holds what they expect (so drift is caught), restore
  // overwrites whatever is there because the token being taken off may not be known. The
  // token check line is rewritten in place, as the only line that changes, and the file is
  // rewritten in place, not replaced, because the container bind-mounts that one file and
  // would otherwise keep reading the old one. Boot-time copies of the old token are scrubbed
  // when it is retired. The script only reports success after the proxy restarted and
  // answered as the mode says, checked from inside the VM so it does not depend on the
  // network path.
  const scriptFor = (from, to, mode) => {
    const rejectsOld = mode !== 'open';
    return [
      'set -eu',
      `MODE='${mode}'`,
      `OLD='${from}'`,
      `NEW='${to}'`,
      `CONF='${confFile}'`,
      `GATE='$${gate}'`,
      `if [ "$(grep -c '${gate}' "$CONF")" != 1 ]; then echo "the proxy config does not have exactly one token check"; exit 3; fi`,
      'LINE=$(grep -nF "$GATE" "$CONF" | cut -d: -f1)',
      'CURRENT=$(sed -n "${LINE}p" "$CONF")',
      ...(mode === 'open'
        ? [
            'if ! printf %s "$CURRENT" | grep -qF -e "$OLD" -e "$NEW"; then',
            '  echo "the proxy config holds neither the old nor the new token"',
            '  exit 3',
            'fi',
            'COND="~ \\"^($OLD|$NEW)\\$\\""',
          ]
        : mode === 'close'
          ? [
              'if ! printf %s "$CURRENT" | grep -qF "$NEW"; then',
              '  echo "the proxy config does not hold the new token"',
              '  exit 3',
              'fi',
              'COND="= \\"$NEW\\""',
            ]
          : ['COND="= \\"$NEW\\""']),
      'awk -v n="$LINE" -v g="$GATE" -v c="$COND" \'NR == n { print "        if (" g " " c ") {"; next } { print }\' "$CONF" > /tmp/nginx.conf.rotating',
      'cat /tmp/nginx.conf.rotating > "$CONF"',
      'rm -f /tmp/nginx.conf.rotating',
      ...(rejectsOld
        ? scrubDirs.map(
            (dir) =>
              `grep -rlF "$OLD" ${dir} 2>/dev/null | while read -r f; do sed -i "s|$OLD|$NEW|g" "$f"; done || true`,
          )
        : []),
      `docker restart ${container} >/dev/null`,
      `URL='${loopback}'`,
      'code=000',
      'for i in $(seq 1 60); do',
      `  code=$(curl -sk -o /dev/null -w '%{http_code}' -H "${config.tokenHeader}: $NEW" "$URL" || true)`,
      '  [ "$code" = 200 ] && break',
      '  sleep 2',
      'done',
      '[ "$code" = 200 ] || { echo "the runner did not accept the target token (answer $code)"; exit 4; }',
      `old=$(curl -sk -o /dev/null -w '%{http_code}' -H "${config.tokenHeader}: $OLD" "$URL" || true)`,
      ...(rejectsOld
        ? [
            'if [ "$OLD" != "$NEW" ]; then',
            '  [ "$old" = 401 ] || { echo "the runner still accepts the replaced token (answer $old)"; exit 5; }',
            'fi',
          ]
        : [
            '[ "$old" = 200 ] || { echo "the runner stopped accepting the old token (answer $old)"; exit 5; }',
          ]),
      'echo ROTATION_OK',
      '',
    ].join('\n');
  };

  // The tokens go to the VM in a file only this user can read, never on a command line.
  async function runOnVm(snapshot, from, to, mode) {
    const dir = mkdtempSync(path.join(paramsDir, 'vm-'));
    const file = path.join(dir, 'change-token.sh');
    try {
      writeFileSync(file, scriptFor(from, to, mode), { mode: 0o600 });
      const output = await withRetry(
        async () => {
          const { stdout } = await az(
            [
              'vm',
              'run-command',
              'invoke',
              '-g',
              snapshot.resourceGroup,
              '-n',
              config.vmName,
              '--command-id',
              'RunShellScript',
              '--scripts',
              `@${file}`,
              '--query',
              'value[0].message',
              '-o',
              'tsv',
            ],
            [from, to],
          );
          return stdout;
        },
        {
          tries: 6,
          baseMs: 10_000,
          sleep,
          retryIf: (error) => AGENT_NOT_READY.test(error.message),
        },
      );
      if (!output.includes('ROTATION_OK')) {
        const tail = redact(output, [from, to]).trim().split('\n').slice(-6).join('\n');
        throw new Error(`The change on the VM did not finish: ${tail}`);
      }
    } finally {
      try {
        secureDelete(file);
      } catch {}
      rmSync(dir, { recursive: true, force: true });
    }
  }

  async function stillRunning(snapshot) {
    const { stdout } = await az([
      'vm',
      'get-instance-view',
      '-g',
      snapshot.resourceGroup,
      '-n',
      config.vmName,
      '--query',
      POWER_QUERY,
      '-o',
      'tsv',
    ]);
    return stdout.trim() === 'PowerState/running';
  }

  // The same proof from outside, through the real address and certificate. It gives up the
  // moment the VM is no longer running instead of waiting out the whole timeout.
  async function waitAccepted(snapshot, token, label) {
    const url = `${current(config.urlKey)}${config.probePath}`;
    const ca = (current(config.caKey) ?? '').replace(/\\n/g, '\n');
    const deadline = Date.now() + config.readyTimeoutMinutes * 60_000;
    let last = 'no answer';
    for (;;) {
      try {
        const status = await probe({ url, token, header: config.tokenHeader, ca });
        last = String(status);
        if (status >= 200 && status < 300) return;
      } catch {
        last = 'no answer';
      }
      if (!(await stillRunning(snapshot))) {
        throw new Error('The VM is no longer running, so it cannot answer. Something stopped it.');
      }
      if (Date.now() >= deadline) break;
      await sleep(POLL_MS);
    }
    throw new Error(
      `The code runner did not accept the ${label} token within ${config.readyTimeoutMinutes} minutes. Last answer: ${last}.`,
    );
  }

  // A token is only revoked once the runner refuses it, so this checks instead of assuming.
  async function expectRejected(token, label) {
    const url = `${current(config.urlKey)}${config.probePath}`;
    const ca = (current(config.caKey) ?? '').replace(/\\n/g, '\n');
    let last = 'no answer';
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const status = await probe({ url, token, header: config.tokenHeader, ca });
        last = String(status);
        if (status === 401 || status === 403) return;
      } catch {
        last = 'no answer';
      }
      await sleep(3000);
    }
    throw new Error(
      last === 'no answer'
        ? `Could not confirm that the runner refuses the ${label} token.`
        : `The code runner still accepts the ${label} token (answer ${last}).`,
    );
  }

  // The caller is still using this token, so the runner has to keep accepting it.
  async function expectAccepted(token, label) {
    const url = `${current(config.urlKey)}${config.probePath}`;
    const ca = (current(config.caKey) ?? '').replace(/\\n/g, '\n');
    let last = 'no answer';
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const status = await probe({ url, token, header: config.tokenHeader, ca });
        last = String(status);
        if (status >= 200 && status < 300) return;
      } catch {
        last = 'no answer';
      }
      await sleep(3000);
    }
    throw new Error(`The code runner stopped accepting the ${label} token (answer ${last}).`);
  }

  // Holds the VM on, starts it if it was stopped, changes the token, proves it, then stops
  // the VM again if it was stopped and lets go of the hold, so everything is left as it was
  // found. In `open` mode the old token has to keep working, otherwise it has to be refused.
  async function setToken(snapshot, from, to, { mode, accepted, retired }) {
    if (!SAFE_TOKEN.test(from) || !SAFE_TOKEN.test(to)) {
      throw new Error(
        'A token has characters that cannot be edited into the proxy config safely. Use letters, digits, - and _, at least 16 of them.',
      );
    }
    const target = ['-g', snapshot.resourceGroup, '-n', config.vmName];
    const stopped = snapshot.power !== 'running';
    const held = hold ? await hold.acquire() : undefined;
    try {
      if (stopped) await az(['vm', 'start', ...target]);
      await runOnVm(snapshot, from, to, mode);
      await waitAccepted(snapshot, to, accepted);
      if (mode === 'open') await expectAccepted(from, retired);
      else await expectRejected(from, retired);
    } finally {
      if (stopped) await az(['vm', 'deallocate', ...target]).catch(() => {});
      await held?.release().catch(() => {});
    }
  }

  return {
    id: config.id,
    label: config.label,
    finishLabel: config.finishLabel ?? 'Retiring the old token on the VM',

    applies: (items) =>
      items.some((item) => item.key === config.tokenKey && item.status === 'changed'),

    // The token the VM has now comes from the deploy file, not from the env file the app
    // reads, because the two can drift apart and the VM is what a rollback has to match.
    async snapshot() {
      const text = readFileSync(absolute(config.deployEnv), 'utf8');
      const keys = config.deployEnvKeys;
      const values = Object.fromEntries(
        Object.entries(keys).map(([name, key]) => [name, parseEnvValue(text, key)]),
      );
      const missing = Object.entries(keys)
        .filter(([name]) => !values[name])
        .map(([, key]) => key);
      if (missing.length) throw new Error(`${config.deployEnv} is missing ${missing.join(', ')}.`);
      const { stdout } = await az([
        'vm',
        'get-instance-view',
        '-g',
        values.resourceGroup,
        '-n',
        config.vmName,
        '--query',
        POWER_QUERY,
        '-o',
        'tsv',
      ]);
      return {
        token: values.token,
        resourceGroup: values.resourceGroup,
        power: stdout.trim().replace('PowerState/', '') || 'unknown',
      };
    },

    async apply(items, snapshot) {
      const { value } = items.find((item) => item.key === config.tokenKey);
      await setToken(snapshot, snapshot.token, value, {
        mode: 'open',
        accepted: 'new',
        retired: 'old',
      });
    },

    async finish(items, snapshot) {
      const { value } = items.find((item) => item.key === config.tokenKey);
      await setToken(snapshot, snapshot.token, value, {
        mode: 'close',
        accepted: 'new',
        retired: 'old',
      });
    },

    // Makes the VM accept both tokens again, whichever of the two states it is in. Used
    // before the app goes back to the old token, so it is not turned away meanwhile.
    async reopen(snapshot, items) {
      const value = items?.find((item) => item.key === config.tokenKey)?.value;
      if (!value) throw new Error('The new token is not known, so the VM cannot accept it too.');
      await setToken(snapshot, snapshot.token, value, {
        mode: 'open',
        accepted: 'new',
        retired: 'old',
      });
    },

    async restore(snapshot, items) {
      const failed = items?.find((item) => item.key === config.tokenKey)?.value;
      if (!failed)
        throw new Error(
          'The token that has to be taken off the VM is not known, so it cannot be restored.',
        );
      await setToken(snapshot, failed, snapshot.token, {
        mode: 'restore',
        accepted: 'old',
        retired: 'new',
      });
    },
  };
}
