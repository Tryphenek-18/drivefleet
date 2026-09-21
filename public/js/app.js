/* ==== source: js/data.js ==== */
/**
 * data.js — DriveFleet seed dataset (the in-browser mock database).
 *
 * Shapes mirror the future MySQL schema:
 *   vehicles(id, brand, model, year, type, plate, seats, transmission, fuel,
 *            price_per_day, mileage, status, branch, rating, image, features)
 *   customers(id, first_name, last_name, email, phone, licence_number, city,
 *             country, status, created_at)
 *   rentals(id, customer_id, vehicle_id, pickup_date, return_date, status,
 *           payment_status, total_amount, pickup_branch, notes)
 *   payments(id, rental_id, amount, method, type, status, reference, paid_at)
 *   branches(id, name, city, address, phone)
 *   extras(id, label, price_per_day)
 *
 * Exposes `window.MockData` (consumed by mock-core.js) plus the UI alias
 * `window.DriveFleetData`.
 */
(function (window) {
  'use strict';

  var VEHICLE_TYPES = ['sedan', 'suv', 'hatchback', 'pickup', 'van', 'luxury'];
  var VEHICLE_STATUS = ['available', 'rented', 'maintenance', 'reserved'];
  var RENTAL_STATUS = ['pending', 'reserved', 'active', 'completed', 'cancelled', 'overdue'];
  var PAYMENT_STATUS = ['pending', 'completed', 'refunded', 'failed'];
  var PAYMENT_METHODS = ['card', 'cash', 'bank_transfer', 'paypal'];
  var PAYMENT_TYPES = ['deposit', 'rental', 'refund', 'penalty'];
  var TRANSMISSIONS = ['Automatic', 'Manual'];
  var FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
  var CUSTOMER_STATUS = ['active', 'new', 'blocked'];
  var CURRENCIES = ['USD', 'EUR', 'GBP'];

  /* ---------------------------- Branches ---------------------------- */

  var branches = [
    { id: 1, name: 'Downtown Branch', city: 'Lisbon', address: '24 Avenida da Liberdade', phone: '+351 210 555 100' },
    { id: 2, name: 'Airport Hub', city: 'Porto', address: 'Terminal 2, Arrivals Hall', phone: '+351 220 555 200' },
    { id: 3, name: 'North Depot', city: 'Braga', address: '17 Rua Industrial Norte', phone: '+351 253 555 300' }
  ];

  /* ----------------------------- Extras ----------------------------- */

  var extras = [
    { id: 'gps', label: 'GPS navigation', price_per_day: 8 },
    { id: 'child_seat', label: 'Child seat', price_per_day: 6 },
    { id: 'extra_driver', label: 'Additional driver', price_per_day: 12 },
    { id: 'insurance_plus', label: 'Full insurance cover', price_per_day: 18 }
  ];

  /* ---------------------------- Vehicles ---------------------------- */

  var vehicles = [
    { id: 1, brand: 'Tesla', model: 'Model 3 Long Range', year: 2024, type: 'sedan', plate: 'DF-1042', seats: 5, transmission: 'Automatic', fuel: 'Electric', price_per_day: 96, mileage: 18420, status: 'available', branch: 'Downtown Branch', rating: 4.9, image: 'tesla-model-3.webp', features: ['Autopilot', 'Heated seats', 'Fast charging', 'Apple CarPlay'] },
    { id: 2, brand: 'Toyota', model: 'RAV4 Hybrid AWD', year: 2023, type: 'suv', plate: 'DF-2210', seats: 5, transmission: 'Automatic', fuel: 'Hybrid', price_per_day: 84, mileage: 43180, status: 'available', branch: 'Airport Hub', rating: 4.7, image: 'toyota-rav4.webp', features: ['All-wheel drive', 'Roof rails', 'Adaptive cruise', 'Rear camera'] },
    { id: 3, brand: 'Volkswagen', model: 'Golf GTI', year: 2023, type: 'hatchback', plate: 'DF-3387', seats: 5, transmission: 'Manual', fuel: 'Petrol', price_per_day: 58, mileage: 29740, status: 'rented', branch: 'Downtown Branch', rating: 4.6, image: 'volkswagen-golf-gti.webp', features: ['Sport seats', 'Digital cockpit', 'LED headlights'] },
    { id: 4, brand: 'Ford', model: 'F-150 Lariat', year: 2022, type: 'pickup', plate: 'DF-4412', seats: 5, transmission: 'Automatic', fuel: 'Diesel', price_per_day: 112, mileage: 68250, status: 'available', branch: 'North Depot', rating: 4.8, image: 'ford-f-150.webp', features: ['Tow hitch', 'Bed liner', '360 camera', 'Trailer brake'] },
    { id: 5, brand: 'Mercedes-Benz', model: 'E-Class 300de', year: 2024, type: 'luxury', plate: 'DF-5501', seats: 5, transmission: 'Automatic', fuel: 'Hybrid', price_per_day: 168, mileage: 9260, status: 'reserved', branch: 'Downtown Branch', rating: 5.0, image: 'mercedes-e-class.webp', features: ['Nappa leather', 'Burmester audio', 'Massage seats', 'Ambient lighting'] },
    { id: 6, brand: 'Renault', model: 'Trafic L2H1', year: 2022, type: 'van', plate: 'DF-6619', seats: 3, transmission: 'Manual', fuel: 'Diesel', price_per_day: 76, mileage: 81500, status: 'maintenance', branch: 'North Depot', rating: 4.3, image: 'renault-trafic.webp', features: ['8 m3 cargo', 'Shelving', 'Rear doors', 'Bluetooth'] },
    { id: 7, brand: 'Hyundai', model: 'Tucson Plug-in', year: 2024, type: 'suv', plate: 'DF-7723', seats: 5, transmission: 'Automatic', fuel: 'Hybrid', price_per_day: 92, mileage: 15280, status: 'available', branch: 'Airport Hub', rating: 4.8, image: 'hyundai-tucson.webp', features: ['Panoramic roof', 'Wireless charging', 'Lane keeping'] },
    { id: 8, brand: 'BMW', model: 'i4 eDrive40', year: 2024, type: 'luxury', plate: 'DF-8890', seats: 5, transmission: 'Automatic', fuel: 'Electric', price_per_day: 154, mileage: 11840, status: 'available', branch: 'Downtown Branch', rating: 4.9, image: 'bmw-i4.webp', features: ['Live Cockpit Pro', 'Harman Kardon', 'Driving Assistant Pro'] },
    { id: 9, brand: 'Skoda', model: 'Octavia Combi', year: 2023, type: 'hatchback', plate: 'DF-9931', seats: 5, transmission: 'Automatic', fuel: 'Diesel', price_per_day: 54, mileage: 56730, status: 'available', branch: 'North Depot', rating: 4.5, image: 'skoda-octavia.webp', features: ['Large boot', 'Adaptive cruise', 'Parking sensors'] },
    { id: 10, brand: 'Kia', model: 'Sportage GT-Line', year: 2023, type: 'suv', plate: 'DF-1145', seats: 5, transmission: 'Automatic', fuel: 'Petrol', price_per_day: 78, mileage: 38920, status: 'rented', branch: 'Airport Hub', rating: 4.6, image: 'kia-sportage.webp', features: ['Heated steering', 'Blind spot monitor', 'Roof rails'] },
    { id: 11, brand: 'Peugeot', model: '208 GT', year: 2023, type: 'hatchback', plate: 'DF-2288', seats: 5, transmission: 'Automatic', fuel: 'Petrol', price_per_day: 46, mileage: 31260, status: 'available', branch: 'Downtown Branch', rating: 4.4, image: 'peugeot-208.webp', features: ['3D i-Cockpit', 'Keyless entry', 'Rear sensors'] },
    { id: 12, brand: 'Volvo', model: 'XC60 Recharge', year: 2024, type: 'suv', plate: 'DF-3377', seats: 5, transmission: 'Automatic', fuel: 'Hybrid', price_per_day: 132, mileage: 21470, status: 'available', branch: 'Downtown Branch', rating: 4.9, image: 'volvo-xc60.webp', features: ['Pilot Assist', 'Premium audio', 'Air suspension'] }
  ];

  /* ---------------------------- Customers --------------------------- */

  var customers = [
    { id: 1, first_name: 'Amelia', last_name: 'Moreau', email: 'amelia.moreau@example.com', phone: '+351 912 000 101', licence_number: 'PT-8841203', city: 'Lisbon', country: 'Portugal', status: 'active', created_at: '2024-03-11' },
    { id: 2, first_name: 'Lena', last_name: 'Chen', email: 'lena.chen@example.com', phone: '+351 912 000 102', licence_number: 'PT-7710394', city: 'Porto', country: 'Portugal', status: 'active', created_at: '2024-04-02' },
    { id: 3, first_name: 'Ravi', last_name: 'Kapoor', email: 'ravi.kapoor@example.com', phone: '+351 912 000 103', licence_number: 'PT-6612887', city: 'Braga', country: 'Portugal', status: 'active', created_at: '2024-05-19' },
    { id: 4, first_name: 'Sofia', last_name: 'Almeida', email: 'sofia.almeida@example.com', phone: '+351 912 000 104', licence_number: 'PT-5520173', city: 'Lisbon', country: 'Portugal', status: 'new', created_at: '2025-01-08' },
    { id: 5, first_name: 'Noah', last_name: 'Fischer', email: 'noah.fischer@example.com', phone: '+49 151 000 105', licence_number: 'DE-3390142', city: 'Berlin', country: 'Germany', status: 'active', created_at: '2024-09-27' },
    { id: 6, first_name: 'Clara', last_name: 'Duarte', email: 'clara.duarte@example.com', phone: '+351 912 000 106', licence_number: 'PT-4418820', city: 'Coimbra', country: 'Portugal', status: 'active', created_at: '2024-11-14' },
    { id: 7, first_name: 'Marco', last_name: 'Rossi', email: 'marco.rossi@example.com', phone: '+39 340 000 107', licence_number: 'IT-2287410', city: 'Milan', country: 'Italy', status: 'blocked', created_at: '2023-12-01' },
    { id: 8, first_name: 'Ines', last_name: 'Barros', email: 'ines.barros@example.com', phone: '+351 912 000 108', licence_number: 'PT-3304455', city: 'Faro', country: 'Portugal', status: 'new', created_at: '2025-02-21' }
  ];

  /* ----------------------------- Rentals ---------------------------- */

  var rentals = [
    { id: 2001, customer_id: 1, vehicle_id: 2, pickup_date: '2025-06-02', return_date: '2025-06-07', status: 'completed', payment_status: 'completed', total_amount: 504, pickup_branch: 'Airport Hub', notes: 'Weekend trip to the Algarve.' },
    { id: 2002, customer_id: 2, vehicle_id: 8, pickup_date: '2025-06-14', return_date: '2025-06-18', status: 'completed', payment_status: 'completed', total_amount: 812.8, pickup_branch: 'Downtown Branch', notes: 'Business travel, airport drop-off.' },
    { id: 2003, customer_id: 3, vehicle_id: 4, pickup_date: '2025-07-01', return_date: '2025-07-09', status: 'completed', payment_status: 'completed', total_amount: 1128.96, pickup_branch: 'North Depot', notes: 'Furniture move, extra driver added.' },
    { id: 2004, customer_id: 4, vehicle_id: 11, pickup_date: '2025-07-19', return_date: '2025-07-22', status: 'cancelled', payment_status: 'refunded', total_amount: 165.6, pickup_branch: 'Downtown Branch', notes: 'Customer cancelled 48h before pick-up.' },
    { id: 2005, customer_id: 5, vehicle_id: 1, pickup_date: '2025-08-05', return_date: '2025-08-12', status: 'completed', payment_status: 'completed', total_amount: 806.4, pickup_branch: 'Downtown Branch', notes: 'One week electric trial.' },
    { id: 2006, customer_id: 6, vehicle_id: 7, pickup_date: '2025-08-23', return_date: '2025-08-30', status: 'active', payment_status: 'pending', total_amount: 772.8, pickup_branch: 'Airport Hub', notes: 'Currently on the road.' },
    { id: 2007, customer_id: 1, vehicle_id: 12, pickup_date: '2025-09-05', return_date: '2025-09-12', status: 'active', payment_status: 'pending', total_amount: 1108.8, pickup_branch: 'Downtown Branch', notes: 'Family holiday rental.' },
    { id: 2008, customer_id: 8, vehicle_id: 3, pickup_date: '2025-09-18', return_date: '2025-09-21', status: 'overdue', payment_status: 'pending', total_amount: 216.3, pickup_branch: 'Downtown Branch', notes: 'Return overdue by two days.' },
    { id: 2009, customer_id: 2, vehicle_id: 9, pickup_date: '2025-09-26', return_date: '2025-09-29', status: 'reserved', payment_status: 'completed', total_amount: 181.44, pickup_branch: 'North Depot', notes: 'Deposit paid online.' },
    { id: 2010, customer_id: 6, vehicle_id: 5, pickup_date: '2025-10-03', return_date: '2025-10-06', status: 'pending', payment_status: 'pending', total_amount: 665.28, pickup_branch: 'Downtown Branch', notes: 'Waiting for licence verification.' }
  ];

  /* ----------------------------- Payments --------------------------- */

  var payments = [
    { id: 9001, rental_id: 2001, amount: 504, method: 'card', type: 'rental', status: 'completed', reference: 'PAY-9001', paid_at: '2025-06-07' },
    { id: 9002, rental_id: 2002, amount: 812.8, method: 'bank_transfer', type: 'rental', status: 'completed', reference: 'PAY-9002', paid_at: '2025-06-14' },
    { id: 9003, rental_id: 2003, amount: 400, method: 'card', type: 'deposit', status: 'completed', reference: 'PAY-9003', paid_at: '2025-07-01' },
    { id: 9004, rental_id: 2003, amount: 728.96, method: 'cash', type: 'rental', status: 'completed', reference: 'PAY-9004', paid_at: '2025-07-09' },
    { id: 9005, rental_id: 2004, amount: 165.6, method: 'card', type: 'refund', status: 'refunded', reference: 'PAY-9005', paid_at: '2025-07-18' },
    { id: 9006, rental_id: 2005, amount: 806.4, method: 'paypal', type: 'rental', status: 'completed', reference: 'PAY-9006', paid_at: '2025-08-12' },
    { id: 9007, rental_id: 2006, amount: 200, method: 'card', type: 'deposit', status: 'completed', reference: 'PAY-9007', paid_at: '2025-08-23' },
    { id: 9008, rental_id: 2007, amount: 300, method: 'card', type: 'deposit', status: 'completed', reference: 'PAY-9008', paid_at: '2025-09-05' },
    { id: 9009, rental_id: 2008, amount: 120, method: 'cash', type: 'penalty', status: 'pending', reference: 'PAY-9009', paid_at: '2025-09-21' },
    { id: 9010, rental_id: 2009, amount: 181.44, method: 'card', type: 'deposit', status: 'completed', reference: 'PAY-9010', paid_at: '2025-09-19' }
  ];

  /* ------------------------------ Export ---------------------------- */

  var MockData = {
    currencies: CURRENCIES,
    currencies_list: CURRENCIES,
    vehicle_types: VEHICLE_TYPES,
    vehicle_status: VEHICLE_STATUS,
    rental_status: RENTAL_STATUS,
    payment_status: PAYMENT_STATUS,
    payment_methods: PAYMENT_METHODS,
    payment_types: PAYMENT_TYPES,
    transmissions: TRANSMISSIONS,
    fuels: FUELS,
    customer_status: CUSTOMER_STATUS,
    vehicles: vehicles,
    customers: customers,
    rentals: rentals,
    payments: payments,
    branches: branches,
    extras: extras,
    seed: function () {
      /* Deep clone so reset() can restore pristine rows into the live arrays. */
      function snapshot(rows) { return JSON.parse(JSON.stringify(rows)); }
      return {
        vehicles: snapshot(vehicles),
        customers: snapshot(customers),
        rentals: snapshot(rentals),
        payments: snapshot(payments),
        branches: snapshot(branches),
        extras: snapshot(extras)
      };
    }
  };

  window.MockData = MockData;
  window.DriveFleetData = MockData;
})(window);

