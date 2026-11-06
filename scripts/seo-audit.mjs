/**
 * Full SEO / structural audit: build, verify scripts, static HTML crawl, then
 * Playwright (layout) + Lighthouse (perf / a11y / SEO / best-practices) against dist via scripts/serve.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { spawnSync, spawn } from 'node:child_process';
import lighthouse, { desktopConfig } from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const root = process.cwd();
const dist = path.join(root, 'dist');
const failures = /** @type {{ category: string; message: string }[]} */ ([]);
const AUDIT_PORT = process.env.SEO_AUDIT_PORT || '14173';
const BASE_URL = `http://127.0.0.1:${AUDIT_PORT}`;
const SITE_HOST = 'borderlandscheats.com';
const LH_MIN = 0.95;
const SCREENSHOT_WIDTHS = new Set([375, 768, 1024, 1440]);

/** Destinations linked from header + footer on every page (IA BFS hub edges). Keep in sync with Header/Footer. */
const IA_HUB_DESTINATIONS = [
  '/borderlands-3-aimbot/',
  '/borderlands-3-esp/',
  '/borderlands-3-pricing/',
  '/cloud-dma-borderlands-3/',
  '/borderlands-3-cheats-setup/',
  '/support/',
  '/faq/',
  '/about/',
  '/privacy/',
  '/terms/',
];

function fail(category, message) {
  failures.push({ category, message });
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', stdio: 'pipe', cwd: root, ...opts });
  const status = r.status != null ? r.status : r.error ? 1 : 0;
  return { status, stdout: r.stdout ?? '', stderr: r.stderr ?? '', error: r.error };
}

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

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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

function pathToDistFile(urlPath) {
  if (urlPath.includes('#')) urlPath = urlPath.split('#')[0];
  if (!urlPath.startsWith('/')) urlPath = `/${urlPath}`;
  if (urlPath === '/') return path.join(dist, 'index.html');
  return path.join(dist, urlPath.replace(/^\//, ''), 'index.html');
}

function parseRel(relAttr) {
  if (!relAttr) return [];
  return relAttr
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function relIncludes(relList, token) {
  return relList.includes(token.toLowerCase());
}

/** Collect id="..." across all indexed pages for cross-page fragment resolution. */
function buildGlobalIds(indexedPages) {
  const ids = new Set();
  const re = /\bid=["']([^"']+)["']/gi;
  for (const p of indexedPages) {
    let m;
    while ((m = re.exec(p.raw)) !== null) ids.add(m[1]);
  }
  return ids;
}

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

function waitForServer(url, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    function ping() {
      const u = new URL(url);
      const req = http.request(
        { hostname: u.hostname, port: u.port, path: u.pathname || '/', method: 'HEAD', timeout: 3000 },
        (res) => {
          res.resume();
          resolve();
        },
      );
      req.on('error', () => {
        if (Date.now() > deadline) reject(new Error(`Server did not respond at ${url}`));
        else setTimeout(ping, 250);
      });
      req.on('timeout', () => {
        req.destroy();
        if (Date.now() > deadline) reject(new Error(`Server timeout at ${url}`));
        else setTimeout(ping, 250);
      });
      req.end();
    }
    ping();
  });
}

function slugForAuditPath(urlPath) {
  const s = urlPath === '/' ? 'index' : urlPath.replace(/^\/|\/$/g, '').replace(/\//g, '__');
  return s.replace(/[^a-z0-9_-]/gi, '_');
}

/**
 * Horizontal overflow at 320/375/768/1024/1440; PNG screenshots at 375/768/1024/1440 → audit-artifacts/viewports/
 */
async function runPlaywrightLayoutAudit(indexedPages) {
  const { chromium } = await import('playwright');
  const overflowWidths = [320, 375, 768, 1024, 1440];
  const shotRoot = path.join(root, 'audit-artifacts', 'viewports');
  fs.mkdirSync(shotRoot, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    for (const { urlPath } of indexedPages) {
      const pathPart = urlPath === '/' ? '/' : urlPath;
      const fullUrl = `${BASE_URL}${pathPart}`;
      const fileSlug = slugForAuditPath(urlPath);
      for (const w of overflowWidths) {
        const context = await browser.newContext({ viewport: { width: w, height: Math.min(900, w + 400) } });
        const page = await context.newPage();
        try {
          await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 45000 });
          const overflow = await page.evaluate(() => {
            const el = document.documentElement;
            const body = document.body;
            const sw = Math.max(el.scrollWidth, body ? body.scrollWidth : 0);
            return sw - el.clientWidth;
          });
          if (overflow > 2) {
            fail(
              'accessibility_responsive',
              `Horizontal overflow at ${w}px on ${urlPath}: scrollWidth exceeds clientWidth by ${overflow}px (${fullUrl})`,
            );
          }
          if (SCREENSHOT_WIDTHS.has(w)) {
            const shotPath = path.join(shotRoot, `${fileSlug}__${w}.png`);
            await page.screenshot({ path: shotPath, fullPage: true });
          }
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
}

/** HEAD probe with 2 retries; returns { ok, status, error } */
async function httpHeadOnce(url, timeoutMs = 12000) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.request(
      u,
      { method: 'HEAD', timeout: timeoutMs, headers: { 'user-agent': 'borderlandscheats-seo-audit/1.0' } },
      (res) => {
        res.resume();
        resolve({ ok: res.statusCode !== undefined && res.statusCode < 400, status: res.statusCode ?? 0 });
      },
    );
    req.on('error', (err) => resolve({ ok: false, status: 0, error: String(err.message || err) }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, status: 0, error: 'timeout' });
    });
    req.end();
  });
}

