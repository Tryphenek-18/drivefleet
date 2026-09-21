/**
 * browser_test.js — real-browser validation (Chromium via Playwright).
 *
 * Serves public/ over HTTP and checks, at every breakpoint, that:
 *   - no page produces horizontal overflow (the catalogue topbar / date fields)
 *   - the app chrome stays inside the viewport
 *   - every vehicle photo really loads (naturalWidth > 0, HTTP 200, WebP)
 *   - the booking modal keeps working with its new design
 *   - the modal collapses to one column / bottom sheet on small screens
 *
 * Usage:
 *   npm install --no-save playwright --prefix /tmp/domtest
 *   NODE_PATH=/tmp/domtest/node_modules node scripts/browser_test.js
 */
'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (error) {
  console.log('SKIP: playwright is not installed. Install it with:');
  console.log('  npm install --no-save playwright --prefix /tmp/domtest');
  console.log('  NODE_PATH=/tmp/domtest/node_modules npx --prefix /tmp/domtest playwright install chromium');
  process.exit(0);
}

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const SHOTS = path.join(ROOT, 'docs', 'screenshots');
const PORT = 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
};

let passed = 0;
const failures = [];

function check(condition, label) {
  if (condition) { passed += 1; console.log('  ok   ' + label); }
  else { failures.push(label); console.log('  FAIL ' + label); }
}

function serve() {
  const server = http.createServer((request, response) => {
    const url = decodeURIComponent(request.url.split('?')[0]);
    let file = path.join(PUBLIC, url === '/' ? 'index.html' : url);
    if (!file.startsWith(PUBLIC)) { response.writeHead(403).end(); return; }
    fs.readFile(file, (error, data) => {
      if (error) { response.writeHead(404, { 'Content-Type': 'text/plain' }).end('not found'); return; }
      response.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      response.end(data);
    });
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 720 },
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'phone-560', width: 560, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'tablet-900', width: 900, height: 1000 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'wide-1920', width: 1920, height: 1080 }
];

const PAGES = ['index.html', 'pages/vehicles.html', 'pages/dashboard.html'];

/* Elements that must sit inside the viewport at every breakpoint. */
const CONTAINED = {
  'index.html': ['#site-navbar .navbar-inner'],
  'pages/vehicles.html': ['#siteTopbar .topbar', '#vehicleFilters'],
  'pages/dashboard.html': ['#siteTopbar .topbar', '#statStrip', '.page-header']
};

async function metrics(page) {
  return page.evaluate(() => ({
    docScroll: document.documentElement.scrollWidth,
    docClient: document.documentElement.clientWidth,
    bodyScroll: document.body.scrollWidth
  }));
}

async function outOfViewport(page, selectors) {
  return page.evaluate((list) => {
    const width = document.documentElement.clientWidth;
    const bad = [];
    list.forEach((selector) => {
      document.querySelectorAll(selector).forEach((node) => {
        const box = node.getBoundingClientRect();
        if (box.width === 0 && box.height === 0) { return; }
        if (box.left < -1 || box.right > width + 1) {
          bad.push(selector + ' [' + Math.round(box.left) + '..' + Math.round(box.right) + '] vs ' + width);
        }
      });
    });
    return bad;
  }, selectors);
}