/* ==== source: js/mock-core.js ==== */
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

/* ==== source: js/mock-api.js ==== */
/* ==========================================================================
   mock-api.js — REST-shaped adapter over window.MockApi (mock-core.js).

   Exposes `window.MockApiEx` whose method names and return shapes match the
   real Express endpoints, so js/api.js can fall back to it verbatim:
     MockApiEx.vehicles.list(filters) -> { data, total, page, pages, ... }
   Load order: data.js -> mock-core.js -> mock-api.js -> api.js
   ========================================================================== */
(function (window) {
  'use strict';

  if (!window.MockApi) {
    console.warn('[MockApi] not available — check that data.js and mock-core.js are loaded before mock-api.js.');
    return;
  }

  var M = window.MockApi;
  var PAGE_SIZE = 200;

  /* Uniform list envelope, mirroring the paginated REST responses. */
  function envelope(result, pageSize) {
    result = result || { data: [], total: 0 };
    var rows = result.data || [];
    var size = pageSize || PAGE_SIZE;
    var pages = Math.max(1, Math.ceil(rows.length / size));
    return {
      data: rows.slice(0, size),
      total: rows.length,
      page: 1,
      pages: pages,
      limit: size,
      has_next: pages > 1,
      has_prev: false,
      filters: result.filters || {}
    };
  }

  window.MockApiEx = {
    /* ------------------------------ vehicles ---------------------------- */
    vehicles: {
      list: function (filters) { return envelope(M.filterVehicles(filters)); },
      get: function (id) { return M.findVehicle(id); },
      create: function (payload) { return M.createVehicle(payload); },
      update: function (id, payload) { return M.updateVehicle(id, payload); },
      remove: function (id) { return M.removeVehicle(id); }
    },

    /* ------------------------------ customers --------------------------- */
    customers: {
      list: function (filters) { return envelope(M.filterCustomers(filters)); },
      get: function (id) { return M.findCustomer(id); },
      create: function (payload) { return M.createCustomer(payload); },
      update: function (id, payload) { return M.updateCustomer(id, payload); },
      remove: function (id) { return M.removeCustomer(id); }
    },

    /* ------------------------------- rentals ---------------------------- */
    rentals: {
      list: function (filters) { return envelope(M.filterRentals(filters)); },
      get: function (id) { return M.findRental(id); },
      create: function (payload) { return M.createRental(payload); },
      update: function (id, payload) { return M.updateRental(id, payload); },
      remove: function (id) { return M.removeRental(id); },
      quote: function (payload) { return M.quote(payload); }
    },

    /* ------------------------------- payments --------------------------- */
    payments: {
      list: function (filters) { return envelope(M.filterPayments(filters)); },
      get: function (id) { return M.findPayment(id); },
      create: function (payload) { return M.createPayment(payload); },
      update: function (id, payload) { return M.updatePayment(id, payload); },
      remove: function (id) { return M.removePayment(id); }
    },

    /* -------------------------------- stats ----------------------------- */
    stats: {
      overview: function () { return M.overview(); }
    },

    /* --------------------------------- auth ----------------------------- */
    auth: {
      login: function (credentials) { return M.login(credentials); },
      register: function (payload) { return M.register(payload); },
      me: function () { return M.currentUser(); },
      logout: function () { return { ok: true }; }
    },

    /* ------------------------------ utilities --------------------------- */
    branches: function () { return M.branches; },
    extras: function () { return M.extras; },
    resetDb: function () { return M.reset(); }
  };
})(window);

/* ==== source: js/api.js ==== */
'use strict';

