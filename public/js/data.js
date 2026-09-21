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
