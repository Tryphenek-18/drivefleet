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