// =============================================================================
// DriveFleet — API client layer
// Talks to the backend when available, falls back to MockApi otherwise.
// =============================================================================
(function (window) {

  var api = window.api = window.api || {};

  var BASE = (window.DRIVEFLEET_API_BASE || '/api').replace(/\/+$/, '');
  var CONFIG = {
    baseUrl: BASE,
    timeout: 11000,
    useMockFallback: true
  };

  var TOKEN_KEY = 'drivefleet.token';
  var USER_KEY = 'drivefleet.user';

  /* ------------------------- Storage helpers ------------------------- */
  function readStorage(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeStorage(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }
  function removeStorage(key) {
    try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  /* ------------------------- Auth store ------------------------- */
  var auth = api.auth = {
    getToken: function () { return readStorage(TOKEN_KEY); },
    setToken: function (token) { writeStorage(TOKEN_KEY, token || ''); },
    getUser: function () {
      try { return JSON.parse(readStorage(USER_KEY) || 'null'); } catch (e) { return null; }
    },
    setUser: function (user) { writeStorage(USER_KEY, JSON.stringify(user || null)); },
    isAuthenticated: function () { return Boolean(auth.getToken()); },
    clear: function () {
      removeStorage(TOKEN_KEY);
      removeStorage(USER_KEY);
    }
  };

  /* ----------------------- Request builder ----------------------- */
  function buildQuery(query) {
    if (!query || typeof query !== 'object') return '';
    var parts = [];
    Object.keys(query).forEach(function (key) {
      var v = query[key];
      if (v === undefined || v === null || v === '') return;
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(v));
    });
    var q = parts.join('&');
    return q ? '?' + q : '';
  }

  function isFormData(value) {
    return typeof FormData !== 'undefined' && value instanceof FormData;
  }

  function normalizeBody(body) {
    return isFormData(body) ? body : JSON.stringify(body);
  }

  function request(path, options) {
    options = options || {};
    var method = (options.method || 'GET').toUpperCase();
    var headers = { Accept: 'application/json' };
    var body = options.body;
    var hasBody = body !== undefined && body !== null;

    if (hasBody && !isFormData(body)) { headers['Content-Type'] = 'application/json'; }
    if (auth.getToken()) { headers['Authorization'] = 'Bearer ' + auth.getToken(); }

    var url = BASE + path + buildQuery(options.query || {});
    var timer = null;
    var controller = window.AbortController ? new window.AbortController() : null;
    if (controller) { timer = window.setTimeout(function () { controller.abort(); }, CONFIG.timeout); }

    return window.fetch(url, {
      method: method,
      headers: headers,
      body: hasBody ? normalizeBody(body) : null,
      signal: controller ? controller.signal : null
    }).then(function (res) {
      if (timer) { window.clearTimeout(timer); timer = null; }
      return res.text().then(function (text) {
        var data = (text && text.trim()) ? (function () { try { return JSON.parse(text); } catch (e) { return text; } })() : null;
        if (!res.ok) {
          var msg = (data && (data.message || data.error)) || ('HTTP ' + res.status);
          var err = new Error(msg);
          err.name = 'ApiError';
          err.status = res.status;
          err.body = data;
          throw err;
        }
        return data;
      });
    }).catch(function (err) {
      if (timer) { window.clearTimeout(timer); timer = null; }
      if (err instanceof Error && err.name === 'AbortError') {
        err = new Error('Request timed out');
        err.name = 'ApiError';
        err.status = 0;
      }
      if (!(err instanceof Error)) { err = new Error('Network error'); }
      err.name = err.name || 'ApiError';
      err.status = err.status || 0;
      throw err;
    });
  }

  /* ------------------- Mock fallback wrapper -------------------- */
  function withMock(path, options, fallback) {
    options = options || {};
    var promise = request(path, options);
    if (!CONFIG.useMockFallback) { return promise; }
    return promise.catch(function (err) {
      var mock = window.MockApiEx;
      if (!mock) { throw err; }
      try {
        return fallback ? fallback(mock, err) : Promise.resolve(null);
      } catch (e) { throw e; }
    });
  }

  api.CONFIG = CONFIG;
  api.request = request;
  api.auth = auth;
  api.withMock = withMock;
  api.BASE = BASE;

  /* ========================== Vehicles =========================== */

  api.vehicles = {
    list: function (filters) {
      return withMock('/vehicles', { query: filters || {} }, function (mock) {
        return mock.vehicles.list(filters || {}).data || [];
      });
    },
    get: function (id) {
      var path = '/vehicles/' + encodeURIComponent(String(id));
      return withMock(path, {}, function (mock) {
        return mock.vehicles.get(id) || null;
      });
    },
    create: function (payload) {
      return withMock('/vehicles', { method: 'POST', body: payload }, function (mock) {
        return mock.vehicles.create(payload);
      });
    },
    update: function (id, payload) {
      var path = '/vehicles/' + encodeURIComponent(String(id));
      return withMock(path, { method: 'PUT', body: payload }, function (mock) {
        return mock.vehicles.update(id, payload);
      });
    },
    remove: function (id) {
      var path = '/vehicles/' + encodeURIComponent(String(id));
      return withMock(path, { method: 'DELETE' }, function (mock) {
        return mock.vehicles.remove(id);
      });
    }
  };

  /* ========================== Customers =========================== */

  api.customers = {
    list: function (filters) {
      return withMock('/customers', { query: filters || {} }, function (mock) {
        return mock.customers.list(filters || {}).data || [];
      });
    },
    get: function (id) {
      var path = '/customers/' + encodeURIComponent(String(id));
      return withMock(path, {}, function (mock) {
        return mock.customers.get(id) || null;
      });
    },
    create: function (payload) {
      return withMock('/customers', { method: 'POST', body: payload }, function (mock) {
        return mock.customers.create(payload);
      });
    },
    update: function (id, payload) {
      var path = '/customers/' + encodeURIComponent(String(id));
      return withMock(path, { method: 'PUT', body: payload }, function (mock) {
        return mock.customers.update(id, payload);
      });
    },
    remove: function (id) {
      var path = '/customers/' + encodeURIComponent(String(id));
      return withMock(path, { method: 'DELETE' }, function (mock) {
        return mock.customers.remove(id);
      });
    }
  };

  /* =========================== Rentals ========================== */

  api.rentals = {
    list: function (filters) {
      return withMock('/rentals', { query: filters || {} }, function (mock) {
        return mock.rentals.list(filters || {}).data || [];
      });
    },
    get: function (id) {
      var path = '/rentals/' + encodeURIComponent(String(id));
      return withMock(path, {}, function (mock) {
        return mock.rentals.get(id) || null;
      });
    },
    create: function (payload) {
      return withMock('/rentals', { method: 'POST', body: payload }, function (mock) {
        return mock.rentals.create(payload);
      });
    },
    update: function (id, payload) {
      var path = '/rentals/' + encodeURIComponent(String(id));
      return withMock(path, { method: 'PUT', body: payload }, function (mock) {
        return mock.rentals.update(id, payload);
      });
    },
    remove: function (id) {
      var path = '/rentals/' + encodeURIComponent(String(id));
      return withMock(path, { method: 'DELETE' }, function (mock) {
        return mock.rentals.remove(id);
      });
    },
    quote: function (payload) {
      return withMock('/rentals/quote', { method: 'POST', body: payload }, function (mock) {
        return mock.rentals.quote(payload);
      });
    }
  };

  /* ========================== Payments =========================== */

  api.payments = {
    list: function (filters) {
      return withMock('/payments', { query: filters || {} }, function (mock) {
        return mock.payments.list(filters || {}).data || [];
      });
    },
    create: function (payload) {
      return withMock('/payments', { method: 'POST', body: payload }, function (mock) {
        return mock.payments.create(payload);
      });
    },
    update: function (id, payload) {
      var path = '/payments/' + encodeURIComponent(String(id));
      return withMock(path, { method: 'PUT', body: payload }, function (mock) {
        return mock.payments.update(id, payload);
      });
    },
    remove: function (id) {
      var path = '/payments/' + encodeURIComponent(String(id));
      return withMock(path, { method: 'DELETE' }, function (mock) {
        return mock.payments.remove(id);
      });
    }
  };

  /* ============================ Auth ============================== */

  api.auth = api.auth || {};
  api.auth.login = function (credentials) {
    return withMock('/auth/login', { method: 'POST', body: credentials }, function (mock) {
      return mock.auth.login(credentials);
    });
  };
  api.auth.register = function (payload) {
    return withMock('/auth/register', { method: 'POST', body: payload }, function (mock) {
      return mock.auth.register(payload);
    });
  };
  api.auth.me = function () {
    return withMock('/auth/me', {}, function (mock) {
      return mock.auth.me();
    });
  };
  api.auth.logout = function () {
    return Promise.resolve().then(function () {
      api.auth.clear();
    });
  };

  /* ============================= Stats ============================= */

  api.stats = {
    overview: function () {
      return withMock('/stats/overview', {}, function (mock) {
        return mock.stats.overview();
      });
    }
  };

  /* ======================== Mock utilities ========================= */

  api.resetDb = function () {
    return window.MockApiEx && window.MockApiEx.resetDb
      ? window.MockApiEx.resetDb()
      : { ok: false, reason: 'Mock layer not loaded' };
  };

  window.api = api;
  window.DriveFleetApi = api;
})(window);

/* ==== source: js/components.js ==== */
/* ==========================================================================
   components.js — shared page chrome for DriveFleet.

   Renders the marketing navbar/mobile menu/footer on the landing page and the
   app sidebar/topbar on the dashboard pages. Every path is resolved against
   `data-root` on <body> so the same file works from / and from /pages/.
   ========================================================================== */
(function (window, document) {
  'use strict';

  var ROOT = (document.body && document.body.getAttribute('data-root')) || '';
  function url(path) { return ROOT + path; }

  var ICONS = {
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16h16M5 16V9l2-4h10l2 4v7"/><circle cx="8" cy="17.5" r="1.5"/><circle cx="16" cy="17.5" r="1.5"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 20v-2a4 4 0 0 0-3-3.87"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>'
  };

  var MARKETING_LINKS = [
    { label: 'Home', href: 'index.html', page: 'home' },
    { label: 'Fleet', href: 'pages/vehicles.html', page: 'vehicles' },
    { label: 'How it works', href: 'index.html#how-it-works', page: 'how' },
    { label: 'Dashboard', href: 'pages/dashboard.html', page: 'dashboard' }
  ];

  var APP_LINKS = [
    { label: 'Dashboard', href: 'dashboard.html', page: 'dashboard', icon: 'grid' },
    { label: 'Vehicles', href: 'vehicles.html', page: 'vehicles', icon: 'car' },
    { label: 'Customers', href: 'customers.html', page: 'customers', icon: 'users' },
    { label: 'Rentals', href: 'rentals.html', page: 'rentals', icon: 'calendar' },
    { label: 'Payments', href: 'payments.html', page: 'payments', icon: 'card' }
  ];

  function currentPage() {
    return (document.body && document.body.getAttribute('data-page')) || 'home';
  }

  function isAppPage() {
    return ['dashboard', 'vehicles', 'customers', 'rentals', 'payments'].indexOf(currentPage()) !== -1;
  }

  function session() {
    return (window.DriveFleetApi && window.DriveFleetApi.auth && window.DriveFleetApi.auth.getUser()) || null;
  }

  function initials(name) {
    return String(name || 'DriveFleet Guest').trim().split(/\s+/)
      .map(function (w) { return w.charAt(0).toUpperCase(); }).slice(0, 2).join('');
  }

  /* ------------------------------ Navbar ------------------------------- */

  function renderNavbar() {
    var host = document.getElementById('site-navbar');
    if (!host) return;
    var page = currentPage();
    var user = session();

    var links = MARKETING_LINKS.map(function (link) {
      var active = link.page === page ? ' active' : '';
      return '<a class="nav-link' + active + '" href="' + url(link.href) + '">' + link.label + '</a>';
    }).join('');

    var actions = user
      ? '<a class="btn btn-ghost btn-sm" href="' + url('pages/dashboard.html') + '">' + initials(user.name) + ' · Dashboard</a>' +
        '<button class="btn btn-outline btn-sm" type="button" data-action="logout">Sign out</button>'
      : '<a class="btn btn-ghost btn-sm" href="' + url('pages/login.html') + '">Sign in</a>' +
        '<a class="btn btn-primary btn-sm" href="' + url('pages/register.html') + '">Create account</a>';

    host.innerHTML =
      '<nav class="navbar" id="mainNavbar">' +
        '<div class="container navbar-inner">' +
          '<a class="logo" href="' + url('index.html') + '">' +
            '<span class="logo-icon">' + ICONS.car + '</span>' +
            '<span>Drive<span class="text-primary">Fleet</span></span>' +
          '</a>' +
          '<div class="nav-links" role="navigation">' + links + '</div>' +
          '<div class="nav-actions">' + actions +
            '<button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" data-action="toggle-menu">' + ICONS.menu + '</button>' +
          '</div>' +
        '</div>' +
      '</nav>';
  }

  /* ---------------------------- Mobile menu ---------------------------- */

  function renderMobileMenu() {
    var host = document.getElementById('mobile-menu');
    if (!host) return;
    var page = currentPage();
    var user = session();

    var links = MARKETING_LINKS.map(function (link) {
      var active = link.page === page ? ' active' : '';
      return '<a class="nav-link' + active + '" href="' + url(link.href) + '" data-action="close-menu">' + link.label + '</a>';
    }).join('');

    var auth = user
      ? '<button class="btn btn-outline btn-block" type="button" data-action="logout">Sign out</button>'
      : '<a class="btn btn-primary btn-block" href="' + url('pages/register.html') + '">Create account</a>' +
        '<a class="btn btn-ghost btn-block" href="' + url('pages/login.html') + '">Sign in</a>';

    host.innerHTML =
      '<div class="mobile-menu" id="mobileMenu" aria-hidden="true">' +
        '<button class="mobile-menu-backdrop" type="button" aria-label="Close menu" data-action="close-menu"></button>' +
        '<aside class="mobile-menu-panel mobile-menu-inner" role="dialog" aria-label="Main menu">' +
          '<div class="logo">' +
            '<span class="logo-icon">' + ICONS.car + '</span>' +
            '<span>Drive<span class="text-primary">Fleet</span></span>' +
          '</div>' +
          '<nav class="nav-links">' + links + '</nav>' +
          '<div class="nav-actions">' + auth + '</div>' +
        '</aside>' +
      '</div>';
  }

  /* ------------------------------ Footer ------------------------------- */

  function renderFooter() {
    var host = document.getElementById('siteFooter');
    if (!host) return;
    var year = new Date().getFullYear();

    var columns = [
      { title: 'Company', links: [['About', 'index.html#how-it-works'], ['Fleet', 'pages/vehicles.html'], ['Careers', 'index.html#how-it-works']] },
      { title: 'Product', links: [['Dashboard', 'pages/dashboard.html'], ['Rentals', 'pages/rentals.html'], ['Payments', 'pages/payments.html']] },
      { title: 'Support', links: [['Contact', 'index.html#how-it-works'], ['Sign in', 'pages/login.html'], ['Register', 'pages/register.html']] }
    ];

    host.innerHTML =
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div>' +
            '<a class="logo" href="' + url('index.html') + '">' +
              '<span class="logo-icon">' + ICONS.car + '</span>' +
              '<span>Drive<span class="text-primary">Fleet</span></span>' +
            '</a>' +
            '<p class="body-sm text-muted footer-about">Premium vehicle rental management — bookings, customers and payments in one calm dashboard.</p>' +
            '<div class="social-links">' +
              '<a class="social-link" href="#" aria-label="DriveFleet on X">X</a>' +
              '<a class="social-link" href="#" aria-label="DriveFleet on LinkedIn">in</a>' +
              '<a class="social-link" href="#" aria-label="DriveFleet on Instagram">ig</a>' +
            '</div>' +
          '</div>' +
          columns.map(function (col) {
            var items = col.links.map(function (pair) {
              return '<li><a class="footer-link" href="' + url(pair[1]) + '">' + pair[0] + '</a></li>';
            }).join('');
            return '<div><div class="footer-title">' + col.title + '</div><ul class="footer-links">' + items + '</ul></div>';
          }).join('') +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>© ' + year + ' DriveFleet. All rights reserved.</span>' +
          '<span>Built with HTML, CSS and vanilla JavaScript.</span>' +
        '</div>' +
      '</div>';
  }

  /* --------------------------- App: sidebar ---------------------------- */

  function renderSidebar() {
    var host = document.getElementById('siteSidebar');
    if (!host) return;
    var page = currentPage();
    var user = session();

    var links = APP_LINKS.map(function (link) {
      var active = link.page === page ? ' active' : '';
      return '<a class="sidebar-link' + active + '" href="' + link.href + '">' + ICONS[link.icon] + '<span>' + link.label + '</span></a>';
    }).join('');

    host.className = 'sidebar';
    host.innerHTML =
      '<div class="sidebar-header">' +
        '<a class="logo" href="' + url('index.html') + '">' +
          '<span class="logo-icon">' + ICONS.car + '</span>' +
          '<span>Drive<span class="text-primary">Fleet</span></span>' +
        '</a>' +
      '</div>' +
      '<nav class="sidebar-nav">' +
        '<span class="sidebar-section-label">Operations</span>' + links +
        '<span class="sidebar-section-label">Storefront</span>' +
        '<a class="sidebar-link" href="' + url('index.html') + '">' + ICONS.car + '<span>Landing page</span></a>' +
      '</nav>' +
      '<div class="sidebar-footer">' +
        '<div class="cell-main">' +
          '<span class="avatar" aria-hidden="true">' + initials(user && user.name) + '</span>' +
          '<div><div class="cell-title">' + ((user && user.name) || 'Guest mode') + '</div>' +
          '<div class="cell-sub">' + ((user && user.email) || 'Mock API active') + '</div></div>' +
        '</div>' +
        '<button class="btn btn-outline btn-block btn-sm" type="button" data-action="logout">' + ICONS.logout + ' Sign out</button>' +
      '</div>';
  }

  /* --------------------------- App: topbar ---------------------------- */

  function renderTopbar() {
    var host = document.getElementById('siteTopbar');
    if (!host) return;
    host.innerHTML =
      '<div class="topbar">' +
        '<div class="topbar-left">' +
          '<button class="sidebar-toggle" type="button" aria-label="Toggle navigation" data-action="toggle-sidebar">' + ICONS.menu + '</button>' +
          '<label class="topbar-search">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
            '<input type="search" id="globalSearch" placeholder="Search vehicles, customers, rentals…" aria-label="Global search" />' +
          '</label>' +
        '</div>' +
        '<div class="topbar-right">' +
          '<a class="btn btn-ghost btn-sm" href="' + url('index.html') + '">View storefront</a>' +
          '<span class="badge badge-primary badge-dot">Mock API</span>' +
        '</div>' +
      '</div>';
  }

  /* ---------------------------- Interactions --------------------------- */

  function openMenu(open) {
    var menu = document.getElementById('mobileMenu');
    var toggle = document.querySelector('[data-action="toggle-menu"]');
    if (!menu) return;
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (toggle) { toggle.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function toggleSidebar() {
    var sidebar = document.getElementById('siteSidebar');
    if (!sidebar) return;
    var open = !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', open);
    var overlay = document.getElementById('sidebarOverlay');
    if (overlay) { overlay.classList.toggle('open', open); }
  }

  function signOut() {
    if (window.DriveFleetApi && window.DriveFleetApi.auth) { window.DriveFleetApi.auth.logout(); }
    if (window.ui && window.ui.toast) { window.ui.toast('You have been signed out.', 'info', 2500); }
    window.setTimeout(function () { window.location.href = url('index.html'); }, 500);
  }

  function onScroll() {
    var navbar = document.getElementById('mainNavbar');
    if (navbar) { navbar.classList.toggle('navbar-scrolled', window.scrollY > 12); }
  }

  function bind() {
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest ? event.target.closest('[data-action]') : null;
      if (!trigger) return;
      var action = trigger.getAttribute('data-action');
      if (action === 'toggle-menu') { openMenu(true); }
      if (action === 'close-menu') { openMenu(false); }
      if (action === 'toggle-sidebar') { toggleSidebar(); }
      if (action === 'logout') { signOut(); }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { openMenu(false); }
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------- Public ------------------------------ */

  function renderAll() {
    if (isAppPage()) {
      renderSidebar();
      renderTopbar();
    } else {
      renderNavbar();
      renderMobileMenu();
    }
    renderFooter();
    bind();
  }

  window.DriveFleetComponents = {
    renderAll: renderAll,
    renderNavbar: renderNavbar,
    renderMobileMenu: renderMobileMenu,
    renderFooter: renderFooter,
    renderSidebar: renderSidebar,
    renderTopbar: renderTopbar,
    url: url,
    ROOT: ROOT,
    ICONS: ICONS
  };
})(window, document);

/* ==== source: js/ui.js ==== */
/**
 * ui.js — DriveFleet UI helpers
 * Toast notifications, loading spinner, modal/dialog helpers, formatters.
 */
(function (window) {
  'use strict';

  var container = document.getElementById('toastContainer');
  var counter = 0;

  function showToast(message, type, duration) {
    type = type || 'success';
    duration = duration || 3500;
    counter++;
    var id = 'toast-' + counter;
    var icons = {
      success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.id = id;
    el.innerHTML =
      '<div class="toast-icon">' + (icons[type] || icons.info) + '</div>' +
      '<div class="toast-content">' +
        '<div class="toast-title">' + (type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : type === 'info' ? 'Info' : 'Success') + '</div>' +
        '<div class="toast-message">' + escapeHtml(message) + '</div>' +
      '</div>' +
      '<button class="toast-close" aria-label="Close">&times;</button>';
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    container.appendChild(el);
    var close = function () { dismiss(id); };
    el.querySelector('.toast-close').addEventListener('click', close);
    setTimeout(close, duration);
    return id;
  }

  function dismiss(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('hiding');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 250);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[c];
    });
  }

  function formatCurrency(amount, currency) {
    currency = currency || 'USD';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount || 0);
  }

  function formatDate(dateStr, options) {
    if (!dateStr) return '—';
    var d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', options || { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function formatDateRange(start, end) {
    if (!start && !end) return '—';
    if (!end) return formatDate(start);
    return formatDate(start) + ' — ' + formatDate(end);
  }

  function statusBadge(status, className) {
    className = className || '';
    var map = {
      'pending': { label: 'Pending', cls: 'badge-warning' },
      'confirmed': { label: 'Confirmed', cls: 'badge-info' },
      'active': { label: 'Active', cls: 'badge-primary' },
      'completed': { label: 'Completed', cls: 'badge-success' },
      'cancelled': { label: 'Cancelled', cls: 'badge-error' },
      'overdue': { label: 'Overdue', cls: 'badge-error' },
      'maintenance': { label: 'Maintenance', cls: 'badge-error' },
      'available': { label: 'Available', cls: 'badge-success' },
      'rented': { label: 'Rented', cls: 'badge-warning' },
      'reserved': { label: 'Reserved', cls: 'badge-warning' }
    };
    var s = map[status] || { label: status || 'Unknown', cls: 'badge-neutral' };
    return '<span class="badge ' + (s.cls || className) + '">' + escapeHtml(s.label) + '</span>';
  }

  function initials(name) {
    if (!name) return '?';
    return name.split(/[\s_-]+/).map(function (w) { return w.charAt(0).toUpperCase(); }).slice(0, 2).join('');
  }

  function avatarHtml(name, color) {
    var bg = color || '#0f766e';
    return '<span class="avatar" style="background:' + bg + '">' + initials(name) + '</span>';
  }

  function currencySelect(selected) {
    var options = [
      { code: 'USD', label: 'USD ($)' },
      { code: 'EUR', label: 'EUR (€)' },
      { code: 'GBP', label: 'GBP (£)' }
    ];
    return options.map(function (o) {
      return '<option value="' + o.code + '"' + (o.code === selected ? ' selected' : '') + '>' + o.label + '</option>';
    }).join('');
  }

  window.ui = {
    toast: showToast,
    dismiss: dismiss,
    formatCurrency: formatCurrency,
    formatDate: formatDate,
    formatDateRange: formatDateRange,
    statusBadge: statusBadge,
    initials: initials,
    avatarHtml: avatarHtml,
    currencySelect: currencySelect,
    escapeHtml: escapeHtml
  };
})(window);

/* ==== source: js/main.js ==== */
/* ==========================================================================
   main.js — DriveFleet application layer.

   A tiny page router: `DriveFleetInit.initPage()` reads `data-page` from the
   <body> and runs the matching feature module. Every data call goes through
   js/api.js (window.DriveFleetApi), which transparently falls back to the mock
   layer, so the UI is fully functional without the Express backend running.
   ========================================================================== */
(function (window, document) {
  'use strict';

  var ROOT = (document.body && document.body.getAttribute('data-root')) || '';
  var api = window.DriveFleetApi || window.api || {};
  var ui = window.ui || {};

  var ICONS = (window.DriveFleetComponents && window.DriveFleetComponents.ICONS) || {};
  var CAR_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h18M4 17v-5l2.2-4.4A2 2 0 0 1 8 6.5h8a2 2 0 0 1 1.8 1.1L20 12v5"/><circle cx="7.5" cy="17.5" r="1.6"/><circle cx="16.5" cy="17.5" r="1.6"/><path d="M5 12h14"/></svg>';
  var CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  var IMAGE_DIR = ROOT + 'assets/vehicles/';
  var CARD_SIZES = '(max-width: 560px) 92vw, (max-width: 1024px) 45vw, 360px';

  /* requestAnimationFrame with a timer fallback so animations can never break a
     feature (they are decorative). */
  var raf = window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : function (callback) { return window.setTimeout(function () { callback(Date.now()); }, 16); };

  /* ----------------------------- Utilities ----------------------------- */

  function el(id) { return document.getElementById(id); }
  function esc(value) { return ui.escapeHtml ? ui.escapeHtml(value) : String(value == null ? '' : value); }
  function money(amount) { return ui.formatCurrency ? ui.formatCurrency(amount) : '$' + Number(amount || 0).toFixed(2); }
  function date(value) { return ui.formatDate ? ui.formatDate(value) : (value || '—'); }
  function badge(status) {
    return ui.statusBadge ? ui.statusBadge(status) : '<span class="badge badge-neutral">' + esc(status) + '</span>';
  }
  function toast(message, type) { if (ui.toast) { ui.toast(message, type || 'success'); } }
  function typeLabel(value) {
    return String(value || '').charAt(0).toUpperCase() + String(value || '').slice(1);
  }
  function initials(name) {
    return String(name || '?').trim().split(/\s+/).map(function (w) { return w.charAt(0).toUpperCase(); }).slice(0, 2).join('');
  }
  function qs(selector, scope) { return (scope || document).querySelector(selector); }
  function qsa(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function addDays(dateString, days) {
    var d = new Date(dateString || todayISO());
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
  function skeleton(rows) {
    return new Array(rows || 3).join('x').split('x').map(function () {
      return '<div class="skeleton skeleton-card"></div>';
    }).join('');
  }
  function emptyState(title, message) {
    return '<div class="empty-state"><h3 class="title-md">' + esc(title) + '</h3>' +
      '<p class="body-sm text-muted">' + esc(message) + '</p></div>';
  }
  function carGlyph(label) {
    return '<span class="vehicle-thumb" aria-hidden="true">' + CAR_ICON +
      '<span class="vehicle-thumb-label">' + esc(label || 'DriveFleet') + '</span></span>';
  }

  /* ------------------------------ Vehicle media ------------------------ */

  /* Real WebP photograph with the SVG glyph behind it: if the file is missing
     (or the network fails) the card still looks intentional, never broken. */
  function vehiclePhoto(vehicle, label, sizes) {
    var base = String((vehicle && vehicle.image) || '').replace(/\.[a-z0-9]+$/i, '');
    if (!base) return '';
    return '<img class="vehicle-photo" src="' + IMAGE_DIR + base + '-large.webp"' +
      ' srcset="' + IMAGE_DIR + base + '-small.webp 400w, ' + IMAGE_DIR + base + '-large.webp 800w"' +
      ' sizes="' + (sizes || CARD_SIZES) + '" width="800" height="500"' +
      ' loading="lazy" decoding="async" alt="' + esc(label) + '" />';
  }

  function bindMedia(root) {
    qsa('.vehicle-photo, .modal-hero img', root || document).forEach(function (image) {
      if (image.getAttribute('data-media-bound') === '1') return;
      image.setAttribute('data-media-bound', '1');
      function loaded() { image.classList.add('is-loaded'); }
      function missing() { image.classList.add('is-missing'); }
      image.addEventListener('load', loaded);
      image.addEventListener('error', missing);
      if (image.complete) { (image.naturalWidth > 0 ? loaded : missing)(); }
    });
  }

  /* ------------------------------ Modals ------------------------------- */

  var modalHost = null;

  function ensureModalHost() {
    modalHost = el('modalRoot');
    if (!modalHost) {
      modalHost = document.createElement('div');
      modalHost.id = 'modalRoot';
      document.body.appendChild(modalHost);
    }
    return modalHost;
  }

  function openModal(options) {
    options = options || {};
    var host = ensureModalHost();

    host.innerHTML =
      '<div class="modal-overlay open" id="appModalOverlay">' +
        '<div class="modal' + (options.size === 'lg' ? ' modal-lg' : '') + '" role="dialog" aria-modal="true" aria-labelledby="appModalTitle">' +
          '<span class="modal-grabber" aria-hidden="true"></span>' +
          '<div class="modal-header">' +
            '<div class="modal-heading">' +
              (options.eyebrow ? '<span class="modal-eyebrow">' + options.eyebrow + '</span>' : '') +
              '<h3 id="appModalTitle">' + esc(options.title || '') + '</h3>' +
              (options.subtitle ? '<p class="modal-subtitle">' + options.subtitle + '</p>' : '') +
            '</div>' +
            '<button class="modal-close" type="button" aria-label="Close dialog" data-close-modal>&times;</button>' +
          '</div>' +
          (options.hero || '') +
          '<div class="modal-body">' + (options.body || '') + '</div>' +
          (options.footer ? '<div class="modal-footer">' + options.footer + '</div>' : '') +
        '</div>' +
      '</div>';

    var overlay = el('appModalOverlay');
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay || event.target.closest('[data-close-modal]')) { closeModal(); }
    });

    /* Selected extras get the highlighted card treatment. */
    overlay.addEventListener('change', function (event) {
      var input = event.target.closest('[data-extra]');
      if (!input) return;
      var card = input.closest('.extra-option');
      if (card) { card.classList.toggle('is-selected', input.checked); }
    });

    document.addEventListener('keydown', modalEscape);
    document.body.style.overflow = 'hidden';
    bindMedia(overlay);
    return overlay;
  }

  function modalEscape(event) {
    if (event.key === 'Escape') { closeModal(); }
  }

  /* Plays the exit animation first, then unmounts — callers can keep reading the
     modal contents while it disappears. */
  function closeModal() {
    var overlay = el('appModalOverlay');
    document.removeEventListener('keydown', modalEscape);
    document.body.style.overflow = '';
    if (!overlay || overlay.getAttribute('data-state') === 'closing') { return; }

    overlay.setAttribute('data-state', 'closing');
    overlay.classList.remove('open');
    window.setTimeout(function () {
      if (overlay.parentNode) { overlay.parentNode.removeChild(overlay); }
    }, 220);
  }

  /* --------------------------- Reveal on scroll ------------------------ */

  function initReveal() {
    var targets = qsa('.reveal');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (node) { node.classList.add('visible'); });
      return;
    }
    var observer = new window.IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (node) { observer.observe(node); });
  }

  function animateCounters() {
    var raf = window.requestAnimationFrame
      ? window.requestAnimationFrame.bind(window)
      : function (callback) { return window.setTimeout(function () { callback(Date.now()); }, 16); };

    qsa('[data-count]').forEach(function (node) {
      var target = Number(node.getAttribute('data-count')) || 0;
      var suffix = node.getAttribute('data-suffix') || '';
      var start = null;
      function step(timestamp) {
        if (!start) { start = timestamp; }
        var progress = Math.min((timestamp - start) / 1400, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = Math.round(target * eased).toLocaleString('en-US') + suffix;
        if (progress < 1) { raf(step); }
      }
      raf(step);
    });
  }

  /* --------------------------- Shared renderers ------------------------ */

  function vehicleCard(v, options) {
    options = options || {};
    var label = v.brand + ' ' + v.model;
    return '' +
      '<article class="card card-hover vehicle-card" data-vehicle="' + v.id + '">' +
        '<div class="vehicle-card-image">' +
          badge(v.status) +
          '<span class="badge badge-neutral type-badge">' + esc(typeLabel(v.type)) + '</span>' +
          carGlyph(v.brand) +
          vehiclePhoto(v, label) +
        '</div>' +
        '<div class="vehicle-card-body">' +
          '<span class="label-xs text-muted">' + esc(v.branch || 'Unassigned branch') + '</span>' +
          '<h3 class="title-md">' + esc(label) + '</h3>' +
          '<div class="vehicle-card-meta">' +
            '<span>' + esc(v.year) + '</span>' +
            '<span>' + esc(v.seats) + ' seats</span>' +
            '<span>' + esc(v.transmission) + '</span>' +
            '<span>' + esc(v.fuel) + '</span>' +
          '</div>' +
          '<div class="vehicle-card-meta"><span>★ ' + esc(v.rating) + '</span>' +
            '<span>' + esc((v.features || []).slice(0, 1).join('')) + '</span></div>' +
        '</div>' +
        '<div class="vehicle-card-footer">' +
          '<div class="price"><span class="amount">' + money(v.price_per_day) + '</span> <span class="period">/ day</span></div>' +
          '<div class="table-actions">' +
            '<button class="btn btn-primary btn-sm" type="button" data-book-vehicle="' + v.id + '">Book now</button>' +
            '<button class="btn btn-ghost btn-sm" type="button" data-view-vehicle="' + v.id + '">Details</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function renderVehicleGrid(host, vehicles, options) {
    if (!host) return;
    if (!vehicles.length) {
      host.innerHTML = emptyState('No vehicles match those filters', 'Try widening the price range or clearing the search field.');
      return;
    }
    host.innerHTML = vehicles.map(function (v) { return vehicleCard(v, options); }).join('');
    bindMedia(host);
  }

  function bindVehicleActions(vehicles, container) {
    bindMedia(container);
    qsa('[data-book-vehicle]', container).forEach(function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-book-vehicle');
        openBookingModal(findVehicle(vehicles, id));
      });
    });
    qsa('[data-view-vehicle]', container).forEach(function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-view-vehicle');
        openVehicleDetails(findVehicle(vehicles, id));
      });
    });
  }

  function findVehicle(vehicles, id) {
    return vehicles.filter(function (v) { return String(v.id) === String(id); })[0] || null;
  }

  function openVehicleDetails(vehicle) {
    if (!vehicle) return;
    var rows = [
      ['Plate', vehicle.plate],
      ['Type', typeLabel(vehicle.type)],
      ['Year', vehicle.year],
      ['Transmission', vehicle.transmission],
      ['Fuel', vehicle.fuel],
      ['Seats', vehicle.seats],
      ['Mileage', Number(vehicle.mileage).toLocaleString('en-US') + ' km'],
      ['Branch', vehicle.branch],
      ['Rating', '★ ' + vehicle.rating]
    ].map(function (pair) {
      return '<div class="summary-row"><span class="summary-label">' + esc(pair[0]) + '</span><span class="summary-value">' + esc(pair[1]) + '</span></div>';
    }).join('');

    var features = (vehicle.features || []).map(function (f) {
      return '<li class="chip">' + esc(f) + '</li>';
    }).join('');

    openModal({
      title: vehicle.brand + ' ' + vehicle.model,
      eyebrow: typeLabel(vehicle.type) + ' · ' + vehicle.year,
      subtitle: esc(vehicle.branch || 'DriveFleet') + ' · ' + esc(vehicle.plate || '') + ' · ★ ' + esc(vehicle.rating),
      hero: '<div class="modal-hero">' + badge(vehicle.status) + vehiclePhoto(vehicle, vehicle.brand + ' ' + vehicle.model, '100vw') + '</div>',
      body: '<div class="modal-section modal-anim">' +
          '<div class="modal-section-title">Specifications</div>' +
          '<div class="summary-list">' + rows + '</div>' +
        '</div>' +
        '<div class="modal-section modal-anim modal-anim-d1">' +
          '<div class="modal-section-title">Included features</div>' +
          '<ul class="chip-list">' + features + '</ul>' +
        '</div>',
      footer: '<div class="modal-footer-total">' +
          '<span class="label-xs">Daily rate</span>' +
          '<span class="value">' + money(vehicle.price_per_day) + '</span>' +
        '</div>' +
        '<div class="modal-footer-actions">' +
          '<button class="btn btn-ghost" type="button" data-close-modal>Close</button>' +
          '<button class="btn btn-primary" type="button" data-book-vehicle="' + vehicle.id + '">Book this vehicle</button>' +
        '</div>'
    });

    var book = qs('[data-book-vehicle]', el('appModalOverlay'));
    if (book) { book.addEventListener('click', function () { openBookingModal(vehicle); }); }
  }

  /* ------------------------------ Booking ------------------------------ */

  function openBookingModal(vehicle) {
    if (!vehicle) return;
    var pickup = addDays(todayISO(), 1);
    var back = addDays(todayISO(), 4);
    var extras = (api.extras && api.extras()) || (window.MockApiEx && window.MockApiEx.extras()) || [];

    var customers = [];
    Promise.resolve(api.customers.list({})).then(function (rows) {
      customers = rows || [];
      var options = customers.map(function (c) {
        return '<option value="' + c.id + '">' + esc(c.first_name + ' ' + c.last_name + ' · ' + c.email) + '</option>';
      }).join('');

      var extraFields = extras.map(function (e) {
        return '<label class="extra-option">' +
          '<input type="checkbox" value="' + e.id + '" data-extra />' +
          '<span>' + esc(e.label) + '</span>' +
          '<span class="extra-price">+' + money(e.price_per_day) + '/d</span>' +
        '</label>';
      }).join('');

      openModal({
        title: vehicle.brand + ' ' + vehicle.model,
        eyebrow: 'New reservation',
        subtitle: esc(vehicle.branch || 'DriveFleet') + ' · ' + money(vehicle.price_per_day) + ' per day',
        size: 'lg',
        hero: '<div class="modal-hero">' + badge(vehicle.status) + vehiclePhoto(vehicle, vehicle.brand + ' ' + vehicle.model, '100vw') + '</div>',
        body:
          '<form id="bookingForm" class="booking-grid">' +
            '<div class="modal-section modal-anim">' +
              '<div class="modal-section-title">' + ICONS.calendar + ' Booking details</div>' +
              '<div class="form-group">' +
                '<label class="form-label" for="bookCustomer">Customer <span class="required">*</span></label>' +
                '<select class="form-select" id="bookCustomer" required>' +
                  '<option value="">Select a customer</option>' + options + '</select>' +
              '</div>' +
              '<div class="form-row">' +
                '<div class="form-group">' +
                  '<label class="form-label" for="bookPickup">Pick-up date</label>' +
                  '<input class="form-input" type="date" id="bookPickup" value="' + pickup + '" required />' +
                '</div>' +
                '<div class="form-group">' +
                  '<label class="form-label" for="bookReturn">Return date</label>' +
                  '<input class="form-input" type="date" id="bookReturn" value="' + back + '" required />' +
                '</div>' +
              '</div>' +
              '<div class="modal-section">' +
                '<div class="modal-section-title">Extras</div>' +
                '<div class="extra-grid">' + extraFields + '</div>' +
              '</div>' +
            '</div>' +
            '<aside class="booking-summary modal-anim modal-anim-d2">' +
              '<div class="modal-section-title">' + ICONS.card + ' Price breakdown</div>' +
              '<div class="summary-list" id="quoteSummary">' +
                '<span class="body-sm text-muted">Choose your dates to see the live quote.</span>' +
              '</div>' +
            '</aside>' +
          '</form>',
        footer:
          '<div class="modal-footer-total">' +
            '<span class="label-xs">Total to pay</span>' +
            '<span class="value" id="footerTotal">—</span>' +
          '</div>' +
          '<div class="modal-footer-actions">' +
            '<button class="btn btn-ghost" type="button" data-close-modal>Cancel</button>' +
            '<button class="btn btn-primary" type="submit" form="bookingForm">' + CHECK_ICON + ' Confirm booking</button>' +
          '</div>'
      });

      var form = el('bookingForm');
      function refreshQuote() {
        var selected = qsa('[data-extra]:checked', form).map(function (i) { return i.value; });
        var payload = {
          vehicle_id: vehicle.id,
          pickup_date: el('bookPickup').value,
          return_date: el('bookReturn').value,
          extras: selected
        };
        Promise.resolve(api.rentals.quote(payload)).then(function (quote) {
          var host = el('quoteSummary');
          var footerTotal = el('footerTotal');
          if (!host) return;

          if (!quote || quote.error) {
            host.innerHTML = '<span class="body-sm text-muted">' +
              esc((quote && quote.error) || 'Unable to calculate a quote.') + '</span>';
            if (footerTotal) { footerTotal.textContent = '—'; }
            return;
          }
          if (footerTotal) { footerTotal.textContent = money(quote.total_amount); }

          var rows = [
            ['Daily rate', money(quote.daily_rate)],
            ['Days', quote.days],
            ['Base amount', money(quote.base_amount)],
            ['Extras', money(quote.extras_amount)],
            ['Discount', '-' + money(quote.discount_amount) + ' (' + Math.round(quote.discount_rate * 100) + '%)'],
            ['Subtotal', money(quote.subtotal)],
            ['VAT (20%)', money(quote.tax_amount)],
            ['Refundable deposit', money(quote.deposit)]
          ].map(function (pair) {
            return '<div class="summary-row"><span class="summary-label">' + pair[0] + '</span><span class="summary-value">' + pair[1] + '</span></div>';
          }).join('');
          host.innerHTML = rows + '<div class="summary-divider"></div>' +
            '<div class="summary-total"><span>Total</span><span>' + money(quote.total_amount) + '</span></div>';
        });
      }

      form.addEventListener('change', refreshQuote);
      form.addEventListener('input', refreshQuote);
      refreshQuote();

      /* Reflect the pre-checked state (none today, but keeps the UI honest if
         the defaults change). */
      qsa('[data-extra]', form).forEach(function (input) {
        var card = input.closest('.extra-option');
        if (card) { card.classList.toggle('is-selected', input.checked); }
      });

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var payload = {
          customer_id: el('bookCustomer').value,
          vehicle_id: vehicle.id,
          pickup_date: el('bookPickup').value,
          return_date: el('bookReturn').value,
          extras: qsa('[data-extra]:checked', form).map(function (i) { return i.value; }),
          pickup_branch: vehicle.branch,
          status: 'reserved'
        };
        if (!payload.customer_id) { toast('Please choose a customer for this booking.', 'warning'); return; }

        Promise.resolve(api.rentals.create(payload)).then(function (created) {
          if (!created || created.error) { toast((created && created.error) || 'Booking failed.', 'error'); return; }
          closeModal();
          toast('Booking #' + created.id + ' created for ' + created.customer_name + '.', 'success');
          refreshCurrentPage();
        }).catch(function (error) { toast(error.message || 'Booking failed.', 'error'); });
      });
    });
  }

  /* --------------------------- Table helpers --------------------------- */

  function metricCard(metric) {
    return '<article class="card metric-card">' +
      '<span class="metric-icon">' + (ICONS[metric.icon] || ICONS.grid || '') + '</span>' +
      '<div class="metric-value">' + esc(metric.value) + '</div>' +
      '<div class="metric-label">' + esc(metric.label) + '</div>' +
      (metric.change ? '<div class="metric-change ' + metric.change.direction + '">' + esc(metric.change.text) + '</div>' : '') +
    '</article>';
  }

  function renderTable(host, config) {
    if (!host) return;
    var columns = config.columns;
    if (!config.rows.length) {
      host.innerHTML = emptyState(config.emptyTitle || 'Nothing to show yet', config.emptyMessage || 'Records will appear here as soon as they are created.');
      return;
    }
    var head = columns.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('');
    var body = config.rows.map(function (row) {
      var cells = columns.map(function (c) { return '<td>' + c.render(row) + '</td>'; }).join('');
      return '<tr>' + cells + '</tr>';
    }).join('');
    host.innerHTML = '<div class="table-wrapper"><table class="table"><thead><tr>' + head +
      '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  function renderPagination(host, page, pages, onGo) {
    if (!host) return;
    if (pages <= 1) { host.innerHTML = ''; return; }
    var buttons = [];
    for (var i = 1; i <= pages; i += 1) {
      buttons.push('<button class="pagination-btn' + (i === page ? ' active' : '') + '" type="button" data-page-go="' + i + '">' + i + '</button>');
    }
    host.innerHTML =
      '<button class="pagination-btn" type="button" data-page-go="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + '>Prev</button>' +
      buttons.join('') +
      '<button class="pagination-btn" type="button" data-page-go="' + (page + 1) + '"' + (page === pages ? ' disabled' : '') + '>Next</button>';
    qsa('[data-page-go]', host).forEach(function (button) {
      button.addEventListener('click', function () {
        var target = Number(button.getAttribute('data-page-go'));
        if (target >= 1 && target <= pages) { onGo(target); }
      });
    });
  }

  function formValues(form) {
    var values = {};
    qsa('input, select, textarea', form).forEach(function (field) {
      if (!field.name) return;
      if (field.type === 'checkbox') { values[field.name] = field.checked; return; }
      values[field.name] = field.value;
    });
    return values;
  }

  function queryFilters() {
    var params = new window.URLSearchParams(window.location.search);
    var filters = {};
    params.forEach(function (value, key) { if (value) { filters[key] = value; } });
    return filters;
  }

  /* --------------------------- Feature: home --------------------------- */

  function initHome() {
    /* Counters are decorative: never let them stop the fleet grid from loading. */
    try { animateCounters(); } catch (error) { console.warn('[DriveFleet] counter animation skipped:', error.message); }

    var host = el('featuredVehicles');
    var limit = host ? Number(host.getAttribute('data-limit')) || 6 : 6;
    if (host) {
      host.innerHTML = skeleton(3);
      Promise.resolve(api.vehicles.list({ sort: 'rating' })).then(function (rows) {
        var vehicles = (rows || []).slice(0, limit);
        renderVehicleGrid(host, vehicles);
        bindVehicleActions(vehicles, host);
      }).catch(function () {
        host.innerHTML = emptyState('Fleet unavailable', 'The vehicle list could not be loaded right now.');
      });
    }

    var form = el('heroSearchForm');
    if (form) {
      var pickup = el('searchPickup');
      var back = el('searchReturn');
      if (pickup && !pickup.value) { pickup.value = addDays(todayISO(), 1); }
      if (back && !back.value) { back.value = addDays(todayISO(), 4); }
      if (pickup && back) {
        pickup.addEventListener('change', function () {
          if (back.value && back.value <= pickup.value) { back.value = addDays(pickup.value, 3); }
        });
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var values = formValues(form);
        var params = new window.URLSearchParams();
        Object.keys(values).forEach(function (key) { if (values[key]) { params.set(key, values[key]); } });
        window.location.href = ROOT + 'pages/vehicles.html' + (params.toString() ? '?' + params.toString() : '');
      });
    }
  }

  /* ------------------------- Feature: dashboard ------------------------ */

  function initDashboard() {
    guardAuthPage();
    var host = el('statStrip');
    if (host) { host.innerHTML = skeleton(2); }

    Promise.resolve(api.stats.overview()).then(function (overview) {
      if (!overview) return;

      if (host) {
        host.innerHTML = [
          { icon: 'car', value: overview.vehicles_total, label: 'Vehicles in fleet' },
          { icon: 'check', value: overview.vehicles_available, label: 'Available now' },
          { icon: 'calendar', value: overview.rentals_active, label: 'Active rentals' },
          { icon: 'card', value: money(overview.revenue_total), label: 'Revenue collected' },
          { icon: 'users', value: overview.customers_total, label: 'Customers' },
          { icon: 'grid', value: overview.fleet_utilisation + '%', label: 'Fleet utilisation' }
        ].map(metricCard).join('');
      }

      var fleet = el('fleetStatus');
      if (fleet) {
        var statuses = [
          { label: 'Available', value: overview.vehicles_available, cls: 'badge-success' },
          { label: 'Rented', value: overview.vehicles_rented, cls: 'badge-warning' },
          { label: 'Maintenance', value: overview.vehicles_maintenance, cls: 'badge-error' }
        ];
        var total = overview.vehicles_total || 1;
        fleet.innerHTML = statuses.map(function (s) {
          return '<div class="summary-row"><span class="summary-label">' + s.label + '</span>' +
            '<span class="summary-value"><span class="badge ' + s.cls + '">' + s.value + '</span> ' + Math.round((s.value / total) * 100) + '%</span></div>';
        }).join('') + '<div class="summary-divider"></div>' +
          '<div class="summary-total"><span>Outstanding</span><span>' + money(overview.outstanding_total) + '</span></div>';
      }

      renderTable(el('recentRentals'), {
        rows: overview.recent_rentals || [],
        emptyTitle: 'No rentals yet',
        emptyMessage: 'Create your first booking from the vehicles page.',
        columns: [
          { label: 'Rental', render: function (r) { return '<span class="cell-title">#' + r.id + '</span>'; } },
          { label: 'Customer', render: function (r) { return '<div class="cell-main"><span class="avatar">' + initials(r.customer_name) + '</span><div><div class="cell-title">' + esc(r.customer_name) + '</div><div class="cell-sub">' + esc(r.customer_email) + '</div></div></div>'; } },
          { label: 'Vehicle', render: function (r) { return esc(r.vehicle_name) + '<div class="cell-sub">' + esc(r.vehicle_plate) + '</div>'; } },
          { label: 'Dates', render: function (r) { return date(r.pickup_date) + ' → ' + date(r.return_date); } },
          { label: 'Total', render: function (r) { return money(r.total_amount); } },
          { label: 'Status', render: function (r) { return badge(r.status); } }
        ]
      });
    }).catch(function (error) {
      if (host) { host.innerHTML = emptyState('Dashboard unavailable', error.message || 'Stats could not be loaded.'); }
    });

    var reset = el('resetMockDb');
    if (reset) {
      reset.addEventListener('click', function () {
        api.resetDb();
        toast('Mock database restored to seed data.', 'info');
        refreshCurrentPage();
      });
    }
  }

  function guardAuthPage() {
    var banner = el('authNotice');
    if (!banner) return;
    var authed = api.auth && api.auth.isAuthenticated && api.auth.isAuthenticated();
    banner.innerHTML = authed
      ? '<div class="alert alert-success">' + CHECK_ICON + ' Signed in as ' + esc((api.auth.getUser() || {}).name || 'user') + '.</div>'
      : '<div class="alert alert-info">You are browsing in guest mode — the mock API is serving live data. ' +
        '<a href="login.html">Sign in</a> to attach a session token.</div>';
  }

  /* ------------------------- Feature: vehicles ------------------------- */

  var vehiclesState = { filters: {}, page: 1, perPage: 6, rows: [] };

  function initVehicles() {
    guardAuthPage();
    var form = el('vehicleFilters');
    var results = el('vehicleResults');
    var count = el('resultsCount');
    var pager = el('pagination');

    var before = queryFilters();
    vehiclesState.filters = before;
    if (form) {
      Object.keys(before).forEach(function (key) {
        var field = qs('[name="' + key + '"]', form);
        if (field) { field.value = before[key]; }
      });
      var pickupField = qs('[name="pickup_date"]', form);
      var returnField = qs('[name="return_date"]', form);
      if (pickupField && !pickupField.value) { pickupField.value = addDays(todayISO(), 1); }
      if (returnField && !returnField.value) { returnField.value = addDays(todayISO(), 4); }
    }

    function load() {
      if (results) { results.innerHTML = skeleton(4); }
      vehiclesState.filters.pickup_date = vehiclesState.filters.pickup_date || (qs('[name="pickup_date"]', form) || {}).value || '';
      vehiclesState.filters.return_date = vehiclesState.filters.return_date || (qs('[name="return_date"]', form) || {}).value || '';

      Promise.resolve(api.vehicles.list(vehiclesState.filters)).then(function (rows) {
        vehiclesState.rows = rows || [];
        paint();
      }).catch(function (error) {
        if (results) { results.innerHTML = emptyState('Fleet unavailable', error.message || 'Vehicles could not be loaded.'); }
      });
    }

    function paint() {
      var pages = Math.max(1, Math.ceil(vehiclesState.rows.length / vehiclesState.perPage));
      if (vehiclesState.page > pages) { vehiclesState.page = pages; }
      var start = (vehiclesState.page - 1) * vehiclesState.perPage;
      var slice = vehiclesState.rows.slice(start, start + vehiclesState.perPage);

      renderVehicleGrid(results, slice);
      bindVehicleActions(slice, results);
      if (count) { count.textContent = vehiclesState.rows.length + ' vehicle' + (vehiclesState.rows.length === 1 ? '' : 's'); }
      renderPagination(pager, vehiclesState.page, pages, function (target) {
        vehiclesState.page = target;
        paint();
        var fleet = el('fleet');
        if (fleet && fleet.scrollIntoView) { fleet.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        vehiclesState.filters = formValues(form);
        vehiclesState.page = 1;
        var params = new window.URLSearchParams();
        Object.keys(vehiclesState.filters).forEach(function (key) {
          if (vehiclesState.filters[key] && key !== 'available_only') { params.set(key, vehiclesState.filters[key]); }
        });
        window.history.replaceState(null, '', window.location.pathname + (params.toString() ? '?' + params.toString() : ''));
        load();
      });
      form.addEventListener('reset', function () {
        window.setTimeout(function () {
          vehiclesState.filters = {};
          vehiclesState.page = 1;
          load();
        }, 0);
      });
    }

    var addButton = el('addVehicleBtn');
    if (addButton) { addButton.addEventListener('click', openVehicleForm); }

    registerReload('vehicles', load);
    load();
  }

  function openVehicleForm() {
    var types = (window.DriveFleetData && window.DriveFleetData.vehicle_types) || ['sedan', 'suv', 'hatchback', 'pickup', 'van', 'luxury'];
    var branches = ((window.DriveFleetData && window.DriveFleetData.branches) || []).map(function (b) { return b.name; });

    openModal({
      title: 'Add a vehicle to the fleet',
      body:
        '<form id="vehicleForm" class="form-row">' +
          '<div class="form-group"><label class="form-label" for="vBrand">Brand</label><input class="form-input" id="vBrand" name="brand" required /></div>' +
          '<div class="form-group"><label class="form-label" for="vModel">Model</label><input class="form-input" id="vModel" name="model" required /></div>' +
          '<div class="form-group"><label class="form-label" for="vType">Type</label><select class="form-select" id="vType" name="type">' +
            types.map(function (t) { return '<option value="' + t + '">' + typeLabel(t) + '</option>'; }).join('') + '</select></div>' +
          '<div class="form-group"><label class="form-label" for="vBranch">Branch</label><select class="form-select" id="vBranch" name="branch">' +
            branches.map(function (b) { return '<option value="' + esc(b) + '">' + esc(b) + '</option>'; }).join('') + '</select></div>' +
          '<div class="form-group"><label class="form-label" for="vPrice">Price per day ($)</label><input class="form-input" id="vPrice" name="price_per_day" type="number" min="1" step="1" value="75" required /></div>' +
          '<div class="form-group"><label class="form-label" for="vPlate">Plate</label><input class="form-input" id="vPlate" name="plate" placeholder="DF-0000" /></div>' +
          '<div class="form-group"><label class="form-label" for="vSeats">Seats</label><input class="form-input" id="vSeats" name="seats" type="number" min="2" max="9" value="5" /></div>' +
          '<div class="form-group"><label class="form-label" for="vFuel">Fuel</label><select class="form-select" id="vFuel" name="fuel">' +
            ['Petrol', 'Diesel', 'Hybrid', 'Electric'].map(function (f) { return '<option value="' + f + '">' + f + '</option>'; }).join('') + '</select></div>' +
        '</form>',
      footer: '<button class="btn btn-ghost" type="button" data-close-modal>Cancel</button>' +
        '<button class="btn btn-primary" type="submit" form="vehicleForm">Save vehicle</button>'
    });

    var form = el('vehicleForm');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var payload = formValues(form);
      payload.price_per_day = Number(payload.price_per_day);
      payload.seats = Number(payload.seats);
      payload.status = 'available';
      payload.year = new Date().getFullYear();
      payload.rating = 4.5;
      Promise.resolve(api.vehicles.create(payload)).then(function (created) {
        closeModal();
        toast((created && created.name ? created.name : 'Vehicle') + ' added to the fleet.', 'success');
        refreshCurrentPage();
      }).catch(function (error) { toast(error.message || 'Could not save the vehicle.', 'error'); });
    });
  }

  /* ------------------------ Feature: customers ------------------------- */

  function initCustomers() {
    guardAuthPage();
    var form = el('customerFilters');
    var host = el('customerResults');
    var count = el('resultsCount');
    var pager = el('pagination');
    var state = { filters: queryFilters(), page: 1, perPage: 8, rows: [] };

    if (form) {
      Object.keys(state.filters).forEach(function (key) {
        var field = qs('[name="' + key + '"]', form);
        if (field) { field.value = state.filters[key]; }
      });
    }

    function load() {
      if (host) { host.innerHTML = '<div class="loading-center"><span class="spinner"></span></div>'; }
      return Promise.resolve(api.customers.list(state.filters)).then(function (rows) {
        state.rows = rows || [];
        paint();
      }).catch(function (error) {
        if (host) { host.innerHTML = emptyState('Customers unavailable', error.message || 'The list could not be loaded.'); }
      });
    }

    function paint() {
      var pages = Math.max(1, Math.ceil(state.rows.length / state.perPage));
      if (state.page > pages) { state.page = pages; }
      var start = (state.page - 1) * state.perPage;
      var slice = state.rows.slice(start, start + state.perPage);

      renderTable(host, {
        rows: slice,
        emptyTitle: 'No customers found',
        emptyMessage: 'Adjust the search or add a new customer to the directory.',
        columns: [
          { label: 'Customer', render: function (c) { return '<div class="cell-main"><span class="avatar">' + initials(c.first_name + ' ' + c.last_name) + '</span><div><div class="cell-title">' + esc(c.first_name + ' ' + c.last_name) + '</div><div class="cell-sub">' + esc(c.email) + '</div></div></div>'; } },
          { label: 'Phone', render: function (c) { return esc(c.phone || '—'); } },
          { label: 'Licence', render: function (c) { return esc(c.licence_number || '—'); } },
          { label: 'City', render: function (c) { return esc(c.city) + '<div class="cell-sub">' + esc(c.country) + '</div>'; } },
          { label: 'Member since', render: function (c) { return date(c.created_at); } },
          { label: 'Status', render: function (c) { return badge(c.status); } },
          { label: '', render: function (c) { return '<div class="table-actions"><button class="btn btn-ghost btn-sm" type="button" data-customer="' + c.id + '">View</button></div>'; } }
        ]
      });

      qsa('[data-customer]', host).forEach(function (button) {
        button.addEventListener('click', function () { openCustomerDetails(button.getAttribute('data-customer')); });
      });

      if (count) { count.textContent = state.rows.length + ' customer' + (state.rows.length === 1 ? '' : 's'); }
      renderPagination(pager, state.page, pages, function (target) { state.page = target; paint(); });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        state.filters = formValues(form);
        state.page = 1;
        load();
      });
      form.addEventListener('reset', function () {
        window.setTimeout(function () { state.filters = {}; state.page = 1; load(); }, 0);
      });
    }

    var add = el('addCustomerBtn');
    if (add) { add.addEventListener('click', openCustomerForm); }

    registerReload('customers', load);
    load();
  }

  function openCustomerDetails(id) {
    Promise.all([
      Promise.resolve(api.customers.get(id)),
      Promise.resolve(api.rentals.list({ customer_id: id }))
    ]).then(function (results) {
      var customer = results[0];
      var rentals = results[1] || [];
      if (!customer) { toast('Customer not found.', 'warning'); return; }

      var rows = [
        ['Email', customer.email],
        ['Phone', customer.phone || '—'],
        ['Licence', customer.licence_number || '—'],
        ['City', customer.city + ', ' + customer.country],
        ['Member since', date(customer.created_at)],
        ['Status', typeLabel(customer.status)]
      ].map(function (pair) {
        return '<div class="summary-row"><span class="summary-label">' + esc(pair[0]) + '</span><span class="summary-value">' + esc(pair[1]) + '</span></div>';
      }).join('');

      var history = rentals.length
        ? rentals.map(function (r) {
            return '<div class="summary-row"><span class="summary-label">#' + r.id + ' · ' + esc(r.vehicle_name) + '</span>' +
              '<span class="summary-value">' + date(r.pickup_date) + ' → ' + date(r.return_date) + ' · ' + money(r.total_amount) + '</span></div>';
          }).join('')
        : '<span class="body-sm text-muted">No rentals recorded for this customer yet.</span>';

      openModal({
        title: customer.first_name + ' ' + customer.last_name,
        body: '<div class="summary-list">' + rows + '</div>' +
          '<div class="filter-title">Rental history (' + rentals.length + ')</div><div class="summary-list">' + history + '</div>',
        footer: '<button class="btn btn-ghost" type="button" data-close-modal>Close</button>'
      });
    });
  }

  function openCustomerForm() {
    openModal({
      title: 'Add a customer',
      body:
        '<form id="customerForm" class="form-row">' +
          '<div class="form-group"><label class="form-label" for="cFirst">First name</label><input class="form-input" id="cFirst" name="first_name" required /></div>' +
          '<div class="form-group"><label class="form-label" for="cLast">Last name</label><input class="form-input" id="cLast" name="last_name" required /></div>' +
          '<div class="form-group"><label class="form-label" for="cEmail">Email</label><input class="form-input" id="cEmail" name="email" type="email" required /></div>' +
          '<div class="form-group"><label class="form-label" for="cPhone">Phone</label><input class="form-input" id="cPhone" name="phone" placeholder="+351 …" /></div>' +
          '<div class="form-group"><label class="form-label" for="cLicence">Licence number</label><input class="form-input" id="cLicence" name="licence_number" /></div>' +
          '<div class="form-group"><label class="form-label" for="cCity">City</label><input class="form-input" id="cCity" name="city" value="Lisbon" /></div>' +
        '</form>',
      footer: '<button class="btn btn-ghost" type="button" data-close-modal>Cancel</button>' +
        '<button class="btn btn-primary" type="submit" form="customerForm">Save customer</button>'
    });

    el('customerForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var payload = formValues(el('customerForm'));
      payload.status = 'new';
      payload.country = 'Portugal';
      Promise.resolve(api.customers.create(payload)).then(function (created) {
        closeModal();
        toast((created ? created.first_name + ' ' + created.last_name : 'Customer') + ' added.', 'success');
        refreshCurrentPage();
      }).catch(function (error) { toast(error.message || 'Could not save the customer.', 'error'); });
    });
  }

  /* ------------------------- Feature: rentals -------------------------- */

  function initRentals() {
    guardAuthPage();
    var form = el('rentalFilters');
    var host = el('rentalResults');
    var count = el('resultsCount');
    var state = { filters: queryFilters(), rows: [] };

    if (form) {
      Object.keys(state.filters).forEach(function (key) {
        var field = qs('[name="' + key + '"]', form);
        if (field) { field.value = state.filters[key]; }
      });
    }

    function load() {
      if (host) { host.innerHTML = '<div class="loading-center"><span class="spinner"></span></div>'; }
      return Promise.resolve(api.rentals.list(state.filters)).then(function (rows) {
        state.rows = rows || [];
        paint();
      }).catch(function (error) {
        if (host) { host.innerHTML = emptyState('Rentals unavailable', error.message || 'The rental list could not be loaded.'); }
      });
    }

    function paint() {
      renderTable(host, {
        rows: state.rows,
        emptyTitle: 'No rentals match those filters',
        emptyMessage: 'Clear the filters or create a new booking from the vehicles page.',
        columns: [
          { label: 'Rental', render: function (r) { return '<span class="cell-title">#' + r.id + '</span><div class="cell-sub">' + esc(r.pickup_branch || '') + '</div>'; } },
          { label: 'Customer', render: function (r) { return esc(r.customer_name) + '<div class="cell-sub">' + esc(r.customer_email) + '</div>'; } },
          { label: 'Vehicle', render: function (r) { return esc(r.vehicle_name) + '<div class="cell-sub">' + esc(r.vehicle_plate) + '</div>'; } },
          { label: 'Pick-up', render: function (r) { return date(r.pickup_date); } },
          { label: 'Return', render: function (r) { return date(r.return_date); } },
          { label: 'Total', render: function (r) { return money(r.total_amount) + '<div class="cell-sub">Balance ' + money(r.balance) + '</div>'; } },
          { label: 'Payment', render: function (r) { return badge(r.payment_status); } },
          { label: 'Status', render: function (r) { return badge(r.status); } },
          { label: '', render: function (r) {
              return '<div class="table-actions">' +
                '<button class="btn btn-ghost btn-sm" type="button" data-rental-status="active" data-rental="' + r.id + '">Activate</button>' +
                '<button class="btn btn-ghost btn-sm" type="button" data-rental-status="completed" data-rental="' + r.id + '">Complete</button>' +
                '<button class="btn btn-danger btn-sm" type="button" data-rental-delete="' + r.id + '">Delete</button>' +
              '</div>';
            } }
        ]
      });

      qsa('[data-rental-status]', host).forEach(function (button) {
        button.addEventListener('click', function () {
          var id = button.getAttribute('data-rental');
          var status = button.getAttribute('data-rental-status');
          Promise.resolve(api.rentals.update(id, { status: status })).then(function (updated) {
            toast('Rental #' + id + ' marked as ' + status + '.', 'success');
            if (status === 'completed' && updated) { load(); } else { load(); }
          }).catch(function (error) { toast(error.message || 'Update failed.', 'error'); });
        });
      });

      qsa('[data-rental-delete]', host).forEach(function (button) {
        button.addEventListener('click', function () {
          var id = button.getAttribute('data-rental-delete');
          Promise.resolve(api.rentals.remove(id)).then(function () {
            toast('Rental #' + id + ' deleted.', 'info');
            load();
          }).catch(function (error) { toast(error.message || 'Delete failed.', 'error'); });
        });
      });

      if (count) { count.textContent = state.rows.length + ' rental' + (state.rows.length === 1 ? '' : 's'); }
    }

    if (form) {
      form.addEventListener('submit', function (event) { event.preventDefault(); state.filters = formValues(form); load(); });
      form.addEventListener('reset', function () { window.setTimeout(function () { state.filters = {}; load(); }, 0); });
    }

    var add = el('newRentalBtn');
    if (add) { add.addEventListener('click', openRentalPicker); }

    registerReload('rentals', load);
    load();
  }

  function openRentalPicker() {
    Promise.resolve(api.vehicles.list({ status: 'available' })).then(function (vehicles) {
      var cards = (vehicles || []).map(function (v) {
        return '<button class="btn btn-outline btn-block" type="button" data-pick="' + v.id + '">' +
          esc(v.brand + ' ' + v.model) + ' · ' + money(v.price_per_day) + '/day</button>';
      }).join('') || '<p class="body-sm text-muted">No vehicles are available right now.</p>';

      openModal({
        title: 'Start a new rental',
        body: '<div class="filter-title">Pick an available vehicle</div><div class="stack-list">' + cards + '</div>',
        footer: '<button class="btn btn-ghost" type="button" data-close-modal>Cancel</button>'
      });

      qsa('[data-pick]', el('appModalOverlay')).forEach(function (button) {
        button.addEventListener('click', function () {
          var id = button.getAttribute('data-pick');
          var vehicle = (vehicles || []).filter(function (v) { return String(v.id) === String(id); })[0];
          closeModal();
          openBookingModal(vehicle);
        });
      });
    });
  }

  /* ------------------------- Feature: payments ------------------------- */

  function initPayments() {
    guardAuthPage();
    var form = el('paymentFilters');
    var host = el('paymentResults');
    var count = el('resultsCount');
    var summary = el('paymentSummary');
    var state = { filters: queryFilters(), rows: [] };

    if (form) {
      Object.keys(state.filters).forEach(function (key) {
        var field = qs('[name="' + key + '"]', form);
        if (field) { field.value = state.filters[key]; }
      });
    }

    function load() {
      if (host) { host.innerHTML = '<div class="loading-center"><span class="spinner"></span></div>'; }
      return Promise.resolve(api.payments.list(state.filters)).then(function (rows) {
        state.rows = rows || [];
        paint();
      }).catch(function (error) {
        if (host) { host.innerHTML = emptyState('Payments unavailable', error.message || 'The ledger could not be loaded.'); }
      });
    }

    function paint() {
      renderTable(host, {
        rows: state.rows,
        emptyTitle: 'No payments recorded',
        emptyMessage: 'Record a deposit or a final payment to build the ledger.',
        columns: [
          { label: 'Reference', render: function (p) { return '<span class="cell-title">' + esc(p.reference) + '</span><div class="cell-sub">Rental #' + p.rental_id + '</div>'; } },
          { label: 'Customer', render: function (p) { return esc(p.customer_name || '—') + '<div class="cell-sub">' + esc(p.vehicle_name || '') + '</div>'; } },
          { label: 'Type', render: function (p) { return '<span class="chip">' + esc(typeLabel(p.type)) + '</span>'; } },
          { label: 'Method', render: function (p) { return esc(typeLabel(String(p.method || '').replace('_', ' '))); } },
          { label: 'Amount', render: function (p) { return money(p.amount); } },
          { label: 'Date', render: function (p) { return date(p.paid_at); } },
          { label: 'Status', render: function (p) { return badge(p.status); } },
          { label: '', render: function (p) {
              return '<div class="table-actions">' +
                (p.status === 'pending' ? '<button class="btn btn-ghost btn-sm" type="button" data-pay-complete="' + p.id + '">Mark paid</button>' : '') +
                '<button class="btn btn-danger btn-sm" type="button" data-pay-delete="' + p.id + '">Delete</button>' +
              '</div>';
            } }
        ]
      });

      var collected = state.rows.filter(function (p) { return p.status === 'completed'; })
        .reduce(function (sum, p) { return sum + p.amount; }, 0);
      var pending = state.rows.filter(function (p) { return p.status === 'pending'; })
        .reduce(function (sum, p) { return sum + p.amount; }, 0);

      if (summary) {
        summary.innerHTML =
          '<div class="summary-row"><span class="summary-label">Collected</span><span class="summary-value">' + money(collected) + '</span></div>' +
          '<div class="summary-row"><span class="summary-label">Pending</span><span class="summary-value">' + money(pending) + '</span></div>' +
          '<div class="summary-divider"></div>' +
          '<div class="summary-total"><span>Records</span><span>' + state.rows.length + '</span></div>';
      }

      qsa('[data-pay-complete]', host).forEach(function (button) {
        button.addEventListener('click', function () {
          var id = button.getAttribute('data-pay-complete');
          Promise.resolve(api.payments.update(id, { status: 'completed' })).then(function () {
            toast('Payment ' + id + ' marked as completed.', 'success');
            load();
          }).catch(function (error) { toast(error.message || 'Update failed.', 'error'); });
        });
      });

      qsa('[data-pay-delete]', host).forEach(function (button) {
        button.addEventListener('click', function () {
          var id = button.getAttribute('data-pay-delete');
          Promise.resolve(api.payments.remove(id)).then(function () {
            toast('Payment ' + id + ' deleted.', 'info');
            load();
          }).catch(function (error) { toast(error.message || 'Delete failed.', 'error'); });
        });
      });

      if (count) { count.textContent = state.rows.length + ' payment' + (state.rows.length === 1 ? '' : 's'); }
    }

    if (form) {
      form.addEventListener('submit', function (event) { event.preventDefault(); state.filters = formValues(form); load(); });
      form.addEventListener('reset', function () { window.setTimeout(function () { state.filters = {}; load(); }, 0); });
    }

    var add = el('recordPaymentBtn');
    if (add) { add.addEventListener('click', openPaymentForm); }

    registerReload('payments', load);
    load();
  }

  function openPaymentForm() {
    Promise.resolve(api.rentals.list({})).then(function (rentals) {
      var options = (rentals || []).map(function (r) {
        return '<option value="' + r.id + '">#' + r.id + ' · ' + esc(r.customer_name) + ' · ' + esc(r.vehicle_name) + ' (' + money(r.total_amount) + ')</option>';
      }).join('');

      openModal({
        title: 'Record a payment',
        body:
          '<form id="paymentForm" class="form-row">' +
            '<div class="form-group"><label class="form-label" for="pRental">Rental</label><select class="form-select" id="pRental" name="rental_id" required>' + options + '</select></div>' +
            '<div class="form-group"><label class="form-label" for="pAmount">Amount ($)</label><input class="form-input" id="pAmount" name="amount" type="number" min="1" step="0.01" value="150" required /></div>' +
            '<div class="form-group"><label class="form-label" for="pMethod">Method</label><select class="form-select" id="pMethod" name="method">' +
              ['card', 'cash', 'bank_transfer', 'paypal'].map(function (m) { return '<option value="' + m + '">' + typeLabel(m.replace('_', ' ')) + '</option>'; }).join('') + '</select></div>' +
            '<div class="form-group"><label class="form-label" for="pType">Type</label><select class="form-select" id="pType" name="type">' +
              ['deposit', 'rental', 'refund', 'penalty'].map(function (t) { return '<option value="' + t + '">' + typeLabel(t) + '</option>'; }).join('') + '</select></div>' +
            '<div class="form-group"><label class="form-label" for="pStatus">Status</label><select class="form-select" id="pStatus" name="status">' +
              ['completed', 'pending', 'refunded', 'failed'].map(function (s) { return '<option value="' + s + '">' + typeLabel(s) + '</option>'; }).join('') + '</select></div>' +
            '<div class="form-group"><label class="form-label" for="pDate">Payment date</label><input class="form-input" type="date" id="pDate" name="paid_at" value="' + todayISO() + '" /></div>' +
          '</form>',
        footer: '<button class="btn btn-ghost" type="button" data-close-modal>Cancel</button>' +
          '<button class="btn btn-primary" type="submit" form="paymentForm">Save payment</button>'
      });

      el('paymentForm').addEventListener('submit', function (event) {
        event.preventDefault();
        var payload = formValues(el('paymentForm'));
        payload.amount = Number(payload.amount);
        Promise.resolve(api.payments.create(payload)).then(function () {
          closeModal();
          toast('Payment recorded successfully.', 'success');
          refreshCurrentPage();
        }).catch(function (error) { toast(error.message || 'Could not record the payment.', 'error'); });
      });
    });
  }

  /* --------------------------- Feature: login -------------------------- */

  function showFieldError(hostId, message) {
    var host = el(hostId);
    if (host) {
      host.textContent = message || '';
      host.style.display = message ? 'block' : 'none';
    }
  }

  function persistSession(payload) {
    if (!payload || payload.error || !payload.token) return false;
    if (api.auth && api.auth.setToken) {
      api.auth.setToken(payload.token);
      api.auth.setUser(payload.user || null);
    }
    return true;
  }

  function initLogin() {
    var form = el('loginForm');
    if (!form) return;

    var demo = el('demoHint');
    if (demo) {
      demo.innerHTML = '<strong>Demo accounts</strong><br>admin@drivefleet.test / admin123<br>amelia.moreau@example.com / customer123';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var values = formValues(form);
      showFieldError('loginError', '');

      if (!values.email || !values.password) {
        showFieldError('loginError', 'Enter your email and password to continue.');
        return;
      }

      var submit = qs('button[type="submit"]', form);
      if (submit) { submit.disabled = true; submit.textContent = 'Signing in…'; }

      Promise.resolve(api.auth.login({ email: values.email, password: values.password })).then(function (result) {
        if (submit) { submit.disabled = false; submit.textContent = 'Sign in'; }
        if (!persistSession(result)) {
          showFieldError('loginError', (result && result.error) || 'Invalid credentials.');
          toast((result && result.error) || 'Sign-in failed.', 'error');
          return;
        }
        toast('Welcome back, ' + ((result.user && result.user.name) || 'driver') + '!', 'success');
        window.setTimeout(function () { window.location.href = 'dashboard.html'; }, 600);
      }).catch(function (error) {
        if (submit) { submit.disabled = false; submit.textContent = 'Sign in'; }
        showFieldError('loginError', error.message || 'Sign-in failed.');
      });
    });
  }

  /* -------------------------- Feature: register ------------------------ */

  function initRegister() {
    var form = el('registerForm');
    if (!form) return;

    var password = qs('[name="password"]', form);
    var strength = el('passwordStrength');
    if (password && strength) {
      strength.innerHTML = '<span></span><span></span><span></span><span></span>';
      var hint = el('passwordHint');
      password.addEventListener('input', function () {
        var value = password.value;
        var score = 0;
        if (value.length >= 8) { score += 1; }
        if (/[A-Z]/.test(value)) { score += 1; }
        if (/[0-9]/.test(value)) { score += 1; }
        if (/[^A-Za-z0-9]/.test(value)) { score += 1; }
        strength.className = 'password-strength' + (value && score ? ' s' + score : '');
        if (hint) {
          hint.textContent = value
            ? ['Too short — use at least 8 characters.', 'Weak — add a capital letter.', 'Fair — add a number.', 'Good — add a symbol.', 'Strong password.'][score]
            : 'Use 8+ characters with a capital letter, a number and a symbol.';
        }
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var values = formValues(form);
      showFieldError('registerError', '');

      if (!values.email || !values.password) {
        showFieldError('registerError', 'Email and password are required.');
        return;
      }
      if (values.password !== values.confirm_password) {
        showFieldError('registerError', 'The two passwords do not match.');
        return;
      }

      var submit = qs('button[type="submit"]', form);
      if (submit) { submit.disabled = true; submit.textContent = 'Creating account…'; }

      Promise.resolve(api.auth.register({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        username: values.username,
        password: values.password
      })).then(function (result) {
        if (submit) { submit.disabled = false; submit.textContent = 'Create account'; }
        if (!persistSession(result)) {
          showFieldError('registerError', (result && result.error) || 'Registration failed.');
          toast((result && result.error) || 'Registration failed.', 'error');
          return;
        }
        toast('Account created — welcome to DriveFleet!', 'success');
        window.setTimeout(function () { window.location.href = 'dashboard.html'; }, 700);
      }).catch(function (error) {
        if (submit) { submit.disabled = false; submit.textContent = 'Create account'; }
        showFieldError('registerError', error.message || 'Registration failed.');
      });
    });
  }

  /* ------------------------------- Router ------------------------------ */

  var reloads = {};

  function registerReload(page, fn) { reloads[page] = fn; }

  var FEATURES = {
    home: initHome,
    dashboard: initDashboard,
    vehicles: initVehicles,
    customers: initCustomers,
    rentals: initRentals,
    payments: initPayments,
    login: initLogin,
    register: initRegister
  };

  function currentPage() {
    return (document.body && document.body.getAttribute('data-page')) || 'home';
  }

  function runFeature(page) {
    var feature = FEATURES[page];
    if (typeof feature !== 'function') { return; }
    try {
      feature();
    } catch (error) {
      console.error('[DriveFleet] feature "' + page + '" failed:', error);
      toast('Something went wrong while loading this page.', 'error');
    }
  }

  function refreshCurrentPage() {
    var page = currentPage();
    if (reloads[page]) { reloads[page](); return; }
    runFeature(page);
  }

  function initPage() {
    if (window.DriveFleetComponents && window.DriveFleetComponents.renderAll) {
      window.DriveFleetComponents.renderAll();
    }
    runFeature(currentPage());
    initReveal();
  }

  window.DriveFleetInit = {
    initPage: initPage,
    runFeature: runFeature,
    refresh: refreshCurrentPage,
    reloads: reloads,
    pages: Object.keys(FEATURES)
  };

  window.DriveFleetUI = {
    openModal: openModal,
    closeModal: closeModal,
    toast: toast,
    money: money,
    date: date,
    badge: badge,
    initials: initials
  };

  /* Auto-init: pages also call DriveFleetInit.initPage() explicitly, so guard
     against a double run when both paths fire. */
  function boot() {
    if (window.__driveFleetBooted) { return; }
    window.__driveFleetBooted = true;
    initPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
