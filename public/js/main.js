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
        '<div class="modal' + (options.size === 'lg' ? ' modal-lg' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(options.title || 'Dialog') + '">' +
          '<div class="modal-header">' +
            '<h3>' + esc(options.title || '') + '</h3>' +
            '<button class="modal-close" type="button" aria-label="Close" data-close-modal>&times;</button>' +
          '</div>' +
          '<div class="modal-body">' + (options.body || '') + '</div>' +
          (options.footer ? '<div class="modal-footer">' + options.footer + '</div>' : '') +
        '</div>' +
      '</div>';
    var overlay = el('appModalOverlay');
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay || event.target.closest('[data-close-modal]')) { closeModal(); }
    });
    document.addEventListener('keydown', modalEscape);
    document.body.style.overflow = 'hidden';
    return overlay;
  }

  function modalEscape(event) {
    if (event.key === 'Escape') { closeModal(); }
  }

  function closeModal() {
    var overlay = el('appModalOverlay');
    if (overlay && overlay.parentNode) { overlay.parentNode.removeChild(overlay); }
    document.removeEventListener('keydown', modalEscape);
    document.body.style.overflow = '';
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
  }

  function bindVehicleActions(vehicles, container) {
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
      body: '<div class="summary-list">' + rows + '</div>' +
        '<div class="filter-title">Included features</div><ul class="chip-list">' + features + '</ul>',
      footer: '<button class="btn btn-ghost" type="button" data-close-modal>Close</button>' +
        '<button class="btn btn-primary" type="button" data-book-vehicle="' + vehicle.id + '">Book this vehicle</button>'
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
        return '<label class="checkbox-item"><input type="checkbox" value="' + e.id + '" data-extra /> ' +
          esc(e.label) + ' <span class="text-muted">(' + money(e.price_per_day) + '/day)</span></label>';
      }).join('');

      openModal({
        title: 'Book ' + vehicle.brand + ' ' + vehicle.model,
        size: 'lg',
        body:
          '<form id="bookingForm" class="form-row">' +
            '<div class="form-group"><label class="form-label" for="bookCustomer">Customer</label>' +
              '<select class="form-select" id="bookCustomer" required><option value="">Select a customer</option>' + options + '</select></div>' +
            '<div class="form-group"><label class="form-label" for="bookPickup">Pick-up date</label>' +
              '<input class="form-input" type="date" id="bookPickup" value="' + pickup + '" required /></div>' +
            '<div class="form-group"><label class="form-label" for="bookReturn">Return date</label>' +
              '<input class="form-input" type="date" id="bookReturn" value="' + back + '" required /></div>' +
            '<div class="form-group"><span class="form-label">Extras</span><div class="checkbox-group">' + extraFields + '</div></div>' +
            '<div class="card filter-card"><div class="filter-title">' + ICONS.calendar + ' Price breakdown</div>' +
              '<div class="summary-list" id="quoteSummary"><span class="body-sm text-muted">Choose your dates to see the live quote.</span></div></div>' +
          '</form>',
        footer: '<button class="btn btn-ghost" type="button" data-close-modal>Cancel</button>' +
          '<button class="btn btn-primary" type="submit" form="bookingForm">Confirm booking</button>'
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
          if (!host) return;
          if (!quote || quote.error) {
            host.innerHTML = '<span class="body-sm text-muted">' + esc((quote && quote.error) || 'Unable to calculate a quote.') + '</span>';
            return;
          }
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
