import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const redirectsPath = path.join(root, 'public', '_redirects');
const errors = [];

if (!fs.existsSync(redirectsPath)) {
  console.error('verify-redirects: public/_redirects missing');
  process.exit(1);
}

const raw = fs.readFileSync(redirectsPath, 'utf8');
const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

const seenSources = new Set();
for (const line of lines) {
  if (line.startsWith('#')) continue;
  const parts = line.split(/\s+/);
  if (parts.length < 3) {
    errors.push(`Invalid redirect line (need from, to, code): ${line}`);
    continue;
  }
  const [from, to, code] = parts;
  if (code !== '301') errors.push(`Expected 301 for: ${line}`);
  const isHostRule = /^https?:\/\//i.test(from);
  if (!from.startsWith('/') && !isHostRule) errors.push(`Source must be path or full URL: ${line}`);
  if (seenSources.has(from)) errors.push(`Duplicate redirect source: ${from}`);
  seenSources.add(from);
  if (to.includes(':splat')) {
    if (!/www\.borderlandscheats\.com/i.test(from)) {
      errors.push(`Host redirect must match www.borderlandscheats.com: ${line}`);
    }
  } else if (from.startsWith('/go/')) {
    if (!/^https:\/\/zadeyo\.com\//i.test(to)) {
      errors.push(`/go/ redirects must target https://zadeyo.com/... (affiliate single-hop): ${line}`);
    }
  } else if (!to.startsWith('https://borderlandscheats.com/') && !to.startsWith('/')) {
    errors.push(`Target must be absolute apex URL or path: ${line}`);
  }
}

const needsWww = lines.some((l) => l.includes('www.borderlandscheats.com') && l.includes('301'));
if (!needsWww) errors.push('Must include www → apex 301 redirect');

if (errors.length > 0) {
  console.error('verify-redirects failed:\n' + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(`verify-redirects: OK (${seenSources.size} redirect rules).`);
