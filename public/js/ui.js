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
