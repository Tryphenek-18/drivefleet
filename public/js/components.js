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
