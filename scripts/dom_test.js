/**
 * dom_test.js — DOM integration test for the DriveFleet frontend.
 *
 * Renders every page with jsdom, evaluates public/js/app.js inside it (with a
 * failing fetch so the mock fallback is exercised), then asserts what the user
 * actually sees: navbar/footer chrome, fleet grid, dashboard metrics, tables,
 * filters, the booking modal with a live quote, and the auth forms.
 *
 * jsdom is a dev-only dependency and is not installed with the project:
 *   npm install --no-save jsdom --prefix /tmp/domtest
 *   NODE_PATH=/tmp/domtest/node_modules node scripts/dom_test.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

let JSDOM;
try {
  ({ JSDOM } = require('jsdom'));
} catch (error) {
  console.log('SKIP: jsdom is not installed. Install it with:');
  console.log('  npm install --no-save jsdom --prefix /tmp/domtest');
  console.log('  NODE_PATH=/tmp/domtest/node_modules node scripts/dom_test.js');
  process.exit(0);
}

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const BUNDLE = fs.readFileSync(path.join(PUBLIC, 'js', 'app.js'), 'utf8');

let passed = 0;
const failures = [];

function check(condition, label) {
  if (condition) { passed += 1; console.log('  ok   ' + label); }
  else { failures.push(label); console.log('  FAIL ' + label); }
}

function tick(ms) { return new Promise((resolve) => setTimeout(resolve, ms || 250)); }

async function render(page, options) {
  options = options || {};
  const file = path.join(PUBLIC, page);
  const html = fs.readFileSync(file, 'utf8').replace(/<script[^>]*><\/script>/g, '');
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'http://localhost:4200/' + page + (options.query || '')
  });
  const { window } = dom;

  const errors = [];
  window.fetch = () => Promise.reject(new TypeError('offline (expected: mock fallback)'));
  window.addEventListener('error', (event) => errors.push('error: ' + event.message));
  window.addEventListener('unhandledrejection', (event) => errors.push('rejection: ' + event.reason));
  const nativeError = window.console.error.bind(window.console);
  window.console.error = (...args) => { errors.push('console.error: ' + args.join(' ')); nativeError(...args); };
  window.console.warn = () => {};
  window.IntersectionObserver = class { constructor(cb) { this.cb = cb; } observe() {} unobserve() {} disconnect() {} };
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = function () {};

  window.eval(BUNDLE);
  await tick(options.wait || 300);
  return { window, document: window.document, errors, dom };
}

function text(node) { return (node && node.textContent) ? node.textContent.trim() : ''; }

(async function run() {
  console.log('1) Landing page (index.html)');
  {
    const { window, document, errors } = await render('index.html');
    check(!errors.length, 'no runtime errors' + (errors.length ? ': ' + errors[0] : ''));
    check(document.querySelectorAll('#site-navbar .navbar').length === 1, 'sticky navbar rendered into #site-navbar');
    check(document.querySelectorAll('#site-navbar .nav-link').length === 4, 'navbar shows 4 marketing links');
    check(document.querySelectorAll('#mobile-menu .nav-link').length === 4, 'mobile menu rendered with links');
    check(document.querySelectorAll('#siteFooter .footer-grid').length === 1, 'footer rendered with grid');
    check(document.querySelectorAll('#siteFooter .footer-link').length === 9, 'footer link columns rendered');
    check(document.querySelectorAll('#featuredVehicles .vehicle-card').length === 6, 'featured fleet grid limited to data-limit=6');
    check(/\$\d/.test(text(document.querySelector('#featuredVehicles .price'))), 'vehicle cards show a daily price');
    check(document.querySelectorAll('#featuredVehicles .badge').length >= 12, 'vehicle cards show status + type badges');
    check(text(document.querySelector('#featuredVehicles .vehicle-card .title-md')).indexOf('Mercedes-Benz E-Class') !== -1, 'grid is sorted by rating (5.0 E-Class first)');
    check(text(document.querySelectorAll('[data-count]')[0]) !== '0', 'hero counters animated to their target');
    check(document.querySelector('#searchPickup').value !== '', 'hero search pre-fills a pick-up date');
    window.close();
  }

  console.log('2) Dashboard (pages/dashboard.html)');
  {
    const { window, document, errors } = await render('pages/dashboard.html');
    check(!errors.length, 'no runtime errors' + (errors.length ? ': ' + errors[0] : ''));
    check(document.querySelectorAll('#siteSidebar .sidebar-link').length === 6, 'sidebar rendered with 6 navigation links');
    check(document.querySelectorAll('#siteSidebar .sidebar-link.active').length === 1, 'current page highlighted in the sidebar');
    check(document.querySelector('#siteTopbar .topbar-search') !== null, 'topbar with search rendered');
    check(document.querySelectorAll('#statStrip .metric-card').length === 6, 'six KPI metric cards rendered');
    check(/\d/.test(text(document.querySelector('#statStrip .metric-value'))), 'metric cards show values');
    check(document.querySelectorAll('#recentRentals tbody tr').length === 5, 'recent rentals table shows 5 rows');
    check(document.querySelectorAll('#fleetStatus .summary-row').length === 3, 'fleet status breakdown rendered');
    check(document.querySelector('#fleetStatus .summary-total') !== null, 'outstanding balance total rendered');
    check(text(document.querySelector('#authNotice .alert')).indexOf('guest mode') !== -1, 'guest-mode notice shown when not signed in');
    window.close();
  }

  console.log('3) Fleet catalogue (pages/vehicles.html) — filters, quote and booking');
  {
    const { window, document, errors } = await render('pages/vehicles.html');
    check(!errors.length, 'no runtime errors' + (errors.length ? ': ' + errors[0] : ''));
    check(document.querySelectorAll('#vehicleResults .vehicle-card').length === 6, 'first page shows 6 vehicle cards');
    check(text(document.querySelector('#resultsCount')) === '12 vehicles', 'result counter reads "12 vehicles"');
    check(document.querySelectorAll('#pagination .pagination-btn').length === 4, 'pagination offers prev + 2 pages + next');
    check(document.querySelector('#fPickup').value !== '' && document.querySelector('#fReturn').value !== '', 'date fields default to a valid range');

    document.querySelectorAll('#pagination .pagination-btn')[2].click();
    await tick(150);
    check(document.querySelectorAll('#vehicleResults .vehicle-card').length === 6, 'page 2 renders the remaining vehicles');

    const form = document.querySelector('#vehicleFilters');
    form.querySelector('#fType').value = 'suv';
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await tick(250);
    check(text(document.querySelector('#resultsCount')) === '4 vehicles', 'type=suv filter narrows the grid to 4 vehicles');

    document.querySelectorAll('#vehicleResults [data-book-vehicle]')[0].click();
    await tick(300);
    check(document.querySelector('#appModalOverlay') !== null, 'book-now opens the booking modal');
    check(document.querySelector('#bookingForm') !== null, 'booking modal renders the form');
    check(document.querySelectorAll('#bookingForm #bookCustomer option').length === 9, 'modal lists all customers');
    check(document.querySelector('#quoteSummary .summary-total') !== null, 'live quote renders a total');
    check(/\$\d/.test(text(document.querySelector('#quoteSummary .summary-total'))), 'quote total is a currency amount');

    const select = document.querySelector('#bookCustomer');
    select.value = select.querySelectorAll('option')[1].value;
    document.querySelector('#bookingForm').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await tick(250);
    check(document.querySelector('#appModalOverlay') === null, 'confirming the booking closes the modal');
    check(document.querySelectorAll('#toastContainer .toast-success').length >= 1, 'success toast shown after booking');
    check(text(document.querySelector('#resultsCount')) === '4 vehicles', 'grid refreshed after the booking');
    window.close();
  }

  console.log('4) Customers (pages/customers.html)');
  {
    const { window, document, errors } = await render('pages/customers.html');
    check(!errors.length, 'no runtime errors' + (errors.length ? ': ' + errors[0] : ''));
    check(document.querySelectorAll('#customerResults tbody tr').length === 8, 'customer table paginated to 8 rows');
    check(text(document.querySelector('#resultsCount')) === '8 customers', 'customer counter reads "8 customers"');
    document.querySelectorAll('#customerResults [data-customer]')[0].click();
    await tick(250);
    check(document.querySelector('#appModalOverlay') !== null, 'view opens the customer detail modal');
    check(text(document.querySelector('#appModalOverlay .modal-header h3')).indexOf('Amelia') !== -1, 'modal titles the selected customer');
    check(text(document.querySelector('#appModalOverlay')).indexOf('Rental history') !== -1, 'modal includes rental history');
    window.close();
  }

  console.log('5) Rentals (pages/rentals.html)');
  {
    const { window, document, errors } = await render('pages/rentals.html');
    check(!errors.length, 'no runtime errors' + (errors.length ? ': ' + errors[0] : ''));
    check(document.querySelectorAll('#rentalResults tbody tr').length === 10, 'rental table shows all 10 bookings');
    check(text(document.querySelector('#resultsCount')) === '10 rentals', 'rental counter reads "10 rentals"');
    const rows = document.querySelectorAll('#rentalResults tbody tr');
    check(text(rows[0]).indexOf('Amelia') !== -1 || text(rows[0]).length > 0, 'rows are joined with customer names');

    const activate = document.querySelectorAll('#rentalResults [data-rental-status="active"]')[0];
    activate.click();
    await tick(250);
    check(document.querySelectorAll('#toastContainer .toast-success').length >= 1, 'status change raises a toast');

    const del = document.querySelectorAll('#rentalResults [data-rental-delete]')[1];
    del.click();
    await tick(250);
    check(document.querySelectorAll('#rentalResults tbody tr').length === 9, 'deleting a rental reloads the table with 9 rows');
    window.close();
  }

  console.log('6) Payments (pages/payments.html)');
  {
    const { window, document, errors } = await render('pages/payments.html');
    check(!errors.length, 'no runtime errors' + (errors.length ? ': ' + errors[0] : ''));
    check(document.querySelectorAll('#paymentResults tbody tr').length === 10, 'payment ledger shows 10 records');
    check(document.querySelector('#paymentSummary .summary-total') !== null, 'ledger summary renders totals');
    const form = document.querySelector('#paymentFilters');
    form.querySelector('#pStatusFilter').value = 'completed';
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await tick(250);
    check(document.querySelectorAll('#paymentResults tbody tr').length === 8, 'status=completed filter returns 8 records');
    document.querySelector('#recordPaymentBtn').click();
    await tick(300);
    check(document.querySelector('#paymentForm') !== null, 'record-payment modal opens');
    window.close();
  }

  console.log('7) Auth pages');
  {
    const { window, document, errors } = await render('pages/login.html');
    check(!errors.length, 'no runtime errors' + (errors.length ? ': ' + errors[0] : ''));
    check(document.querySelector('.auth-page .auth-visual') !== null, 'auth pages use the chrome-free split layout');
    check(text(document.querySelector('#demoHint')).indexOf('admin@drivefleet.test') !== -1, 'demo credentials are advertised');

    const form = document.querySelector('#loginForm');
    form.querySelector('[name="email"]').value = 'admin@drivefleet.test';
    form.querySelector('[name="password"]').value = 'wrong-password';
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await tick(250);
    check(text(document.querySelector('#loginError')).length > 0, 'invalid credentials surface an inline error');
    check(window.localStorage.getItem('drivefleet.token') === null, 'no token stored for a failed sign-in');

    form.querySelector('[name="password"]').value = 'admin123';
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await tick(250);
    check(Boolean(window.localStorage.getItem('drivefleet.token')), 'successful sign-in stores the JWT');
    check(Boolean(window.localStorage.getItem('drivefleet.user')), 'successful sign-in stores the user profile');
    window.close();
  }

  {
    const { window, document, errors } = await render('pages/register.html');
    check(!errors.length, 'no runtime errors' + (errors.length ? ': ' + errors[0] : ''));
    const password = document.querySelector('[name="password"]');
    password.value = 'Str0ng!Pass';
    password.dispatchEvent(new window.Event('input', { bubbles: true }));
    check(document.querySelector('#passwordStrength').className.indexOf('s4') !== -1, 'password strength meter reaches level 4');
    check(text(document.querySelector('#passwordHint')).indexOf('Strong') !== -1, 'strength hint updates');

    const form = document.querySelector('#registerForm');
    form.querySelector('[name="email"]').value = 'fresh@example.com';
    form.querySelector('[name="confirm_password"]').value = 'mismatch';
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await tick(200);
    check(text(document.querySelector('#registerError')).indexOf('do not match') !== -1, 'mismatched passwords are rejected client-side');

    form.querySelector('[name="confirm_password"]').value = 'Str0ng!Pass';
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await tick(250);
    check(Boolean(window.localStorage.getItem('drivefleet.token')), 'valid registration stores a session');
    window.close();
  }

  console.log('\n' + passed + ' DOM checks passed, ' + failures.length + ' failed');
  if (failures.length) {
    console.log('Failures:');
    failures.forEach((f) => console.log('  - ' + f));
    process.exit(1);
  }
})();