(async function run() {
  fs.mkdirSync(SHOTS, { recursive: true });
  const server = await serve();
  const browser = await chromium.launch();
  const consoleErrors = [];
  const failedRequests = [];

  try {
    console.log('1) Horizontal overflow at every breakpoint');
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1
      });
      const page = await context.newPage();
      page.on('console', (message) => {
        /* /api/* 404s are the documented mock-fallback path, not a defect. */
        const text = message.text();
        if (message.type() === 'error' && text.indexOf('/api/') === -1 && text.indexOf('Failed to load resource') === -1) {
          consoleErrors.push(viewport.name + ': ' + text);
        }
      });
      page.on('pageerror', (error) => consoleErrors.push(viewport.name + ': ' + error.message));
      page.on('response', (response) => {
        const url = response.url();
        if (response.status() >= 400 && url.indexOf('/api/') === -1 && url.indexOf('favicon') === -1) {
          failedRequests.push(viewport.name + ': HTTP ' + response.status() + ' ' + url.replace('http://127.0.0.1:' + PORT, ''));
        }
      });

      for (const target of PAGES) {
        await page.goto('http://127.0.0.1:' + PORT + '/' + target, { waitUntil: 'load' });
        await page.waitForTimeout(400);

        const sizes = await metrics(page);
        check(sizes.docScroll <= sizes.docClient + 1,
          viewport.name + ' · ' + target + ' — no horizontal scroll (scrollWidth ' + sizes.docScroll + ' <= client ' + sizes.docClient + ')');

        const escaped = await outOfViewport(page, CONTAINED[target] || []);
        check(escaped.length === 0,
          viewport.name + ' · ' + target + ' — chrome inside the viewport' + (escaped.length ? ' → ' + escaped[0] : ''));
      }
      await context.close();
    }

    console.log('2) Catalogue date fields stay inside their card');
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      const page = await context.newPage();
      await page.goto('http://127.0.0.1:' + PORT + '/pages/vehicles.html', { waitUntil: 'load' });
      await page.waitForTimeout(400);
      const overflow = await page.evaluate(() => {
        const card = document.querySelector('#vehicleFilters');
        if (!card) return ['missing filter card'];
        const cardBox = card.getBoundingClientRect();
        const bad = [];
        card.querySelectorAll('input, select, button').forEach((field) => {
          const box = field.getBoundingClientRect();
          if (box.width === 0) return;
          if (box.left < cardBox.left - 1 || box.right > cardBox.right + 1) {
            bad.push((field.id || field.name || field.tagName) + ' escapes the card');
          }
        });
        return bad;
      });
      check(overflow.length === 0,
        viewport.name + ' · filter fields contained' + (overflow.length ? ' → ' + overflow.join(', ') : ''));
      await context.close();
    }

    console.log('2b) Sidebar drawer: off-canvas when closed, contained when opened');
    for (const viewport of [{ name: 'mobile-375', width: 375 }, { name: 'tablet-900', width: 900 }, { name: 'desktop-1440', width: 1440 }]) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: 900 } });
      const page = await context.newPage();
      await page.goto('http://127.0.0.1:' + PORT + '/pages/dashboard.html', { waitUntil: 'load' });
      await page.waitForTimeout(400);

      const closed = await page.evaluate(() => {
        const box = document.querySelector('#siteSidebar').getBoundingClientRect();
        return { left: box.left, right: box.right };
      });

      if (viewport.width > 1024) {
        check(closed.left >= -1 && closed.right <= viewport.width + 1,
          viewport.name + ' — sidebar docked inside the layout (' + Math.round(closed.left) + '..' + Math.round(closed.right) + ')');
      } else {
        check(closed.right <= 1, viewport.name + ' — sidebar parked off-canvas while closed (right ' + Math.round(closed.right) + ')');
        await page.click('[data-action="toggle-sidebar"]');
        await page.waitForTimeout(420);
        const open = await page.evaluate(() => {
          const box = document.querySelector('#siteSidebar').getBoundingClientRect();
          return { left: box.left, right: box.right, overlay: Boolean(document.querySelector('#sidebarOverlay.open')) };
        });
        check(open.left >= -1 && open.right <= viewport.width + 1,
          viewport.name + ' — sidebar fully inside the viewport once opened (' + Math.round(open.left) + '..' + Math.round(open.right) + ')');
        check(open.overlay, viewport.name + ' — backdrop shown behind the open drawer');
      }
      await context.close();
    }

    console.log('3) Vehicle photos really load (WebP, HTTP 200, decoded pixels)');
    for (const target of ['index.html', 'pages/vehicles.html']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      const imageResponses = [];
      page.on('response', (response) => {
        if (/\.webp$/.test(response.url())) {
          imageResponses.push({ url: response.url().split('/').pop(), status: response.status(), type: response.headers()['content-type'] });
        }
      });

      await page.goto('http://127.0.0.1:' + PORT + '/' + target, { waitUntil: 'load' });
      await page.waitForTimeout(900);

      const media = await page.evaluate(async () => {
        const images = Array.from(document.querySelectorAll('.vehicle-photo'));
        await Promise.all(images.map((image) => (image.complete ? Promise.resolve()
          : new Promise((resolve) => { image.addEventListener('load', resolve, { once: true }); image.addEventListener('error', resolve, { once: true }); }))));
        return {
          total: images.length,
          loaded: images.filter((image) => image.naturalWidth > 0).length,
          flagged: images.filter((image) => image.classList.contains('is-loaded')).length,
          missing: images.filter((image) => image.classList.contains('is-missing')).length,
          srcset: images.every((image) => (image.getAttribute('srcset') || '').includes('-small.webp')),
          sized: images.every((image) => image.getAttribute('width') === '800' && image.getAttribute('height') === '500')
        };
      });

      check(media.total > 0, target + ' — vehicle photos rendered (' + media.total + ')');
      check(media.loaded === media.total && media.missing === 0,
        target + ' — every photo decoded (' + media.loaded + '/' + media.total + ')');
      check(media.flagged === media.total, target + ' — load class applied for the fade-in');
      check(media.srcset && media.sized, target + ' — responsive srcset + intrinsic dimensions present');

      const badStatus = imageResponses.filter((entry) => entry.status !== 200);
      const badType = imageResponses.filter((entry) => (entry.type || '').indexOf('image/webp') === -1);
      check(imageResponses.length > 0 && badStatus.length === 0,
        target + ' — all ' + imageResponses.length + ' image requests returned 200');
      check(badType.length === 0, target + ' — served as image/webp');
      await context.close();
    }

    console.log('4) Booking modal: design + behaviour, desktop and mobile');
    for (const viewport of [{ name: 'desktop-1440', width: 1440, height: 900 }, { name: 'mobile-375', width: 375, height: 812 }]) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      const page = await context.newPage();
      await page.goto('http://127.0.0.1:' + PORT + '/pages/vehicles.html', { waitUntil: 'load' });
      await page.waitForTimeout(500);

      await page.click('#vehicleResults [data-book-vehicle]');
      await page.waitForSelector('#appModalOverlay', { state: 'visible' });
      await page.waitForTimeout(450);

      const modal = await page.evaluate(() => {
        const overlay = document.querySelector('#appModalOverlay');
        const box = document.querySelector('#appModalOverlay .modal').getBoundingClientRect();
        const body = document.querySelector('#appModalOverlay .modal-body');
        const grid = document.querySelector('#bookingForm');
        const columns = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0;
        return {
          visible: getComputedStyle(overlay).opacity === '1',
          insideViewport: box.left >= -1 && box.right <= document.documentElement.clientWidth + 1,
          width: Math.round(box.width),
          scrollable: body ? body.scrollHeight >= body.clientHeight : false,
          columns: columns,
          hasHero: Boolean(document.querySelector('#appModalOverlay .modal-hero img')),
          hasEyebrow: Boolean(document.querySelector('#appModalOverlay .modal-eyebrow')),
          extras: document.querySelectorAll('#appModalOverlay .extra-option').length,
          total: (document.querySelector('#footerTotal') || {}).textContent || '',
          backdrop: getComputedStyle(overlay).backdropFilter
        };
      });

      check(modal.visible, viewport.name + ' — overlay visible after opening');
      check(modal.insideViewport, viewport.name + ' — modal fits the viewport (width ' + modal.width + 'px)');
      check(modal.hasHero, viewport.name + ' — hero photo in the modal header');
      check(modal.hasEyebrow, viewport.name + ' — eyebrow label rendered');
      check(modal.extras === 4, viewport.name + ' — 4 extras offered as selectable cards');
      check(/\$\d/.test(modal.total), viewport.name + ' — footer total shows ' + modal.total);
      check(modal.backdrop.indexOf('blur') !== -1, viewport.name + ' — backdrop blur applied');
      check(viewport.width > 900 ? modal.columns === 2 : modal.columns === 1,
        viewport.name + ' — booking grid uses ' + modal.columns + ' column(s)');

      await page.click('#appModalOverlay .extra-option');
      await page.waitForTimeout(250);
      const extra = await page.evaluate(() => {
        const card = document.querySelector('#appModalOverlay .extra-option');
        return { selected: card.classList.contains('is-selected'), total: document.querySelector('#footerTotal').textContent };
      });
      check(extra.selected, viewport.name + ' — selected extra is highlighted');
      check(/\$\d/.test(extra.total), viewport.name + ' — quote recalculated with the extra (' + extra.total + ')');

      await page.screenshot({ path: path.join(SHOTS, 'modal-' + viewport.name + '.png'), fullPage: false });

      await page.keyboard.press('Escape');
      await page.waitForTimeout(60);
      const closing = await page.evaluate(() => {
        const overlay = document.querySelector('#appModalOverlay');
        return overlay ? overlay.getAttribute('data-state') : 'removed';
      });
      check(closing === 'closing', viewport.name + ' — closing animation state applied');
      await page.waitForTimeout(320);
      check(await page.$('#appModalOverlay') === null, viewport.name + ' — modal unmounted after the exit animation');
      check(await page.evaluate(() => document.body.style.overflow === ''), viewport.name + ' — page scrolling restored');

      await context.close();
    }

    console.log('5) Screenshots for the responsive record');
    for (const target of [{ file: 'index.html', name: 'landing' }, { file: 'pages/dashboard.html', name: 'dashboard' }, { file: 'pages/vehicles.html', name: 'catalogue' }]) {
      for (const viewport of [{ name: 'desktop-1440', width: 1440, height: 900 }, { name: 'tablet-768', width: 768, height: 1024 }, { name: 'mobile-375', width: 375, height: 812 }]) {
        const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
        const page = await context.newPage();
        await page.goto('http://127.0.0.1:' + PORT + '/' + target.file, { waitUntil: 'load' });
        await page.waitForTimeout(700);
        await page.screenshot({ path: path.join(SHOTS, target.name + '-' + viewport.name + '.png'), fullPage: false });
        await context.close();
      }
      check(true, target.name + ' screenshots written (desktop / tablet / mobile)');
    }

    console.log('6) Console cleanliness + asset integrity');
    check(consoleErrors.length === 0, 'no JavaScript errors' +
      (consoleErrors.length ? ' → ' + consoleErrors.slice(0, 3).join(' | ') : ''));
    check(failedRequests.length === 0, 'no broken asset requests (every 200 except the documented /api/* fallback)' +
      (failedRequests.length ? ' → ' + failedRequests.slice(0, 3).join(' | ') : ''));
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n' + passed + ' browser checks passed, ' + failures.length + ' failed');
  if (failures.length) {
    console.log('Failures:');
    failures.forEach((failure) => console.log('  - ' + failure));
    process.exit(1);
  }
})();
