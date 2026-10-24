import { existsSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

const port = 5176;
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: 'ignore', detached: true });
const base = `http://127.0.0.1:${port}`;
let browser;
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { const response = await fetch(base); if (response.ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error('Audit dev server did not become ready.');
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'], headless: true });
  const defaultRoutes = [
    '/', '/shop', '/collections', '/collections/indonesian-coffee', '/collections/arabica-selection', '/collections/dark-roast',
    '/collections/light-medium-roast', '/collections/coffee-bundles', '/collections/limited-editions',
    '/product/java-arabica', '/product/sumatra-arabica', '/product/bali-kintamani', '/product/toraja-reserve', '/product/signature-house-blend', '/product/espresso-dark-roast',
    '/bundles', '/about', '/journal', '/journal/the-beauty-of-a-perfect-roast', '/journal/a-journey-through-indonesian-coffee', '/journal/your-slow-morning-brew-guide',
    '/origins', '/search?q=java', '/wishlist', '/cart', '/checkout', '/order-success', '/account/auth', '/account', '/account/orders', '/account/orders/CS-SAMPLE', '/contact', '/help', '/subscription',
    '/admin', '/admin/analytics', '/admin/orders', '/admin/products', '/admin/inventory', '/admin/customers', '/admin/promotions', '/admin/reviews', '/admin/content', '/admin/subscriptions', '/admin/settings',
  ];
  const requestedRoutes = process.argv.slice(2);
  const routes = requestedRoutes.length ? requestedRoutes : defaultRoutes;
  const problems = [];
  let visited = 0;
  for (const width of [375, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('pageerror', error => consoleErrors.push(error.message));
    for (const route of routes) {
      consoleErrors.length = 0;
      await page.goto(base + route, { waitUntil: 'networkidle' });
      const result = await page.evaluate(() => ({
        page: document.documentElement.scrollWidth,
        viewport: innerWidth,
        headings: document.querySelectorAll('h1').length,
        images: [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.getAttribute('src')),
      }));
      if (result.page > result.viewport + 1 || result.images.length || consoleErrors.length || !result.headings) {
        problems.push({ width, route, ...result, errors: [...consoleErrors] });
      }
      if (route === '/' && width === 1440) await page.screenshot({ path: '/tmp/coffee-home-desktop.png', fullPage: true });
      if (route === '/' && width === 375) await page.screenshot({ path: '/tmp/coffee-home-mobile.png', fullPage: true });
      visited++;
    }
    await context.close();
  }
  console.log(JSON.stringify({ visited, routes: routes.length, widths: [375, 768, 1440], problems }, null, 2));
  if (problems.length) process.exitCode = 1;
} finally {
  await browser?.close();
  try { process.kill(-server.pid, 'SIGTERM'); } catch {}
}
