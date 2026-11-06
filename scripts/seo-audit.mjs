import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dist = path.join(root, 'dist');
const failures = /** @type {{ category: string; message: string }[]} */ ([]);

function fail(category, message) {
  failures.push({ category, message });
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', stdio: 'pipe', cwd: root, ...opts });
  const status = r.status != null ? r.status : r.error ? 1 : 0;
  return { status, stdout: r.stdout ?? '', stderr: r.stderr ?? '', error: r.error };
}

/** npm/npx are .cmd shims on Windows; spawning them with shell:false can EINVAL. */
function runNpmRun(script) {
  if (process.platform === 'win32') {
    return run('cmd.exe', ['/d', '/s', '/c', `npm run ${script}`]);
  }
  return run('npm', ['run', script]);
}

function runNpx(args) {
  if (process.platform === 'win32') {
    const q = args.map((a) => (/\s/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a)).join(' ');
    return run('cmd.exe', ['/d', '/s', '/c', `npx ${q}`]);
  }
  return run('npx', args);
}

function walkFiles(dir, ext, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkFiles(full, ext, out);
    else if (name.endsWith(ext)) out.push(full);
  }
  return out;
}

function firstCapture(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : undefined;
}

function isRedirectStub(html) {
  return (
    /<meta[^>]+http-equiv=["']refresh["']/i.test(html) &&
    /<link[^>]+rel=["']canonical["']/i.test(html) &&
    !/<meta[^>]+property=["']og:title["']/i.test(html)
  );
}

function hasNoindex(html) {
  const m = html.match(/<meta[^>]+name=["']robots["'][^>]*>/i);
  return m ? /noindex/i.test(m[0]) : false;
}

function htmlPathToUrlPath(relFromDist) {
  const r = relFromDist.replace(/\\/g, '/');
  if (r === 'index.html') return '/';
  return `/${r.replace(/\/index\.html$/, '/')}`;
}

function resolveInternalHref(href) {
  try {
    const u = new URL(href, 'https://borderlandscheats.com');
    if (u.hostname !== 'borderlandscheats.com') return null;
    let p = u.pathname;
    if (p !== '/' && !p.endsWith('/')) p = `${p}/`;
    return p + u.hash;
  } catch {
    return null;
  }
}

function pathToDistFile(urlPath) {
  if (urlPath.includes('#')) urlPath = urlPath.split('#')[0];
  if (!urlPath.startsWith('/')) urlPath = `/${urlPath}`;
  if (urlPath === '/') return path.join(dist, 'index.html');
  return path.join(dist, urlPath.replace(/^\//, ''), 'index.html');
}

/** --- 1) Build + existing verifiers --- */
console.log('SEO audit: running npm run build…');
const build = runNpmRun('build');
if (build.status !== 0) {
  console.error(build.error || build.stderr || build.stdout);
  fail('build', `npm run build failed (exit ${build.status})`);
  printFailures();
  process.exit(1);
}

console.log('SEO audit: running verify-seo.mjs…');
const v1 = run(process.execPath, [path.join(root, 'scripts', 'verify-seo.mjs')]);
if (v1.status !== 0) {
  console.error(v1.stderr || v1.stdout);
  fail('technical_seo', 'verify-seo.mjs failed');
}

console.log('SEO audit: running verify-redirects.mjs…');
const v2 = run(process.execPath, [path.join(root, 'scripts', 'verify-redirects.mjs')]);
if (v2.status !== 0) {
  console.error(v2.stderr || v2.stdout);
  fail('links_redirects', 'verify-redirects.mjs failed');
}

console.log('SEO audit: running astro check…');
const check = runNpx(['astro', 'check']);
if (check.status !== 0) {
  console.error(check.error || check.stderr || check.stdout);
  fail('build', 'astro check failed');
}

/** --- Keyword map --- */
const keywordMapPath = path.join(root, 'src', 'data', 'keyword-map.json');
if (!fs.existsSync(keywordMapPath)) {
  fail('keyword_usage', 'Missing src/data/keyword-map.json');
} else {
  try {
    const km = JSON.parse(fs.readFileSync(keywordMapPath, 'utf8'));
    const primaries = Object.values(km).map((/** @type {*} */ e) => e.primary?.toLowerCase().trim());
    const seen = new Map();
    for (const p of primaries) {
      if (!p) continue;
      if (seen.has(p)) fail('keyword_usage', `Duplicate primary keyword in map: "${p}"`);
      seen.set(p, true);
    }
  } catch (e) {
    fail('keyword_usage', `keyword-map.json invalid: ${e}`);
  }
}

/** --- Crawl HTML --- */
const htmlFiles = walkFiles(dist, '.html');
const indexedPages = [];
const siteHost = 'borderlandscheats.com';

for (const file of htmlFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const rel = path.relative(dist, file).replace(/\\/g, '/');
  if (rel === '404.html') continue;
  if (isRedirectStub(raw) || hasNoindex(raw)) continue;
  indexedPages.push({ file, rel, raw, urlPath: htmlPathToUrlPath(rel) });
}

const internalTargets = new Map();
for (const p of indexedPages) {
  internalTargets.set(p.urlPath, p.file);
}

/** Internal link resolution */
for (const p of indexedPages) {
  const { raw, rel, urlPath } = p;

  if (/#|javascript:|mailto:/i.test(raw) && /href=["']#/i.test(raw)) {
    const bad = [...raw.matchAll(/href=["']([#][^"']*|javascript:[^"']*)["']/gi)];
    for (const m of bad) {
      if (m[1].startsWith('#')) continue;
      fail('links_redirects', `${rel}: placeholder href ${m[1]}`);
    }
  }

  const links = [...raw.matchAll(/<a[^>]+href=["']([^"']*)["']/gi)];
  for (const [, href] of links) {
    if (!href || href.startsWith('mailto:')) continue;
    if (href.startsWith('javascript:')) {
      fail('links_redirects', `${rel}: javascript: href`);
      continue;
    }
    if (href.startsWith('/go/')) {
      if (!href.endsWith('/')) {
        fail('links_redirects', `${rel}: /go/ link should use trailing slash: ${href}`);
      }
      continue;
    }
    if (href.startsWith('http://') || href.startsWith('https://')) {
      let u;
      try {
        u = new URL(href);
      } catch {
        fail('links_redirects', `${rel}: invalid URL ${href}`);
        continue;
      }
      if (u.hostname === siteHost || u.hostname === `www.${siteHost}`) {
        fail('links_redirects', `${rel}: use relative URL instead of ${href}`);
        continue;
      }
      if (u.protocol !== 'https:') {
        fail('links_redirects', `${rel}: external link must be HTTPS: ${href}`);
      }
      const relAttr = /<a[^>]+href=["'][^"']*["'][^>]*>/i.exec(raw);
      /** Simple check: sponsored outbound (non-site) — warn if zadeyo without noopener */
      if (u.hostname.includes('zadeyo') || u.hostname.includes('googletagmanager')) {
        /* skip GA loader */
      }
      continue;
    }
    if (href.startsWith('#')) {
      const id = href.slice(1);
      if (id && !new RegExp(`id=["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`).test(raw)) {
        fail('links_redirects', `${rel}: fragment #${id} may be missing target id`);
      }
      continue;
    }
    const resolved = href.startsWith('/') ? href : new URL(href, `https://borderlandscheats.com${urlPath}`).pathname;
    let pathOnly = resolved.split('#')[0];
    if (!pathOnly.startsWith('/')) pathOnly = `/${pathOnly}`;
    if (pathOnly !== '/' && !pathOnly.endsWith('/')) {
      fail('links_redirects', `${rel}: internal href missing trailing slash: ${href}`);
      continue;
    }
    const distFile = pathToDistFile(pathOnly);
    if (!fs.existsSync(distFile)) {
      fail('links_redirects', `${rel}: broken internal link ${href} → missing ${path.relative(root, distFile)}`);
    }
  }
}

/** Title / description length (approximate char counts) */
for (const p of indexedPages) {
  const { raw, rel } = p;
  const title = firstCapture(raw, /<title>([^<]*)<\/title>/i) ?? '';
  const desc = firstCapture(raw, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ?? '';
  const tLen = title.length;
  const dLen = desc.length;
  if (tLen < 45 || tLen > 62) fail('technical_seo', `${rel}: title length ${tLen} (want ~50–60): "${title.slice(0, 80)}…"`);
  if (dLen < 135 || dLen > 165) fail('technical_seo', `${rel}: meta description length ${dLen} (want ~140–160)`);

  const h1 = (raw.match(/<h1\b/gi) ?? []).length;
  if (h1 !== 1) fail('technical_seo', `${rel}: expected 1 <h1>, found ${h1}`);

  const headings = [...raw.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  let prev = 0;
  for (const h of headings) {
    if (prev === 0) {
      if (h !== 1) fail('technical_seo', `${rel}: first heading is h${h}, expected h1`);
    } else if (h > prev + 1) {
      fail('technical_seo', `${rel}: skipped heading level (h${prev} → h${h})`);
    }
    prev = h;
  }

  if (/<link[^>]+hreflang=/i.test(raw)) fail('technical_seo', `${rel}: hreflang must not be present`);

  /** JSON-LD */
  const blocks = [...raw.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [, json] of blocks) {
    try {
      JSON.parse(json.trim());
    } catch (e) {
      fail('technical_seo', `${rel}: invalid JSON-LD: ${e}`);
    }
  }
}

/** Sitemap URLs ⊆ indexed */
const smPath = path.join(dist, 'sitemap.xml');
if (fs.existsSync(smPath)) {
  const sm = fs.readFileSync(smPath, 'utf8');
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const loc of locs) {
    let u;
    try {
      u = new URL(loc);
    } catch {
      fail('sitemap', `Bad loc: ${loc}`);
      continue;
    }
    if (u.search) fail('sitemap', `Sitemap loc must not have query: ${loc}`);
    let p = u.pathname;
    if (p !== '/' && !p.endsWith('/')) p = `${p}/`;
    if (!internalTargets.has(p)) {
      fail('sitemap', `Sitemap loc not built as indexable page: ${loc}`);
    }
  }
}

/** Images in dist */
for (const p of indexedPages) {
  const imgs = [...p.raw.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
  for (const [, src] of imgs) {
    if (src.startsWith('data:')) continue;
    if (src.startsWith('http')) {
      fail('images_media', `${p.rel}: remote img src (use local): ${src}`);
      continue;
    }
    const filePath = path.join(dist, src.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) fail('images_media', `${p.rel}: missing image ${src}`);
  }
}

/** Repo grep: TODO / lorem */
const srcFiles = walkFiles(path.join(root, 'src'), '.mdx').concat(walkFiles(path.join(root, 'src'), '.astro'));
for (const f of srcFiles) {
  const c = fs.readFileSync(f, 'utf8');
  if (/\bTODO\b|\blorem ipsum\b/i.test(c)) {
    fail('content_hygiene', `${path.relative(root, f)}: TODO or lorem ipsum`);
  }
}

if (/\bAFFILIATE_LINK_PLACEHOLDER\b/.test(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))) {
  /* unlikely */
}

/** Pretty print */
function printFailures() {
  if (failures.length === 0) {
    console.log('\nSEO audit: PASS (0 issues).\n');
    return;
  }
  const byCat = new Map();
  for (const f of failures) {
    if (!byCat.has(f.category)) byCat.set(f.category, []);
    byCat.get(f.category).push(f.message);
  }
  console.error('\nSEO audit: FAIL\n');
  for (const [cat, msgs] of byCat) {
    console.error(`\n## ${cat}\n`);
    for (const m of msgs) console.error(`  - ${m}`);
  }
  console.error(`\nTotal: ${failures.length} issue(s)\n`);
}

printFailures();
process.exit(failures.length > 0 ? 1 : 0);