async function httpHeadWithRetries(url) {
  let last = await httpHeadOnce(url);
  if (last.ok || [403, 429].includes(last.status)) return last;
  await new Promise((r) => setTimeout(r, 400));
  last = await httpHeadOnce(url);
  if (last.ok || [403, 429].includes(last.status)) return last;
  await new Promise((r) => setTimeout(r, 800));
  return httpHeadOnce(url);
}

async function verifyNotFoundReturns404() {
  const probePath = '/__audit_probe_missing__/';
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: '127.0.0.1', port: AUDIT_PORT, path: probePath, method: 'GET', timeout: 8000 },
      (res) => {
        res.resume();
        resolve(res.statusCode === 404);
      },
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

/** Prime the static server HTML cache before Lighthouse (reduces document-latency noise on Windows). */
async function warmPreviewUrls(urlPaths) {
  for (const p of urlPaths) {
    const pathname = p === '/' ? '/' : p;
    await new Promise((resolve) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: AUDIT_PORT,
          path: pathname,
          method: 'GET',
          timeout: 30000,
          headers: { 'accept-encoding': 'identity' },
        },
        (res) => {
          res.resume();
          res.on('end', resolve);
        },
      );
      req.on('error', resolve);
      req.on('timeout', () => {
        req.destroy();
        resolve();
      });
      req.end();
    });
  }
}

async function runLighthouseOnPaths(indexedPages) {
  const templatePaths = ['/'];
  for (const p of indexedPages) {
    if (p.urlPath !== '/' && !templatePaths.includes(p.urlPath)) templatePaths.push(p.urlPath);
  }

  const onlyCategories = ['performance', 'accessibility', 'best-practices', 'seo'];
  const chromeFlags = ['--headless', '--disable-gpu', '--no-sandbox'];

  let chrome;
  try {
    chrome = await chromeLauncher.launch({ chromeFlags });
  } catch (e) {
    fail('performance', `Lighthouse: failed to launch Chrome (${/** @type {Error} */ (e).message || e})`);
    return;
  }

  try {
    const flags = {
      logLevel: 'error',
      port: chrome.port,
      onlyCategories,
    };

    for (const urlPath of templatePaths) {
      const url = `${BASE_URL}${urlPath}`;
      for (const { label, config } of [
        { label: 'mobile', config: undefined },
        { label: 'desktop', config: desktopConfig },
      ]) {
        let runnerResult;
        try {
          runnerResult = await lighthouse(url, flags, config);
        } catch (e) {
          fail(
            'performance',
            `Lighthouse (${label}) threw for ${urlPath}: ${/** @type {Error} */ (e).message || e}`,
          );
          continue;
        }
        const categories = runnerResult?.lhr?.categories;
        if (!categories) {
          fail('performance', `Lighthouse (${label}) returned no categories for ${urlPath}`);
          continue;
        }
        for (const cat of onlyCategories) {
          const score = categories[cat]?.score;
          if (score == null) {
            fail('performance', `Lighthouse (${label}) missing category "${cat}" for ${urlPath}`);
            continue;
          }
          if (score < LH_MIN) {
            fail(
              'performance',
              `Lighthouse (${label}) ${urlPath} ${cat}: score ${(score * 100).toFixed(0)} (min ${LH_MIN * 100})`,
            );
          }
        }
      }
    }
  } finally {
    await chrome.kill();
  }
}

function startPreviewServer() {
  return spawn(process.execPath, [path.join(root, 'scripts', 'serve.mjs')], {
    env: { ...process.env, PORT: AUDIT_PORT },
    stdio: 'ignore',
    detached: false,
  });
}

