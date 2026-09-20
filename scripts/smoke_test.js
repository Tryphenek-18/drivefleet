/**
 * smoke_test.js — headless smoke test for the DriveFleet frontend layer.
 *
 * Runs the data/mock/API stack (data.js -> mock-core.js -> mock-api.js ->
 * api.js) inside a Node VM sandbox with a fake `window` whose fetch always
 * fails, which is exactly the offline path the browser takes. It then asserts
 * the REST contract the future Express backend must satisfy, and verifies that
 * every DOM id the scripts expect is present in the HTML pages.
 *
 * Usage: node scripts/smoke_test.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const JS = path.join(ROOT, 'public', 'js');
const PUBLIC = path.join(ROOT, 'public');

let passed = 0;
const failures = [];

function check(condition, label) {
  if (condition) { passed += 1; console.log('  ok   ' + label); }
  else { failures.push(label); console.log('  FAIL ' + label); }
}

/* ------------------------- Sandbox construction ------------------------ */

const storage = new Map();
const sandbox = {
  console,
  setTimeout, clearTimeout, setInterval, clearInterval,
  Promise, JSON, Date, Math, Number, String, Boolean, Object, Array, RegExp,
  Error, TypeError, Intl, URLSearchParams, isNaN, parseFloat, parseInt,
  fetch: (url) => Promise.reject(new TypeError('fetch failed (offline smoke test): ' + url)),
  AbortController,
  localStorage: {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k)
  }
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

['data.js', 'mock-core.js', 'mock-api.js', 'api.js'].forEach((file) => {
  const source = fs.readFileSync(path.join(JS, file), 'utf8');
  vm.runInContext(source, sandbox, { filename: file });
});

const api = sandbox.DriveFleetApi;
const MockData = sandbox.MockData;

/* ------------------------------ Assertions ----------------------------- */

