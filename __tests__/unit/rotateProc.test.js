import { createRunner } from '../../scripts/lib/proc.mjs';

describe('createRunner', () => {
  const run = createRunner();

  test('captures stdout, stderr and the exit code without throwing', async () => {
    const result = await run('node', [
      '-e',
      'console.log("out");console.error("err");process.exit(3)',
    ]);
    expect(result).toEqual({ code: 3, stdout: 'out\n', stderr: 'err\n' });
  });

  test('sends input on stdin', async () => {
    const result = await run('node', ['-e', 'process.stdin.pipe(process.stdout)'], {
      input: 'secret-value',
    });
    expect(result.stdout).toBe('secret-value');
  });

  test('reports a missing program as code 127 with a readable message', async () => {
    const result = await run('definitely-not-a-real-program-xyz', []);
    expect(result.code).toBe(127);
    expect(result.stderr).toMatch(/not installed/);
  });

  test('kills a program that runs too long and reports code 124', async () => {
    const result = await run('node', ['-e', 'setTimeout(() => {}, 10000)'], { timeoutMs: 200 });
    expect(result.code).toBe(124);
    expect(result.stderr).toMatch(/timed out/);
  });

  test('with background it returns when the program exits even if a child it started keeps running', async () => {
    const started = Date.now();
    const result = await run('sh', ['-c', 'sleep 5 & exit 0'], { background: true });
    expect(result.code).toBe(0);
    expect(Date.now() - started).toBeLessThan(2000);
  });

  test('with background it still sends input and reports the exit code', async () => {
    const result = await run('sh', ['-c', 'cat > /dev/null; exit 4'], {
      background: true,
      input: 'x',
    });
    expect(result.code).toBe(4);
  });

  test('with background a missing program is still code 127', async () => {
    const result = await run('definitely-not-a-real-program-xyz', [], { background: true });
    expect(result.code).toBe(127);
  });

  test('adds extra environment variables and keeps the rest', async () => {
    const result = await run(
      'node',
      ['-e', 'console.log(process.env.FOO_TEST + ":" + Boolean(process.env.PATH))'],
      {
        env: { FOO_TEST: 'bar' },
      },
    );
    expect(result.stdout).toBe('bar:true\n');
  });
});
