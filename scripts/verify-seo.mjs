import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const HOST = 'https://borderlandscheats.com';
const EXPECT_OG = `${HOST}/og/default.jpg`;

const errors = [];

function walkHtml(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkHtml(full, files);
    else if (name.endsWith('.html')) files.push(full);
  }
  return files;
}

function assert(cond, msg) {
  if (!cond) errors.push(msg);
}

function firstCapture(html, pattern) {
  const m = html.match(pattern);
  return m ? m[1].trim() : undefined;
}

function urlPathFromDistHtml(file) {
  const rel = path.relative(dist, file).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return `/${rel.replace(/\/index\.html$/, '/')}`;
}

function countH1(html) {
  const re = /<h1\b[^>]*>/gi;
  let n = 0;
  while (re.exec(html)) n += 1;
  return n;
}

function hasNoindex(html) {
  const m = html.match(/<meta[^>]+name=["']robots["'][^>]*>/i);
  if (!m) return false;
  return /noindex/i.test(m[0]);
}

/** Minimal Astro redirect stub (no BaseLayout) */
function isRedirectStub(html) {
  return (
    /<meta[^>]+http-equiv=["']refresh["']/i.test(html) &&
    /<link[^>]+rel=["']canonical["']/i.test(html) &&
    !/<meta[^>]+property=["']og:title["']/i.test(html)
  );
}

function hasJsonLdSearchAction(html) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  return blocks.some(([, json]) => /"SearchAction"/i.test(json));
}

function hasMetaKeywords(html) {
  return /<meta[^>]+name=["']keywords["']/i.test(html);
}

const htmlFiles = walkHtml(dist).filter((f) => !f.endsWith(`${path.sep}404.html`));

const indexed = [];

for (const file of htmlFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const rel = path.relative(dist, file).replace(/\\/g, '/');
  const urlPath = urlPathFromDistHtml(file);
  const expectedCanon = urlPath === '/' ? `${HOST}/` : `${HOST}${urlPath}`;
  const noindex = hasNoindex(raw);
  const redirectStub = isRedirectStub(raw);

  if (!noindex) indexed.push({ file, rel, urlPath, raw });

  if (!redirectStub) {
    const canonical = firstCapture(
      raw,
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i,
    );
    assert(canonical === expectedCanon, `${rel}: canonical expected ${expectedCanon}, got ${canonical}`);

    assert(!/<link[^>]+hreflang=/i.test(raw), `${rel}: hreflang link tags must not be present (US English only)`);
  }

  if (!noindex) {
    assert(countH1(raw) === 1, `${rel}: expected exactly 1 <h1> on indexed pages`);

    const title = firstCapture(raw, /<title>([^<]*)<\/title>/i);
    const ogTitle = firstCapture(
      raw,
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i,
    );
    const twTitle = firstCapture(
      raw,
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']*)["']/i,
    );
    assert(!!title, `${rel}: missing <title>`);
    assert(ogTitle === title, `${rel}: og:title must match <title>`);
    assert(twTitle === title, `${rel}: twitter:title must match <title>`);

    const desc = firstCapture(raw, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
    const ogDesc = firstCapture(
      raw,
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i,
    );
    const twDesc = firstCapture(
      raw,
      /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']*)["']/i,
    );
    assert(!!desc, `${rel}: missing meta description`);
    assert(ogDesc === desc, `${rel}: og:description must match meta description`);
    assert(twDesc === desc, `${rel}: twitter:description must match meta description`);

    const ogImage = firstCapture(
      raw,
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i,
    );
    const twImage = firstCapture(
      raw,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']*)["']/i,
    );
    assert(ogImage === EXPECT_OG, `${rel}: og:image must be ${EXPECT_OG}`);
    assert(twImage === EXPECT_OG, `${rel}: twitter:image must be ${EXPECT_OG}`);

    const ogW = firstCapture(
      raw,
      /<meta[^>]+property=["']og:image:width["'][^>]+content=["']([^"']*)["']/i,
    );
    const ogH = firstCapture(
      raw,
      /<meta[^>]+property=["']og:image:height["'][^>]+content=["']([^"']*)["']/i,
    );
    assert(ogW === '1200', `${rel}: og:image:width must be 1200`);
    assert(ogH === '630', `${rel}: og:image:height must be 630`);

    const imageSrc = firstCapture(raw, /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']*)["']/i);
    assert(imageSrc === EXPECT_OG, `${rel}: rel=image_src must be ${EXPECT_OG}`);

    assert(!hasMetaKeywords(raw), `${rel}: meta keywords must not be present`);
    assert(!hasJsonLdSearchAction(raw), `${rel}: JSON-LD must not include SearchAction`);

    assert(/<html[^>]+lang=["']en-US["']/i.test(raw), `${rel}: <html lang> must be en-US`);
  }
}

const titles = new Map();
const descs = new Map();

for (const { rel, raw } of indexed) {
  const title = firstCapture(raw, /<title>([^<]*)<\/title>/i);
  if (title) {
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(rel);
  }
  const desc = firstCapture(raw, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  if (desc) {
    if (!descs.has(desc)) descs.set(desc, []);
    descs.get(desc).push(rel);
  }
}

for (const [t, rels] of titles) {
  if (rels.length > 1) errors.push(`Duplicate <title> "${t}" on: ${rels.join(', ')}`);
}
for (const [d, rels] of descs) {
  if (rels.length > 1) errors.push(`Duplicate meta description on ${rels.length} pages: ${rels.join(', ')}`);
}

const sitemapPath = path.join(dist, 'sitemap.xml');
assert(fs.existsSync(sitemapPath), 'dist/sitemap.xml missing');
if (fs.existsSync(sitemapPath)) {
  const sm = fs.readFileSync(sitemapPath, 'utf8');
  assert(sm.includes('xmlns:image='), 'sitemap.xml must declare image namespace');
  assert(
    /<\?xml-stylesheet[^>]*href="https:\/\/borderlandscheats\.com\/sitemap\.css"/.test(sm),
    'sitemap.xml must reference xml-stylesheet → https://borderlandscheats.com/sitemap.css',
  );
  const locCount = (sm.match(/<loc>/g) ?? []).length;
  assert(locCount > 0, 'sitemap.xml must contain <loc> entries');
  const imageLocCount = (sm.match(/<image:loc>/g) ?? []).length;
  assert(imageLocCount >= locCount, 'sitemap: each URL should include at least one <image:loc>');
  assert(!sm.includes('hreflang'), 'sitemap.xml must not contain hreflang');
}

const robotsPath = path.join(dist, 'robots.txt');
assert(fs.existsSync(robotsPath), 'dist/robots.txt missing');
if (fs.existsSync(robotsPath)) {
  const rb = fs.readFileSync(robotsPath, 'utf8');
  assert(rb.includes('Sitemap: https://borderlandscheats.com/sitemap.xml'), 'robots.txt must list sitemap');
  assert(/User-agent:\s*Googlebot/i.test(rb), 'robots.txt must include Googlebot section');
  assert(rb.includes('Allow: /sitemap.xml'), 'robots.txt must Allow: /sitemap.xml');
}

const ogFile = path.join(root, 'public', 'og', 'default.jpg');
assert(fs.existsSync(ogFile), 'public/og/default.jpg must exist (run generate-seo-assets)');

if (errors.length > 0) {
  console.error('verify-seo failed:\n' + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(`verify-seo: OK (${indexed.length} indexed HTML pages checked).`);
