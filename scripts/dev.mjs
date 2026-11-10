// Runs the API and the Vite dev server together, with labelled output, and
// stops both when either exits or you press Ctrl+C. No extra dependency needed.
import { spawn } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [
  ['api', ['run', 'dev', '--prefix', 'backend']],
  ['web', ['run', 'dev', '--prefix', 'frontend']],
].map(([name, args]) => {
  const child = spawn(npm, args, { stdio: ['inherit', 'pipe', 'pipe'], shell: process.platform === 'win32' });
  const label = (stream, out) => stream.on('data', (chunk) => {
    for (const line of chunk.toString().split('\n')) if (line.trim()) out.write(`[${name}] ${line}\n`);
  });
  label(child.stdout, process.stdout);
  label(child.stderr, process.stderr);
  child.on('exit', (code) => stop(code ?? 0));
  return child;
});

let stopping = false;
function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exit(code);
}
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