(async function run() {
  console.log('1) Seed data (mock database)');
  check(MockData && MockData.vehicles.length === 12, 'data.js exposes 12 vehicles');
  check(MockData.customers.length === 8, 'data.js exposes 8 customers');
  check(MockData.rentals.length === 10, 'data.js exposes 10 rentals');
  check(MockData.payments.length === 10, 'data.js exposes 10 payments');
  check(MockData.branches.length === 3 && MockData.extras.length === 4, 'branches + extras seeded');
  check(sandbox.MockApi && sandbox.MockApiEx, 'mock-core.js -> MockApi and mock-api.js -> MockApiEx registered');
  check(typeof api === 'object' && typeof api.vehicles.list === 'function', 'api.js exposes window.DriveFleetApi');

  console.log('2) Vehicles endpoint (offline fallback path)');
  const all = await api.vehicles.list({});
  check(Array.isArray(all) && all.length === 12, 'GET /vehicles -> 12 rows');
  const suvs = await api.vehicles.list({ type: 'suv' });
  check(suvs.length === 4, 'filter type=suv -> 4 rows');
  const cheap = await api.vehicles.list({ max_price: 80 });
  check(cheap.every((v) => v.price_per_day <= 80) && cheap.length > 0, 'filter max_price=80 respected');
  const sorted = await api.vehicles.list({ sort: 'price_asc' });
  check(sorted[0].price_per_day <= sorted[sorted.length - 1].price_per_day, 'sort=price_asc orders rows');
  const one = await api.vehicles.get(1);
  check(one && one.id === 1 && one.plate === 'DF-1042', 'GET /vehicles/1 returns the Tesla');

  console.log('3) Customers, rentals and payments');
  const customers = await api.customers.list({ search: 'amelia' });
  check(customers.length === 1 && customers[0].last_name === 'Moreau', 'customer search finds Amelia Moreau');
  const rentals = await api.rentals.list({ status: 'active' });
  check(rentals.length === 2, 'rentals filtered by status=active -> 2');
  check(rentals[0].customer_name && rentals[0].vehicle_name, 'rentals are joined with customer + vehicle names');
  const payments = await api.payments.list({ status: 'pending' });
  check(payments.length === 1 && payments[0].reference === 'PAY-9009', 'payments filtered by status=pending');

  console.log('4) Dynamic pricing engine (POST /rentals/quote)');
  const quote = await api.rentals.quote({ vehicle_id: 1, pickup_date: '2026-01-01', return_date: '2026-01-08', extras: ['gps'] });
  check(quote && quote.days === 7, 'quote computes 7 days');
  check(Math.abs(quote.base_amount - 672) < 0.01, 'base amount = 96 x 7 = 672');
  check(quote.discount_rate === 0.05, '7-day rental gets the 5% long-rental discount');
  check(Math.abs(quote.total_amount - (quote.subtotal + quote.tax_amount)) < 0.01, 'total = subtotal + 20% VAT');
  const badQuote = await api.rentals.quote({ vehicle_id: 1, pickup_date: '2026-02-10', return_date: '2026-02-08' });
  check(badQuote && badQuote.error, 'quote rejects an inverted date range');

  console.log('5) Writes: create rental + payment recalculation');
  const created = await api.rentals.create({
    customer_id: 1, vehicle_id: 2, pickup_date: '2026-03-02', return_date: '2026-03-05',
    extras: ['child_seat'], pickup_branch: 'Airport Hub', status: 'reserved'
  });
  check(created && created.id && created.total_amount > 0, 'POST /rentals creates a rental with a computed total');
  check(created.customer_name === 'Amelia Moreau', 'created rental is joined with its customer');
  const afterCreate = await api.rentals.list({});
  check(afterCreate.length === 11, 'rental list grew to 11 rows');

  const payment = await api.payments.create({ rental_id: 2006, amount: 572.8, method: 'card', type: 'rental', status: 'completed' });
  check(payment && payment.reference && payment.reference.indexOf('PAY-') === 0, 'POST /payments creates a reference');
  const updatedRental = await api.rentals.get(2006);
  check(updatedRental.payment_status === 'completed', 'rental payment status flips to completed once paid in full');

  console.log('6) Vehicle availability + status transitions');
  const bookedVehicle = await api.rentals.create({ customer_id: 3, vehicle_id: 4, pickup_date: '2026-04-01', return_date: '2026-04-04', status: 'active' });
  check(bookedVehicle.status === 'active', 'new rental can start as active');
  const vehicle = await api.vehicles.get(4);
  check(vehicle.status === 'rented', 'starting a rental marks the vehicle as rented');
  await api.rentals.update(bookedVehicle.id, { status: 'completed' });
  const freed = await api.vehicles.get(4);
  check(freed.status === 'available', 'completing a rental releases the vehicle');

  console.log('7) Auth flow (mock mirror of bcrypt + JWT backend)');
  const bad = await api.auth.login({ email: 'admin@drivefleet.test', password: 'wrong' });
  check(bad && bad.error, 'wrong password is rejected');
  const session = await api.auth.login({ email: 'admin@drivefleet.test', password: 'admin123' });
  check(session && session.token && session.user.role === 'admin', 'valid admin credentials return a token');
  api.auth.setToken(session.token);
  api.auth.setUser(session.user);
  check(api.auth.isAuthenticated() === true, 'token is persisted to storage');
  const registered = await api.auth.register({ email: 'new.driver@example.com', password: 'Secret123!', first_name: 'New', last_name: 'Driver' });
  check(registered && registered.token, 'register issues a session for a fresh account');
  api.auth.clear();
  check(api.auth.isAuthenticated() === false, 'logout clears the session');

  console.log('8) Dashboard stats + mock reset');
  const overview = await api.stats.overview();
  check(overview.vehicles_total === 12 && overview.customers_total === 8, 'stats overview counts the fleet');
  check(typeof overview.fleet_utilisation === 'number' && overview.recent_rentals.length === 5, 'utilisation + 5 recent rentals');
  api.resetDb();
  const reset = await api.vehicles.list({});
  check(reset.length === 12, 'resetDb restores the seed fleet');

  console.log('9) HTML contract: containers required by main.js');
  const pages = {
    'index.html': ['featuredVehicles', 'heroSearchForm', 'site-navbar', 'mobile-menu', 'siteFooter', 'toastContainer'],
    'pages/dashboard.html': ['statStrip', 'recentRentals', 'fleetStatus', 'siteSidebar', 'siteTopbar'],
    'pages/vehicles.html': ['vehicleResults', 'vehicleFilters', 'resultsCount', 'pagination'],
    'pages/customers.html': ['customerResults', 'customerFilters'],
    'pages/rentals.html': ['rentalResults', 'rentalFilters'],
    'pages/payments.html': ['paymentResults', 'paymentFilters', 'paymentSummary'],
    'pages/login.html': ['loginForm', 'loginError'],
    'pages/register.html': ['registerForm', 'registerError', 'passwordStrength']
  };
  Object.keys(pages).forEach((file) => {
    const html = fs.readFileSync(path.join(PUBLIC, file), 'utf8');
    const missing = pages[file].filter((id) => html.indexOf('id="' + id + '"') === -1);
    check(missing.length === 0, file + ' provides ' + pages[file].length + ' required ids' + (missing.length ? ' (missing: ' + missing.join(', ') + ')' : ''));
    check(html.indexOf('data-page=') !== -1, file + ' declares data-page for the router');
  });

  const bundle = fs.readFileSync(path.join(JS, 'app.js'), 'utf8');
  check(bundle.indexOf('window.DriveFleetInit') !== -1 && bundle.indexOf('window.MockApi =') !== -1, 'app.js bundle contains the service + router globals');

  console.log('\n' + passed + ' checks passed, ' + failures.length + ' failed');
  if (failures.length) {
    console.log('Failures:');
    failures.forEach((f) => console.log('  - ' + f));
    process.exit(1);
  }
})();
