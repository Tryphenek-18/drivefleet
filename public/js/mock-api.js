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
