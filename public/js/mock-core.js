/**
 * DriveFleet — mock backend logic
 * Pure functions that behave like the future Express controllers: filtering,
 * dynamic pricing, relational joins and CRUD. Keeping this isolated means the
 * real API can be dropped in without touching the UI layer.
 */
(function (window) {
  'use strict';

  var D = window.MockData;
  var seq = { vehicle: 100, customer: 100, rental: 2000, payment: 9000 };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function num(v) { var n = parseFloat(v); return isNaN(n) ? null : n; }
  function eq(a, b) { return String(a).toLowerCase() === String(b).toLowerCase(); }
  function includes(haystack, needle) {
    return String(haystack || '').toLowerCase().indexOf(String(needle).toLowerCase()) !== -1;
  }
  function round2(n) { return Math.round(n * 100) / 100; }

  /* --------------------------- Pricing engine -------------------------- */
  var TAX_RATE = 0.2;
  var LUXURY_SURCHARGE_RATE = 0.1;
  var LONG_RENTAL_DISCOUNT = { 7: 0.05, 14: 0.1, 30: 0.15 };
  var EXTRAS = {};
  D.extras.forEach(function (e) { EXTRAS[e.id] = e; });

  function daysBetween(pickup, ret) {
    if (!pickup || !ret) return 0;
    var a = new Date(pickup), b = new Date(ret);
    if (isNaN(a) || isNaN(b)) return 0;
    var diff = Math.round((b - a) / 86400000);
    return diff > 0 ? diff : 0;
  }

  /**
   * Dynamic booking calculation — the single source of truth for pricing.
   *   daily rate x days
   * + extras per day
   * + luxury surcharge (10% on base)
   * - duration discount (5% / 10% / 15%)
   * + tax (20%)
   */
  function quote(input) {
    input = input || {};
    var vehicle = input.vehicle || vehicleById(input.vehicle_id);
    if (!vehicle) return { error: 'Vehicle not found' };

    var days = daysBetween(input.pickup_date, input.return_date);
    if (days <= 0) return { error: 'Return date must be after the pick-up date' };

    var dailyRate = num(input.daily_rate) || vehicle.price_per_day;
    var base = dailyRate * days;

    var extrasDetail = (input.extras || []).map(function (id) {
      var e = EXTRAS[id];
      if (!e) return null;
      return { id: e.id, label: e.label, price_per_day: e.price_per_day, total: e.price_per_day * days };
    }).filter(Boolean);

    var extrasTotal = extrasDetail.reduce(function (sum, e) { return sum + e.total; }, 0);
    var luxurySurcharge = vehicle.type === 'luxury' ? base * LUXURY_SURCHARGE_RATE : 0;

    var discountRate = 0;
    Object.keys(LONG_RENTAL_DISCOUNT)
      .map(Number)
      .sort(function (a, b) { return b - a; })
      .forEach(function (threshold) {
        if (days >= threshold && discountRate === 0) discountRate = LONG_RENTAL_DISCOUNT[threshold];
      });

    var preDiscount = base + extrasTotal + luxurySurcharge;
    var discountAmount = preDiscount * discountRate;
    var subtotal = preDiscount - discountAmount;
    var taxAmount = subtotal * TAX_RATE;
    var deposit = Math.round((base * 0.25) / 10) * 10;

    return {
      vehicle_id: vehicle.id,
      vehicle_name: vehicle.brand + ' ' + vehicle.model,
      days: days,
      daily_rate: dailyRate,
      base_amount: round2(base),
      extras: extrasDetail,
      extras_amount: round2(extrasTotal),
      luxury_surcharge: round2(luxurySurcharge),
      discount_rate: discountRate,
      discount_amount: round2(discountAmount),
      subtotal: round2(subtotal),
      tax_rate: TAX_RATE,
      tax_amount: round2(taxAmount),
      deposit: deposit,
      total_amount: round2(subtotal + taxAmount)
    };
  }

  /* ---------------------------- Availability --------------------------- */
  /**
   * A vehicle is unavailable when an overlapping active/reserved rental
   * exists — same date-range overlap test the SQL backend will run.
   */
  function isAvailable(vehicleId, pickup, ret, ignoreRentalId) {
    if (!pickup || !ret) return true;
    return !D.rentals.some(function (r) {
      if (r.vehicle_id !== Number(vehicleId)) return false;
      if (r.id === Number(ignoreRentalId)) return false;
      if (r.status !== 'active' && r.status !== 'reserved') return false;
      return new Date(pickup) <= new Date(r.return_date) && new Date(ret) >= new Date(r.pickup_date);
    });
  }

  /* ------------------------- Domain helpers ---------------------------- */
  function customerById(id) {
    return D.customers.filter(function (c) { return c.id === Number(id); })[0] || null;
  }

  function vehicleById(id) {
    return D.vehicles.filter(function (v) { return v.id === Number(id); })[0] || null;
  }

  function decorateVehicle(v) {
    var out = clone(v);
    out.name = v.brand + ' ' + v.model;
    out.type_label = v.type.charAt(0).toUpperCase() + v.type.slice(1);
    out.status_label = v.status.charAt(0).toUpperCase() + v.status.slice(1);
    return out;
  }

  function decorateRental(r) {
    var out = clone(r);
    var c = customerById(r.customer_id);
    var v = vehicleById(r.vehicle_id);
    out.customer_name = c ? c.first_name + ' ' + c.last_name : 'Unknown customer';
    out.customer_email = c ? c.email : '';
    out.vehicle_name = v ? v.brand + ' ' + v.model : 'Unknown vehicle';
    out.vehicle_plate = v ? v.plate : '';
    out.vehicle_type = v ? v.type : '';
    out.paid_amount = D.payments
      .filter(function (p) { return p.rental_id === r.id && p.status === 'completed'; })
      .reduce(function (s, p) { return s + p.amount; }, 0);
    out.balance = round2(out.total_amount - out.paid_amount);
    return out;
  }

  function decoratePayment(p) {
    var out = clone(p);
    var r = D.rentals.filter(function (x) { return x.id === p.rental_id; })[0];
    if (r) {
      var d = decorateRental(r);
      out.customer_name = d.customer_name;
      out.vehicle_name = d.vehicle_name;
      out.rental_status = r.status;
    }
    return out;
  }

  /* ------------------------- Vehicle filtering ------------------------- */
  /**
   * Dynamic vehicle filtering: type, price range, availability, search text,
   * branch, seats and sorting — every filter optional and freely combinable.
   */
  function filterVehicles(filters) {
    filters = filters || {};
    var pickup = filters.pickup_date;
    var ret = filters.return_date;
    var rows = D.vehicles.map(decorateVehicle);

    if (filters.type) rows = rows.filter(function (v) { return eq(v.type, filters.type); });
    if (filters.branch) rows = rows.filter(function (v) { return eq(v.branch, filters.branch); });
    if (filters.status) rows = rows.filter(function (v) { return eq(v.status, filters.status); });
    if (filters.transmission) rows = rows.filter(function (v) { return eq(v.transmission, filters.transmission); });
    if (filters.fuel) rows = rows.filter(function (v) { return eq(v.fuel, filters.fuel); });

    var minPrice = num(filters.min_price);
    var maxPrice = num(filters.max_price);
    if (minPrice !== null) rows = rows.filter(function (v) { return v.price_per_day >= minPrice; });
    if (maxPrice !== null) rows = rows.filter(function (v) { return v.price_per_day <= maxPrice; });

    var minSeats = num(filters.seats);
    if (minSeats !== null) rows = rows.filter(function (v) { return v.seats >= minSeats; });

    if (filters.search) {
      rows = rows.filter(function (v) {
        return includes(v.brand, filters.search) || includes(v.model, filters.search) ||
          includes(v.plate, filters.search) || includes(v.type, filters.search) ||
          includes(v.name, filters.search);
      });
    }

    if (String(filters.available_only) === 'true' || filters.available_only === true) {
      rows = rows.filter(function (v) {
        return v.status === 'available' && isAvailable(v.id, pickup, ret);
      });
    }

    if (pickup && ret) {
      rows = rows.map(function (v) {
        v.available = v.status === 'available' && isAvailable(v.id, pickup, ret);
        return v;
      });
    }

    rows = sortVehicles(rows, filters.sort);
    return { data: rows, total: rows.length, filters: filters };
  }

  function sortVehicles(rows, sort) {
    var copy = rows.slice();
    switch (sort) {
      case 'price_asc': return copy.sort(function (a, b) { return a.price_per_day - b.price_per_day; });
      case 'price_desc': return copy.sort(function (a, b) { return b.price_per_day - a.price_per_day; });
      case 'rating': return copy.sort(function (a, b) { return b.rating - a.rating; });
      case 'year': return copy.sort(function (a, b) { return b.year - a.year; });
      case 'name': return copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
      default: return copy.sort(function (a, b) { return a.id - b.id; });
    }
  }

  /* --------------------- Customer / rental filters --------------------- */
  function filterCustomers(filters) {
    filters = filters || {};
    var rows = D.customers.map(clone);
    if (filters.search) {
      rows = rows.filter(function (c) {
        var name = c.first_name + ' ' + c.last_name;
        return includes(name, filters.search) || includes(c.email, filters.search) ||
          includes(c.phone, filters.search) || includes(c.licence_number, filters.search);
      });
    }
    if (filters.status) rows = rows.filter(function (c) { return eq(c.status, filters.status); });
    if (filters.city) rows = rows.filter(function (c) { return eq(c.city, filters.city); });
    return { data: rows, total: rows.length };
  }

  function filterRentals(filters) {
    filters = filters || {};
    var rows = D.rentals.map(decorateRental);
    if (filters.status) rows = rows.filter(function (r) { return eq(r.status, filters.status); });
    if (filters.payment_status) rows = rows.filter(function (r) { return eq(r.payment_status, filters.payment_status); });
    if (filters.customer_id) rows = rows.filter(function (r) { return r.customer_id === Number(filters.customer_id); });
    if (filters.vehicle_id) rows = rows.filter(function (r) { return r.vehicle_id === Number(filters.vehicle_id); });
    if (filters.search) {
      rows = rows.filter(function (r) {
        return includes(r.customer_name, filters.search) || includes(r.vehicle_name, filters.search) ||
          includes(String(r.id), filters.search) || includes(r.vehicle_plate, filters.search);
      });
    }
    rows.sort(function (a, b) { return b.id - a.id; });
    return { data: rows, total: rows.length };
  }

  function filterPayments(filters) {
    filters = filters || {};
    var rows = D.payments.map(decoratePayment);
    if (filters.status) rows = rows.filter(function (p) { return eq(p.status, filters.status); });
    if (filters.method) rows = rows.filter(function (p) { return eq(p.method, filters.method); });
    if (filters.type) rows = rows.filter(function (p) { return eq(p.type, filters.type); });
    if (filters.rental_id) rows = rows.filter(function (p) { return p.rental_id === Number(filters.rental_id); });
    if (filters.search) {
      rows = rows.filter(function (p) {
        return includes(p.reference, filters.search) || includes(p.customer_name, filters.search) ||
          includes(p.vehicle_name, filters.search);
      });
    }
    rows.sort(function (a, b) { return b.id - a.id; });
    return { data: rows, total: rows.length };
  }

  /* ------------------------- Dashboard overview ------------------------ */
  function overview() {
    var rentals = D.rentals.map(decorateRental);
    var revenue = D.payments
      .filter(function (p) { return p.status === 'completed'; })
      .reduce(function (s, p) { return s + p.amount; }, 0);
    var outstanding = rentals.reduce(function (s, r) { return s + Math.max(r.balance, 0); }, 0);
    var rented = D.vehicles.filter(function (v) { return v.status === 'rented'; }).length;

    return {
      vehicles_total: D.vehicles.length,
      vehicles_available: D.vehicles.filter(function (v) { return v.status === 'available'; }).length,
      vehicles_rented: rented,
      vehicles_maintenance: D.vehicles.filter(function (v) { return v.status === 'maintenance'; }).length,
      customers_total: D.customers.length,
      rentals_total: rentals.length,
      rentals_active: rentals.filter(function (r) { return r.status === 'active'; }).length,
      rentals_reserved: rentals.filter(function (r) { return r.status === 'reserved'; }).length,
      rentals_completed: rentals.filter(function (r) { return r.status === 'completed'; }).length,
      revenue_total: round2(revenue),
      outstanding_total: round2(outstanding),
      fleet_utilisation: Math.round((rented / D.vehicles.length) * 100),
      recent_rentals: rentals.sort(function (a, b) { return b.id - a.id; }).slice(0, 5)
    };
  }

  window.MockLogic = {
    quote: quote,
    daysBetween: daysBetween,
    isAvailable: isAvailable,
    filterVehicles: filterVehicles,
    filterCustomers: filterCustomers,
    filterRentals: filterRentals,
    filterPayments: filterPayments,
    sortVehicles: sortVehicles,
    decorateVehicle: decorateVehicle,
    decorateRental: decorateRental,
    decoratePayment: decoratePayment,
    customerById: customerById,
    vehicleById: vehicleById,
    overview: overview,
    round2: round2,
    nextId: function (kind) { seq[kind] += 1; return seq[kind]; },
    TAX_RATE: TAX_RATE
  };
})(window);