async function main() {
  // ─── 1) Build + verifiers ──────────────────────────────────────────
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

  console.log('SEO audit: cspell (US English)…');
  const spell = runNpmRun('spellcheck');
  if (spell.status !== 0) {
    console.error(spell.stderr || spell.stdout);
    fail('spelling_language', 'cspell spellcheck failed (npm run spellcheck)');
  }

  /** Optional: committed secrets */
  function scanSecretsInRepo() {
    const patterns = [
      /sk_live_[a-zA-Z0-9]{20,}/,
      /AKIA[0-9A-Z]{16}/,
      /ghp_[a-zA-Z0-9]{36}/,
      /xox[baprs]-[a-zA-Z0-9-]{10,}/,
    ];
    const scanDirs = [path.join(root, 'src'), path.join(root, 'scripts')];
    for (const dir of scanDirs) {
      for (const f of walkFiles(dir, '')) {
        if (!/\.(astro|ts|tsx|js|mjs|mdx|json)$/.test(f)) continue;
        const c = fs.readFileSync(f, 'utf8');
        for (const re of patterns) {
          if (re.test(c)) fail('build', `Possible secret pattern in ${path.relative(root, f)}`);
        }
      }
    }
    const envTracked = path.join(root, '.env');
    if (fs.existsSync(envTracked)) {
      try {
        const { status } = run('git', ['ls-files', '--error-unmatch', '.env'], { stdio: 'pipe' });
        if (status === 0) fail('build', '.env is tracked by git — remove from version control');
      } catch {
        /* ignore */
      }
    }
  }
  scanSecretsInRepo();

  /** --- Keyword map --- */
  let keywordMap = {};
  const keywordMapPath = path.join(root, 'src', 'data', 'keyword-map.json');
  if (!fs.existsSync(keywordMapPath)) {
    fail('keyword_usage', 'Missing src/data/keyword-map.json');
  } else {
    try {
      keywordMap = JSON.parse(fs.readFileSync(keywordMapPath, 'utf8'));
      const primaries = Object.values(keywordMap).map((/** @type {*} */ e) => e.primary?.toLowerCase().trim());
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

  const globalIds = buildGlobalIds(indexedPages);

  /** prefers-reduced-motion in bundled CSS or critical inline style (Astro may inline all CSS) */
  let hasReducedMotion = false;
  const cssFiles = walkFiles(dist, '.css');
  for (const cf of cssFiles) {
    if (fs.readFileSync(cf, 'utf8').includes('prefers-reduced-motion')) {
      hasReducedMotion = true;
      break;
    }
  }
  if (!hasReducedMotion) {
    for (const p of indexedPages) {
      if (p.raw.includes('prefers-reduced-motion')) {
        hasReducedMotion = true;
        break;
      }
    }
  }
  if (!hasReducedMotion) {
    fail('accessibility_responsive', 'No prefers-reduced-motion rule found in dist (CSS or HTML)');
  }

  /** skip link → #main-content */
  for (const p of indexedPages) {
    if (!/href=["']#main-content["']/i.test(p.raw)) {
      fail('accessibility_responsive', `${p.rel}: missing skip link to #main-content`);
    }
  }

  /** Internal link resolution + external rel */
  const internalGraph = new Map();
  const externalUrlsToProbe = new Set();
  function addEdge(from, toPath) {
    if (!internalGraph.has(from)) internalGraph.set(from, new Set());
    internalGraph.get(from).add(toPath);
  }

  for (const p of indexedPages) {
    const { raw, rel, urlPath } = p;

    const linkTags = [...raw.matchAll(/<a\b([^>]*)>/gi)];
    for (const [, attrBlock] of linkTags) {
      const hrefM = attrBlock.match(/\bhref=["']([^"']*)["']/i);
      if (!hrefM) continue;
      const href = hrefM[1].trim();
      if (!href || href.startsWith('mailto:')) continue;
      if (href.startsWith('javascript:')) {
        fail('links_redirects', `${rel}: javascript: href`);
        continue;
      }
      if (/localhost|127\.0\.0\.1/i.test(href)) {
        fail('links_redirects', `${rel}: localhost in href: ${href}`);
        continue;
      }

      const relM = attrBlock.match(/\brel=["']([^"']*)["']/i);
      const rels = parseRel(relM ? relM[1] : '');
      const targetM = attrBlock.match(/\btarget=["']([^"']*)["']/i);
      const targetBlank = targetM && targetM[1].toLowerCase() === '_blank';

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
        if (u.hostname === SITE_HOST || u.hostname === `www.${SITE_HOST}`) {
          fail('links_redirects', `${rel}: use relative URL instead of ${href}`);
          continue;
        }
        if (u.protocol !== 'https:') {
          fail('links_redirects', `${rel}: external link must be HTTPS: ${href}`);
          continue;
        }
        const host = u.hostname.toLowerCase();
        const allowedExternal = new Set(['fonts.googleapis.com', 'fonts.gstatic.com', 'www.googletagmanager.com', 'www.google-analytics.com']);
        externalUrlsToProbe.add(href.split('#')[0]);
        if (allowedExternal.has(host)) {
          continue;
        }
        const isAffiliate = host === 'zadeyo.com' || href.includes('zadeyo.com');
        if (isAffiliate) {
          if (!relIncludes(rels, 'sponsored') || !relIncludes(rels, 'noopener')) {
            fail('links_redirects', `${rel}: affiliate/external seller link must have rel="sponsored noopener" (+ noreferrer if target=_blank): ${href}`);
          }
          if (targetBlank && !relIncludes(rels, 'noreferrer')) {
            fail('links_redirects', `${rel}: target=_blank affiliate link must include noreferrer: ${href}`);
          }
        } else {
          if (!relIncludes(rels, 'noopener')) {
            fail('links_redirects', `${rel}: external link must include rel noopener: ${href}`);
          }
          if (targetBlank && !relIncludes(rels, 'noreferrer')) {
            fail('links_redirects', `${rel}: target=_blank external link must include noreferrer: ${href}`);
          }
        }
        continue;
      }
      if (href === '#' || href === '#!') {
        fail('links_redirects', `${rel}: placeholder href ${href}`);
        continue;
      }
      if (href.startsWith('#')) {
        const id = href.slice(1);
        if (id && !globalIds.has(id)) {
          fail('links_redirects', `${rel}: fragment #${id} has no matching id in built pages`);
        }
        continue;
      }
      const resolved = href.startsWith('/') ? href : new URL(href, `https://${SITE_HOST}${urlPath}`).pathname;
      let pathOnly = resolved.split('#')[0];
      if (!pathOnly.startsWith('/')) pathOnly = `/${pathOnly}`;
      if (pathOnly !== '/' && !pathOnly.endsWith('/')) {
        fail('links_redirects', `${rel}: internal href missing trailing slash: ${href}`);
        continue;
      }
      const distFile = pathToDistFile(pathOnly);
      if (!fs.existsSync(distFile)) {
        fail('links_redirects', `${rel}: broken internal link ${href} → missing ${path.relative(root, distFile)}`);
        continue;
      }
      try {
        const targetHtml = fs.readFileSync(distFile, 'utf8');
        if (isRedirectStub(targetHtml)) {
          fail('links_redirects', `${rel}: internal link ${href} targets redirect-only page ${pathOnly} — use final URL`);
        }
      } catch {
        /* ignore */
      }
      addEdge(urlPath, pathOnly);
    }
  }

  /** Hub edges: header + footer repeat the same internal destinations on every page */
  {
    const indexedSet = new Set(indexedPages.map((p) => p.urlPath));
    for (const to of IA_HUB_DESTINATIONS) {
      if (!indexedSet.has(to)) {
        fail('information_architecture', `IA hub list references route not in indexable pages: ${to}`);
      }
    }
    for (const from of indexedSet) {
      for (const to of IA_HUB_DESTINATIONS) {
        addEdge(from, to);
      }
    }
  }

  /** IA: every indexed page within 3 clicks from home (BFS on internal nav links) */
  {
    const indexedSet = new Set(indexedPages.map((p) => p.urlPath));
    const visited = new Set(['/']);
    const queue = [['/', 0]];
    while (queue.length) {
      const [cur, depth] = queue.shift();
      if (depth >= 3) continue;
      for (const next of internalGraph.get(cur) ?? []) {
        if (!indexedSet.has(next) || next.startsWith('/go/')) continue;
        if (!visited.has(next)) {
          visited.add(next);
          queue.push([next, depth + 1]);
        }
      }
    }
    for (const p of indexedPages) {
      if (!visited.has(p.urlPath)) {
        fail(
          'information_architecture',
          `${p.urlPath} not reachable within 3 internal link hops from / (hub/spoke nav graph)`,
        );
      }
    }
  }

  /** Keyword map: primary appears in title, description, h1 */
  for (const [route, meta] of Object.entries(keywordMap)) {
    const entry = indexedPages.find((p) => p.urlPath === route);
    if (!entry) {
      fail('keyword_usage', `keyword-map route ${route} has no matching built indexable page`);
      continue;
    }
    const primary = String(/** @type {*} */ (meta).primary || '')
      .toLowerCase()
      .trim();
    if (!primary) continue;
    const title = (firstCapture(entry.raw, /<title>([^<]*)<\/title>/i) ?? '').toLowerCase();
    const desc = (
      firstCapture(entry.raw, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ?? ''
    ).toLowerCase();
    const h1m = entry.raw.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1m ? stripTags(h1m[1]).toLowerCase() : '';
    if (!title.includes(primary)) fail('keyword_usage', `${entry.rel}: title should include primary keyword "${primary}"`);
    if (!desc.includes(primary)) fail('keyword_usage', `${entry.rel}: meta description should include primary "${primary}"`);
    if (!h1.includes(primary)) fail('keyword_usage', `${entry.rel}: H1 should include primary "${primary}"`);
  }

  /** Title / description length */
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

    const blocks = [...raw.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    for (const [, json] of blocks) {
      try {
        JSON.parse(json.trim());
      } catch (e) {
        fail('technical_seo', `${rel}: invalid JSON-LD: ${e}`);
      }
    }
  }

  /** Sitemap */
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
      let pathname = u.pathname;
      if (pathname !== '/' && !pathname.endsWith('/')) pathname = `${pathname}/`;
      if (!internalTargets.has(pathname)) {
        fail('sitemap', `Sitemap loc not built as indexable page: ${loc}`);
      }
    }
  }

  /** Images */
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
      const st = fs.statSync(filePath);
      if (st.size < 200) fail('images_media', `${p.rel}: image too small (${st.size}b): ${src}`);
      if (!/\.(webp|avif|jpe?g|png|gif|svg)(\?|$)/i.test(src)) {
        fail('images_media', `${p.rel}: use WebP/AVIF or modern format for ${src}`);
      }
      const imgTagMatch = p.raw.match(new RegExp(`<img[^>]+src=["']${src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i'));
      if (imgTagMatch && !/\bloading=["']lazy["']/i.test(imgTagMatch[0]) && !/\bfetchpriority=["']high["']/i.test(imgTagMatch[0])) {
        if (!/\bwidth=/.test(imgTagMatch[0]) || !/\bheight=/.test(imgTagMatch[0])) {
          fail('images_media', `${p.rel}: img should have width and height (layout stability): ${src}`);
        }
      }
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

  // ─── Preview server + browser / Lighthouse ───────────────────────────
  let serverProc = null;
  try {
    console.log(`SEO audit: starting preview server on port ${AUDIT_PORT}…`);
    serverProc = startPreviewServer();
    await waitForServer(`${BASE_URL}/`);

    const nfOk = await verifyNotFoundReturns404();
    if (!nfOk) fail('links_redirects', 'Missing URL must return HTTP 404 with 404.html body (GET /__audit_probe_missing__/)');

    console.log('SEO audit: warming HTML cache for Lighthouse (pre-read + compress once per page)…');
    await warmPreviewUrls(indexedPages.map((p) => p.urlPath));

    /** Lighthouse first: Playwright full-page runs are CPU-heavy and skew mobile perf if they run before LH. */
    console.log('SEO audit: Lighthouse (mobile + desktop, categories ≥95)…');
    await runLighthouseOnPaths(indexedPages);

    console.log('SEO audit: Playwright layout (overflow + screenshots)…');
    await runPlaywrightLayoutAudit(indexedPages);

    console.log('SEO audit: external link HEAD checks (2 retries; 403/429/timeout = unverified, non-blocking)…');
    for (const extUrl of externalUrlsToProbe) {
      const r = await httpHeadWithRetries(extUrl);
      if (r.ok) continue;
      const code = r.status;
      const soft = code === 403 || code === 429 || /timeout|ECONNRESET|ENOTFOUND|ECONNREFUSED/i.test(String(r.error || ''));
      if (soft) {
        console.warn(`  [unverified external] ${extUrl} — ${code || ''} ${r.error || ''}`);
        continue;
      }
      if (code >= 400) {
        fail('links_redirects', `external link HEAD failed: ${extUrl} — HTTP ${code}`);
      } else {
        console.warn(`  [unverified external] ${extUrl} — ${r.error || 'unknown'}`);
      }
    }
  } catch (e) {
    fail('performance', `Browser/Lighthouse phase: ${/** @type {Error} */ (e).message || e}`);
  } finally {
    if (serverProc && !serverProc.killed) {
      serverProc.kill('SIGTERM');
    }
  }

  printFailures();
  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