/* --------------------------------------------------------------------------
   MockApi — service facade.
   Combines MockLogic (filters, pricing, joins) with CRUD, auth and reset so
   the browser behaves exactly like the future Express + MySQL backend.
   js/mock-api.js adapts this to the public REST shapes; js/api.js falls back
   to it whenever the real server is unreachable.
   -------------------------------------------------------------------------- */
(function (window) {
  'use strict';

  var L = window.MockLogic;
  var D = window.MockData;

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  /* Ids are derived from the data itself so freshly created rows can never
     collide with the seeded ones (seed rentals already occupy 2001+). */
  var COLLECTIONS = { vehicle: 'vehicles', customer: 'customers', rental: 'rentals', payment: 'payments' };

  function nextId(kind) {
    var rows = D[COLLECTIONS[kind]] || [];
    var max = 0;
    rows.forEach(function (row) {
      var value = Number(row.id);
      if (!isNaN(value) && value > max) { max = value; }
    });
    return max + 1;
  }

  function find(collection, id) {
    return collection.filter(function (row) { return String(row.id) === String(id); })[0] || null;
  }
  function today() { return new Date().toISOString().slice(0, 10); }

  /* ------------------------------ Vehicles ----------------------------- */

  function createVehicle(payload) {
    var row = Object.assign({
      id: nextId('vehicle'),
      brand: 'New', model: 'Vehicle', year: new Date().getFullYear(),
      type: 'sedan', plate: 'DF-0000', seats: 5, transmission: 'Automatic',
      fuel: 'Petrol', price_per_day: 50, mileage: 0, status: 'available',
      branch: 'Downtown Branch', rating: 4.5, image: '', features: []
    }, payload || {});
    row.id = payload && payload.id ? Number(payload.id) : row.id;
    D.vehicles.push(row);
    return L.decorateVehicle(row);
  }

  function updateVehicle(id, payload) {
    var row = find(D.vehicles, id);
    if (!row) return null;
    Object.keys(payload || {}).forEach(function (k) {
      if (k !== 'id') row[k] = payload[k];
    });
    return L.decorateVehicle(row);
  }

  function removeVehicle(id) {
    var idx = D.vehicles.findIndex(function (v) { return String(v.id) === String(id); });
    if (idx === -1) return { removed: false };
    D.vehicles.splice(idx, 1);
    return { removed: true, id: Number(id) };
  }

  /* ----------------------------- Customers ----------------------------- */

  function createCustomer(payload) {
    var row = Object.assign({
      id: nextId('customer'), first_name: 'New', last_name: 'Customer',
      email: 'customer' + Date.now() + '@example.com', phone: '',
      licence_number: '', city: 'Lisbon', country: 'Portugal',
      status: 'new', created_at: today()
    }, payload || {});
    row.id = payload && payload.id ? Number(payload.id) : row.id;
    D.customers.push(row);
    return clone(row);
  }

  function updateCustomer(id, payload) {
    var row = find(D.customers, id);
    if (!row) return null;
    Object.keys(payload || {}).forEach(function (k) {
      if (k !== 'id') row[k] = payload[k];
    });
    return clone(row);
  }

  function removeCustomer(id) {
    var idx = D.customers.findIndex(function (c) { return String(c.id) === String(id); });
    if (idx === -1) return { removed: false };
    D.customers.splice(idx, 1);
    return { removed: true, id: Number(id) };
  }
  /* ------------------------------ Rentals ------------------------------ */

  function createRental(payload) {
    var input = payload || {};
    var priced = L.quote({
      vehicle_id: input.vehicle_id,
      pickup_date: input.pickup_date,
      return_date: input.return_date,
      extras: input.extras || [],
      daily_rate: input.daily_rate
    });

    var row = {
      id: input.id ? Number(input.id) : nextId('rental'),
      customer_id: Number(input.customer_id) || 0,
      vehicle_id: Number(input.vehicle_id) || 0,
      pickup_date: input.pickup_date || '',
      return_date: input.return_date || '',
      status: input.status || 'pending',
      payment_status: input.payment_status || 'pending',
      total_amount: priced && priced.total_amount ? priced.total_amount : Number(input.total_amount) || 0,
      pickup_branch: input.pickup_branch || '',
      notes: input.notes || ''
    };

    D.rentals.push(row);
    if (row.status === 'active') { updateVehicle(row.vehicle_id, { status: 'rented' }); }
    return L.decorateRental(row);
  }

  function updateRental(id, payload) {
    var row = find(D.rentals, id);
    if (!row) return null;
    Object.keys(payload || {}).forEach(function (k) {
      if (k !== 'id') row[k] = payload[k];
    });
    if (payload && payload.status === 'completed') {
      updateVehicle(row.vehicle_id, { status: 'available' });
    }
    return L.decorateRental(row);
  }

  function removeRental(id) {
    var idx = D.rentals.findIndex(function (r) { return String(r.id) === String(id); });
    if (idx === -1) return { removed: false };
    D.rentals.splice(idx, 1);
    return { removed: true, id: Number(id) };
  }

  /* ------------------------------ Payments ----------------------------- */

  function createPayment(payload) {
    var input = payload || {};
    var row = {
      id: input.id ? Number(input.id) : nextId('payment'),
      rental_id: Number(input.rental_id) || 0,
      amount: Number(input.amount) || 0,
      method: input.method || 'card',
      type: input.type || 'rental',
      status: input.status || 'pending',
      reference: input.reference || 'PAY-' + Date.now(),
      paid_at: input.paid_at || today()
    };
    D.payments.push(row);

    var rental = find(D.rentals, row.rental_id);
    if (rental) {
      var paid = D.payments
        .filter(function (p) { return p.rental_id === rental.id && p.status === 'completed'; })
        .reduce(function (s, p) { return s + p.amount; }, 0);
      rental.payment_status = paid >= rental.total_amount ? 'completed' : 'pending';
    }
    return clone(row);
  }

  function updatePayment(id, payload) {
    var row = find(D.payments, id);
    if (!row) return null;
    Object.keys(payload || {}).forEach(function (k) {
      if (k !== 'id') row[k] = payload[k];
    });
    return clone(row);
  }

  function removePayment(id) {
    var idx = D.payments.findIndex(function (p) { return String(p.id) === String(id); });
    if (idx === -1) return { removed: false };
    D.payments.splice(idx, 1);
    return { removed: true, id: Number(id) };
  }
  /* -------------------------------- Auth ------------------------------- */

  /* Seeded demo accounts. The real backend hashes these with bcrypt — the
     mock keeps them in memory so the UI can be exercised without a server. */
  var accounts = [
    { id: 1, username: 'admin', email: 'admin@drivefleet.test', password: 'admin123', role: 'admin', name: 'Fleet Admin' },
    { id: 2, username: 'amelia', email: 'amelia.moreau@example.com', password: 'customer123', role: 'customer', name: 'Amelia Moreau' }
  ];
  var session = null;

  function login(credentials) {
    var input = credentials || {};
    var identifier = String(input.email || input.username || '').toLowerCase();
    var account = accounts.filter(function (a) {
      return a.email.toLowerCase() === identifier || a.username.toLowerCase() === identifier;
    })[0];

    if (!account || account.password !== input.password) {
      return { error: 'Invalid credentials', status: 401 };
    }
    session = { id: account.id, name: account.name, email: account.email, username: account.username, role: account.role };
    return { token: 'mock-token-' + account.id + '-' + Date.now(), user: clone(session) };
  }

  function register(payload) {
    var input = payload || {};
    var email = String(input.email || '').toLowerCase();
    if (!email || !input.password) { return { error: 'Email and password are required', status: 422 }; }
    if (accounts.some(function (a) { return a.email.toLowerCase() === email; })) {
      return { error: 'An account with this email already exists', status: 409 };
    }

    var account = {
      id: accounts.length + 1,
      username: input.username || email.split('@')[0],
      email: email,
      password: input.password,
      role: 'customer',
      name: ((input.first_name || '') + ' ' + (input.last_name || '')).trim() || email
    };
    accounts.push(account);
    session = { id: account.id, name: account.name, email: account.email, username: account.username, role: account.role };
    return { token: 'mock-token-' + account.id + '-' + Date.now(), user: clone(session) };
  }

  function currentUser() { return session ? clone(session) : null; }

  /* -------------------------------- Reset ------------------------------ */

  /* Restores every collection in place so existing references stay valid. */
  function reset() {
    var seed = D.seed();
    Object.keys(seed).forEach(function (key) {
      var target = D[key];
      if (!Array.isArray(target)) return;
      target.length = 0;
      seed[key].forEach(function (row) { target.push(row); });
    });
    session = null;
    return { ok: true, vehicles: D.vehicles.length, customers: D.customers.length, rentals: D.rentals.length };
  }

  /* ------------------------------- Export ----------------------------- */

  window.MockApi = {
    data: D,
    currencies: D.currencies,
    branches: D.branches,
    extras: D.extras,

    vehicles: {
      filter: L.filterVehicles,
      list: L.filterVehicles,
      get: L.vehicleById,
      create: createVehicle,
      update: updateVehicle,
      remove: removeVehicle
    },
    filterVehicles: L.filterVehicles,
    findVehicle: L.vehicleById,
    createVehicle: createVehicle,
    updateVehicle: updateVehicle,
    removeVehicle: removeVehicle,

    customers: {
      filter: L.filterCustomers,
      list: L.filterCustomers,
      get: L.customerById,
      create: createCustomer,
      update: updateCustomer,
      remove: removeCustomer
    },
    filterCustomers: L.filterCustomers,
    findCustomer: L.customerById,
    createCustomer: createCustomer,
    updateCustomer: updateCustomer,
    removeCustomer: removeCustomer,

    rentals: {
      filter: L.filterRentals,
      list: L.filterRentals,
      get: function (id) { return find(D.rentals, id) ? L.decorateRental(find(D.rentals, id)) : null; },
      create: createRental,
      update: updateRental,
      remove: removeRental,
      quote: L.quote
    },
    filterRentals: L.filterRentals,
    findRental: function (id) { var r = find(D.rentals, id); return r ? L.decorateRental(r) : null; },
    createRental: createRental,
    updateRental: updateRental,
    removeRental: removeRental,
    quote: L.quote,

    payments: {
      filter: L.filterPayments,
      list: L.filterPayments,
      get: function (id) { return find(D.payments, id); },
      create: createPayment,
      update: updatePayment,
      remove: removePayment
    },
    filterPayments: L.filterPayments,
    findPayment: function (id) { return find(D.payments, id); },
    createPayment: createPayment,
    updatePayment: updatePayment,
    removePayment: removePayment,

    stats: { overview: L.overview },
    overview: L.overview,
    decorateRental: L.decorateRental,
    decoratePayment: L.decoratePayment,
    decorateVehicle: L.decorateVehicle,

    auth: { login: login, register: register, me: currentUser },
    login: login,
    register: register,
    currentUser: currentUser,

    reset: reset
  };

  window.MockLogic.data = D;
})(window);
