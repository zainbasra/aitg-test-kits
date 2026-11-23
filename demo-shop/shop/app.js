/* AITG Demo Shop v3 - fake shop for practising test automation.
   Everything runs in the browser. No data is sent anywhere. */
(function () {
  'use strict';
  var VERSION = '3.0.0';
  var PRODUCTS = [
    { id: 1, name: 'Mechanical keyboard', cat: 'Keyboards', price: 49, stock: 12, icon: '⌨️', desc: 'Tactile switches, full size, USB-C.' },
    { id: 2, name: 'Compact keyboard', cat: 'Keyboards', price: 39, stock: 0, icon: '⌨️', desc: '75% layout. Out of stock on purpose.' },
    { id: 3, name: 'USB-C hub', cat: 'Accessories', price: 29, stock: 30, icon: '🔌', desc: '6 ports, 100 W pass-through.' },
    { id: 4, name: 'Webcam HD', cat: 'Video', price: 59, stock: 7, icon: '📷', desc: '1080p, privacy shutter.' },
    { id: 5, name: 'Webcam 4K', cat: 'Video', price: 129, stock: 3, icon: '📷', desc: '4K, auto focus.' },
    { id: 6, name: 'Wireless mouse', cat: 'Mice', price: 25, stock: 40, icon: '🖱️', desc: 'Silent clicks, 2.4 GHz.' },
    { id: 7, name: 'Gaming mouse', cat: 'Mice', price: 45, stock: 9, icon: '🖱️', desc: '7 buttons, RGB.' },
    { id: 8, name: 'Monitor stand', cat: 'Accessories', price: 35, stock: 15, icon: '🖥️', desc: 'Adjustable height.' },
    { id: 9, name: 'Headset', cat: 'Audio', price: 69, stock: 5, icon: '🎧', desc: 'Noise cancelling mic.' },
    { id: 10, name: 'Desk speakers', cat: 'Audio', price: 79, stock: 4, icon: '🔊', desc: '2 x 10 W.' },
    { id: 11, name: 'Laptop sleeve', cat: 'Accessories', price: 19, stock: 50, icon: '💼', desc: 'Fits 14 inch.' },
    { id: 12, name: 'Ring light', cat: 'Video', price: 33, stock: 8, icon: '💡', desc: '3 colour modes.' }
  ];
  var USERS = {
    'demo@aitg.test': { pass: 'Demo123!', name: 'Demo User' },
    'locked@aitg.test': { pass: 'Demo123!', name: 'Locked User', locked: true }
  };
  var COUPONS = { SAVE10: 0.10, HALF: 0.5 };

  // ---------- storage (safe) ----------
  function get(k, d) { try { var v = localStorage.getItem('aitg_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem('aitg_' + k, JSON.stringify(v)); } catch (e) {} }

  // ---------- test switches (URL wins, then saved) ----------
  var params = new URLSearchParams(location.search);
  var SW_KEYS = ['delay', 'look', 'rename', 'flaky', 'shift'];
  var sw = get('switches', {});
  SW_KEYS.forEach(function (k) { if (params.has(k)) sw[k] = params.get(k); });
  set('switches', sw);
  function on(k) { return sw[k] && sw[k] !== '0' && sw[k] !== 'off'; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function loadDelay() {
    var base = on('delay') ? 1500 : 300;
    if (on('flaky')) base = Math.floor(Math.random() * 3000);
    return wait(base);
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function money(n) { return '$' + n.toFixed(2); }
  function byId(id) { return PRODUCTS.filter(function (p) { return p.id === Number(id); })[0]; }
  function cart() { return get('cart', []); }
  function saveCart(c) { set('cart', c); renderBadge(); }
  function user() { return get('user', null); }
  function addLabel() { return on('rename') ? 'Add to basket' : 'Add to cart'; }
  function addAttrs(id) {
    // rename switch changes text AND id/test id, like a real refactor
    return on('rename')
      ? 'id="basket-add-' + id + '" data-testid="basket-add"'
      : 'id="add-to-cart-' + id + '" data-testid="add-to-cart"';
  }

  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.className = 'toast show';
    clearTimeout(t._h); t._h = setTimeout(function () { t.className = 'toast'; }, 2500);
  }

  function renderBadge() {
    var n = cart().reduce(function (a, i) { return a + i.qty; }, 0);
    var b = document.getElementById('cart-count'); if (b) b.textContent = n;
  }

  function shell(title) {
    if (on('look')) document.body.classList.add('v-b');
    var u = user();
    var active = SW_KEYS.filter(on);
    var top = document.getElementById('top');
    top.innerHTML =
      (active.length ? '<div class="banner" data-testid="switch-banner">Test switches on: ' + active.join(', ') + ' &middot; <a href="switches.html">change</a></div>' : '') +
      '<header class="top"><a class="logo" href="index.html">AITG Demo Shop<small>v' + VERSION + ' &middot; fake data</small></a>' +
      '<nav aria-label="Main"><a href="index.html">Products</a><a href="lab.html">Test lab</a><a href="orders.html">Orders</a>' +
      '<a href="cart.html" aria-label="Cart">Cart <span class="badge" id="cart-count" data-testid="cart-count">0</span></a>' +
      (u ? '<span class="muted" data-testid="user-name">' + esc(u.name) + '</span> <a href="#" id="logout">Log out</a>' : '<a href="login.html" id="login-link">Log in</a>') +
      '</nav></header>';
    document.getElementById('foot').innerHTML = 'AITG Demo Shop v' + VERSION + ' &middot; a practice site by <a href="https://aitestingguide.com/">AI Testing Guide</a> &middot; fake data, nothing is sold &middot; <a href="switches.html">Test switches</a> &middot; <a href="#" id="reset">Reset shop</a>';
    document.title = title + ' | AITG Demo Shop';
    var lo = document.getElementById('logout');
    if (lo) lo.onclick = function (e) { e.preventDefault(); set('user', null); location.href = 'index.html'; };
    document.getElementById('reset').onclick = function (e) {
      e.preventDefault(); ['cart', 'orders', 'user', 'switches'].forEach(function (k) { set(k, k === 'cart' || k === 'orders' ? [] : (k === 'switches' ? {} : null)); });
      location.href = 'index.html';
    };
    renderBadge();
  }

  function addToCart(id) {
    var p = byId(id); if (!p || p.stock === 0) return;
    var c = cart(); var line = c.filter(function (i) { return i.id === p.id; })[0];
    if (line) { if (line.qty >= p.stock) { toast('Only ' + p.stock + ' in stock'); return; } line.qty++; } else c.push({ id: p.id, qty: 1 });
    saveCart(c); toast(p.name + ' added');
  }

  // ---------- pages ----------
  var pages = {};

  pages.products = function () {
    shell('Products');
    var m = document.getElementById('main');
    if (on('shift')) m.insertAdjacentHTML('afterbegin', '<div class="shift-ad" id="promo" data-testid="promo"></div>');
    m.insertAdjacentHTML('beforeend',
      '<h1>Products</h1><div class="filters" role="search">' +
      '<label for="q" class="sr">Search</label><input id="q" data-testid="search" type="search" placeholder="Search products" value="' + esc(params.get('q') || '') + '">' +
      '<select id="cat" data-testid="category" aria-label="Category"><option value="">All categories</option></select>' +
      '<select id="sort" data-testid="sort" aria-label="Sort"><option value="name">Name A-Z</option><option value="price-asc">Price low-high</option><option value="price-desc">Price high-low</option></select>' +
      '<label class="muted" style="font-weight:400;margin:0"><input type="checkbox" id="instock" data-testid="in-stock"> In stock only</label></div>' +
      '<p id="count" class="muted" data-testid="result-count"></p><div id="list" class="grid" data-testid="product-list"><p class="spinner" id="loading">Loading products…</p></div>');
    var cats = PRODUCTS.map(function (p) { return p.cat; }).filter(function (c, i, a) { return a.indexOf(c) === i; });
    var sel = document.getElementById('cat');
    cats.forEach(function (c) { sel.insertAdjacentHTML('beforeend', '<option>' + c + '</option>'); });
    function draw() {
      var q = document.getElementById('q').value.trim().toLowerCase();
      var c = sel.value, s = document.getElementById('sort').value, st = document.getElementById('instock').checked;
      var list = PRODUCTS.filter(function (p) { return (!q || p.name.toLowerCase().indexOf(q) > -1) && (!c || p.cat === c) && (!st || p.stock > 0); });
      list.sort(function (a, b) { return s === 'price-asc' ? a.price - b.price : s === 'price-desc' ? b.price - a.price : a.name.localeCompare(b.name); });
      document.getElementById('count').textContent = list.length + ' product' + (list.length === 1 ? '' : 's');
      document.getElementById('list').innerHTML = list.length ? list.map(function (p) {
        return '<article class="card" data-testid="product-card" data-product-id="' + p.id + '"><div class="thumb" aria-hidden="true">' + p.icon + '</div>' +
          '<h2><a href="product.html?id=' + p.id + '" data-testid="product-link">' + esc(p.name) + '</a></h2><p class="muted">' + p.cat + '</p>' +
          '<p class="price" data-testid="price">' + money(p.price) + '</p>' +
          (p.stock ? '<button class="add" ' + addAttrs(p.id) + ' data-id="' + p.id + '">' + addLabel() + '</button>' : '<button disabled data-testid="sold-out">Sold out</button>') + '</article>';
      }).join('') : '<p data-testid="no-results">No products match your search.</p>';
    }
    loadDelay().then(function () {
      draw();
      if (on('shift')) setTimeout(function () { var pr = document.getElementById('promo'); pr.className = 'shift-ad on'; pr.textContent = 'Promo: free shipping this week (this banner appears late to shift the layout).'; }, 1200);
    });
    ['q', 'cat', 'sort', 'instock'].forEach(function (id) { document.getElementById(id).addEventListener('input', draw); document.getElementById(id).addEventListener('change', draw); });
    m.addEventListener('click', function (e) { var b = e.target.closest('button.add'); if (b) addToCart(b.getAttribute('data-id')); });
  };

  pages.product = function () {
    var p = byId(params.get('id'));
    shell(p ? p.name : 'Not found');
    var m = document.getElementById('main');
    if (!p) { m.innerHTML = '<h1>Product not found</h1><p><a href="index.html">Back to products</a></p>'; return; }
    m.innerHTML = '<p><a href="index.html">← All products</a></p><div class="card" data-testid="product-detail"><div class="thumb" aria-hidden="true">' + p.icon + '</div>' +
      '<h1 data-testid="product-name">' + esc(p.name) + '</h1><p>' + esc(p.desc) + '</p><p class="price" data-testid="price">' + money(p.price) + '</p>' +
      '<p class="muted" data-testid="stock">' + (p.stock ? p.stock + ' in stock' : 'Out of stock') + '</p>' +
      (p.stock ? '<button class="add" ' + addAttrs(p.id) + ' data-id="' + p.id + '">' + addLabel() + '</button>' : '<button disabled>Sold out</button>') + '</div>';
    m.querySelector('button.add') && m.querySelector('button.add').addEventListener('click', function () { addToCart(p.id); });
  };

  function totals(c, coupon) {
    var sub = c.reduce(function (a, i) { return a + byId(i.id).price * i.qty; }, 0);
    var disc = coupon && COUPONS[coupon] ? sub * COUPONS[coupon] : 0;
    var ship = sub - disc >= 100 || sub === 0 ? 0 : 7;
    return { sub: sub, disc: disc, ship: ship, total: sub - disc + ship };
  }

  pages.cart = function () {
    shell('Cart');
    var m = document.getElementById('main');
    function draw() {
      var c = cart(); var coupon = get('coupon', '');
      if (!c.length) { m.innerHTML = '<h1>Your cart</h1><p data-testid="empty-cart">Your cart is empty. <a href="index.html">Browse products</a></p>'; return; }
      var t = totals(c, coupon);
      m.innerHTML = '<h1>Your cart</h1><table data-testid="cart-table"><thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Line total</th><th></th></tr></thead><tbody>' +
        c.map(function (i) { var p = byId(i.id); return '<tr data-testid="cart-row" data-product-id="' + p.id + '"><td>' + esc(p.name) + '</td><td>' + money(p.price) + '</td>' +
          '<td><input type="number" min="1" max="' + p.stock + '" value="' + i.qty + '" aria-label="Quantity for ' + esc(p.name) + '" data-testid="qty" data-id="' + p.id + '" style="width:70px"></td>' +
          '<td data-testid="line-total">' + money(p.price * i.qty) + '</td><td><button class="secondary" data-remove="' + p.id + '" data-testid="remove">Remove</button></td></tr>'; }).join('') +
        '</tbody></table>' +
        '<div class="card" style="margin-top:16px;max-width:380px"><label for="coupon">Coupon code</label><input id="coupon" data-testid="coupon" value="' + esc(coupon) + '" placeholder="Try SAVE10"> <button class="secondary" id="apply" data-testid="apply-coupon">Apply</button><div class="err" id="coupon-msg" data-testid="coupon-msg"></div>' +
        '<p>Subtotal: <span data-testid="subtotal">' + money(t.sub) + '</span><br>Discount: <span data-testid="discount">-' + money(t.disc) + '</span><br>Shipping: <span data-testid="shipping">' + (t.ship ? money(t.ship) : 'Free') + '</span><br><strong>Total: <span data-testid="total">' + money(t.total) + '</span></strong></p>' +
        '<p class="muted">Free shipping from $100 after discount.</p>' +
        '<a class="btn" href="checkout.html" id="checkout" data-testid="checkout">Checkout</a> <button class="danger" id="clear" data-testid="clear-cart">Clear cart</button></div>';
    }
    draw();
    m.addEventListener('change', function (e) {
      if (e.target.matches('[data-testid=qty]')) {
        var c = cart(), id = Number(e.target.getAttribute('data-id')), p = byId(id), q = Math.max(1, Math.min(p.stock, parseInt(e.target.value, 10) || 1));
        c.forEach(function (i) { if (i.id === id) i.qty = q; }); saveCart(c); draw();
      }
    });
    m.addEventListener('click', function (e) {
      var r = e.target.getAttribute('data-remove');
      if (r) { saveCart(cart().filter(function (i) { return i.id !== Number(r); })); draw(); }
      if (e.target.id === 'apply') {
        var code = document.getElementById('coupon').value.trim().toUpperCase();
        if (COUPONS[code]) { set('coupon', code); draw(); document.getElementById('coupon-msg').innerHTML = '<span class="ok">Coupon applied</span>'; }
        else { set('coupon', ''); draw(); document.getElementById('coupon-msg').textContent = 'That coupon is not valid'; }
      }
      if (e.target.id === 'clear') openModal('Clear your cart?', 'This removes every item.', function () { saveCart([]); set('coupon', ''); draw(); });
    });
  };

  function openModal(title, text, onYes) {
    var back = document.getElementById('modal');
    back.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mtitle" data-testid="modal"><h2 id="mtitle">' + esc(title) + '</h2><p>' + esc(text) + '</p>' +
      '<button id="m-yes" data-testid="modal-confirm">Yes, continue</button> <button class="secondary" id="m-no" data-testid="modal-cancel">Cancel</button></div>';
    back.className = 'modal-back open';
    document.getElementById('m-yes').onclick = function () { back.className = 'modal-back'; onYes(); };
    document.getElementById('m-no').onclick = function () { back.className = 'modal-back'; };
    document.getElementById('m-yes').focus();
  }

  pages.login = function () {
    shell('Log in');
    var m = document.getElementById('main');
    m.innerHTML = '<h1>Log in</h1><form class="card" id="login-form" novalidate style="max-width:420px" data-testid="login-form">' +
      '<label for="email">Email</label><input id="email" name="email" type="email" autocomplete="off" data-testid="email" style="width:100%">' +
      '<label for="password">Password</label><input id="password" name="password" type="password" autocomplete="off" data-testid="password" style="width:100%">' +
      '<div class="err" id="login-error" role="alert" data-testid="login-error"></div><button type="submit" id="login-btn" data-testid="login-button">Log in</button>' +
      '<p class="muted">Practice accounts (fake): <code>demo@aitg.test</code> / <code>Demo123!</code>. Locked account: <code>locked@aitg.test</code>.</p></form>';
    document.getElementById('login-form').onsubmit = function (e) {
      e.preventDefault();
      var em = document.getElementById('email').value.trim().toLowerCase(), pw = document.getElementById('password').value, err = document.getElementById('login-error');
      if (!em || !pw) { err.textContent = 'Email and password are required'; return; }
      var u = USERS[em];
      if (!u || u.pass !== pw) { err.textContent = 'Email or password is wrong'; return; }
      if (u.locked) { err.textContent = 'This account is locked'; return; }
      var btn = document.getElementById('login-btn'); btn.disabled = true; btn.textContent = 'Logging in…';
      loadDelay().then(function () { set('user', { email: em, name: u.name }); location.href = params.get('next') || 'index.html'; });
    };
  };

  pages.checkout = function () {
    shell('Checkout');
    var m = document.getElementById('main'), c = cart();
    if (!user()) { m.innerHTML = '<h1>Checkout</h1><p data-testid="login-required">Please <a href="login.html?next=checkout.html">log in</a> to check out.</p>'; return; }
    if (!c.length) { m.innerHTML = '<h1>Checkout</h1><p>Your cart is empty. <a href="index.html">Browse products</a></p>'; return; }
    var t = totals(c, get('coupon', ''));
    m.innerHTML = '<h1>Checkout</h1><form class="card" id="co" novalidate style="max-width:520px" data-testid="checkout-form">' +
      f('name', 'Full name', 'text') + f('email', 'Email', 'email') + f('phone', 'Phone (digits only)', 'tel') + f('address', 'Address', 'text') + f('zip', 'Postcode (5 digits)', 'text') +
      '<label for="country">Country</label><select id="country" data-testid="country"><option value="">Choose…</option><option>Pakistan</option><option>United States</option><option>United Kingdom</option><option>Germany</option></select><div class="err" id="country-err" data-testid="country-error"></div>' +
      '<label style="font-weight:400"><input type="checkbox" id="terms" data-testid="terms"> I accept the <a href="#" id="terms-link">practice terms</a></label><div class="err" id="terms-err" data-testid="terms-error"></div>' +
      '<p><strong>Total: <span data-testid="total">' + money(t.total) + '</span></strong></p><p class="muted">Fake payment. Nothing is charged and nothing leaves your browser.</p>' +
      '<button type="submit" id="place-order" data-testid="place-order">Place order</button></form>';
    function f(id, lab, type) { return '<label for="' + id + '">' + lab + '</label><input id="' + id + '" type="' + type + '" data-testid="' + id + '" style="width:100%"><div class="err" id="' + id + '-err" data-testid="' + id + '-error"></div>'; }
    document.getElementById('terms-link').onclick = function (e) { e.preventDefault(); openModal('Practice terms', 'This is a fake shop for testing. No goods, no payments, no personal data stored outside your browser.', function () {}); };
    document.getElementById('co').onsubmit = function (e) {
      e.preventDefault();
      var v = function (id) { return document.getElementById(id).value.trim(); }, ok = true;
      function chk(id, test, msg) { var el = document.getElementById(id + '-err'); if (!test) { el.textContent = msg; ok = false; } else el.textContent = ''; }
      chk('name', v('name').length >= 2, 'Enter your full name');
      chk('email', /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v('email')), 'Enter a valid email');
      chk('phone', /^\d{7,15}$/.test(v('phone')), 'Phone must be 7 to 15 digits');
      chk('address', v('address').length >= 5, 'Enter your address');
      chk('zip', /^\d{5}$/.test(v('zip')), 'Postcode must be 5 digits');
      chk('country', v('country') !== '', 'Choose a country');
      chk('terms', document.getElementById('terms').checked, 'Accept the terms to continue');
      if (!ok) return;
      var btn = document.getElementById('place-order'); btn.disabled = true; btn.textContent = 'Placing order…';
      loadDelay().then(function () {
        var orders = get('orders', []), id = 'AITG-' + (1000 + orders.length + 1);
        orders.push({ id: id, date: new Date().toISOString().slice(0, 10), items: c, total: t.total });
        set('orders', orders); saveCart([]); set('coupon', '');
        location.href = 'confirmation.html?order=' + id;
      });
    };
  };

  pages.confirmation = function () {
    shell('Order placed');
    document.getElementById('main').innerHTML = '<h1 data-testid="confirmation-title">Thank you, your order is placed</h1><p>Order number: <strong data-testid="order-id">' + esc(params.get('order') || '') + '</strong></p><p class="muted">Fake order. Nothing will be shipped.</p><p><a href="orders.html">See your orders</a></p>';
  };

  pages.orders = function () {
    shell('Orders');
    var o = get('orders', []), m = document.getElementById('main');
    m.innerHTML = '<h1>Your orders</h1>' + (o.length ? '<table data-testid="orders-table"><thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th></tr></thead><tbody>' +
      o.map(function (x) { return '<tr data-testid="order-row"><td>' + x.id + '</td><td>' + x.date + '</td><td>' + x.items.reduce(function (a, i) { return a + i.qty; }, 0) + '</td><td>' + money(x.total) + '</td></tr>'; }).join('') + '</tbody></table>'
      : '<p data-testid="no-orders">No orders yet.</p>');
  };

  pages.switches = function () {
    shell('Test switches');
    var desc = {
      delay: 'Slow loading: products and buttons appear after 1.5 s instead of 0.3 s.',
      look: 'Visual change: price turns near-white, cards lose rounded corners, Add to cart turns green.',
      rename: 'Refactor: "Add to cart" becomes "Add to basket", and its id and data-testid change.',
      flaky: 'Flaky: random load time from 0 to 3 s on every page.',
      shift: 'Layout shift: a promo banner appears late and pushes the products down.'
    };
    var m = document.getElementById('main');
    m.innerHTML = '<h1>Test switches</h1><p>Turn on changes to see whether your tests (or a tool’s self-healing) cope. They are saved in this browser. You can also set them in the address, for example <code>index.html?rename=1&amp;delay=1</code>.</p><form class="card switches" id="sw" data-testid="switches">' +
      SW_KEYS.map(function (k) { return '<label><input type="checkbox" name="' + k + '" data-testid="switch-' + k + '"' + (on(k) ? ' checked' : '') + '> <strong>' + k + '</strong> &ndash; ' + desc[k] + '</label>'; }).join('') +
      '<p><button type="submit" data-testid="save-switches">Save</button> <a href="index.html">Back to products</a></p></form>';
    document.getElementById('sw').onsubmit = function (e) {
      e.preventDefault(); var n = {}; SW_KEYS.forEach(function (k) { n[k] = document.querySelector('[name=' + k + ']').checked ? '1' : '0'; }); set('switches', n); location.href = 'index.html';
    };
  };

  pages.lab = function () {
    shell('Test lab');
    var m = document.getElementById('main');
    m.innerHTML = '<h1>Test lab</h1><p>Small, isolated cases that often break automated tests.</p>' +
      '<section class="card lab-box" data-testid="lab-delayed"><h2>1. Element that appears late</h2><button id="start-load" data-testid="start-load">Load message</button> <span id="late" data-testid="late-message"></span></section>' +
      '<section class="card lab-box" data-testid="lab-modal"><h2>2. Confirm dialog (not a browser alert)</h2><button id="open-modal" data-testid="open-modal">Delete item</button> <span id="modal-result" data-testid="modal-result"></span></section>' +
      '<section class="card lab-box" data-testid="lab-iframe"><h2>3. Content inside an iframe</h2><iframe title="Newsletter form" src="frame.html" style="width:100%;height:140px;border:1px solid #dfe3ef;border-radius:8px" data-testid="frame"></iframe></section>' +
      '<section class="card lab-box" data-testid="lab-shadow"><h2>4. Button inside shadow DOM</h2><aitg-rating></aitg-rating></section>' +
      '<section class="card lab-box" data-testid="lab-newtab"><h2>5. Link that opens a new tab</h2><a href="help.html" target="_blank" rel="noopener" data-testid="help-link">Open help (new tab)</a></section>' +
      '<section class="card lab-box" data-testid="lab-dynamic-id"><h2>6. Changing ids</h2><p class="muted">This button gets a new random id on every load, so id-based locators break.</p><button id="btn-' + Math.random().toString(36).slice(2, 8) + '" data-testid="dynamic-button" class="dyn">Save settings</button> <span id="dyn-result" data-testid="dynamic-result"></span></section>' +
      '<section class="card lab-box" data-testid="lab-table"><h2>7. Sortable table</h2><table id="people" data-testid="sort-table"><thead><tr><th><button class="secondary" data-sort="name">Name</button></th><th><button class="secondary" data-sort="score">Score</button></th></tr></thead><tbody></tbody></table></section>' +
      '<section class="card lab-box" data-testid="lab-upload"><h2>8. File picker (stays in your browser)</h2><input type="file" id="file" data-testid="file-input"> <span id="file-name" data-testid="file-name"></span></section>';
    document.getElementById('start-load').onclick = function () { var s = document.getElementById('late'); s.textContent = 'Loading…'; wait(on('flaky') ? Math.random() * 4000 : 2500).then(function () { s.textContent = 'Hello from the server!'; }); };
    document.getElementById('open-modal').onclick = function () { openModal('Delete this item?', 'This cannot be undone (it is a fake item).', function () { document.getElementById('modal-result').textContent = 'Item deleted'; }); };
    document.querySelector('.dyn').onclick = function () { document.getElementById('dyn-result').textContent = 'Settings saved'; };
    var people = [['Asha', 72], ['Bilal', 95], ['Chen', 64], ['Dana', 88]];
    function drawT(k) { if (k) people.sort(function (a, b) { return k === 'name' ? a[0].localeCompare(b[0]) : b[1] - a[1]; }); document.querySelector('#people tbody').innerHTML = people.map(function (p) { return '<tr data-testid="person-row"><td>' + p[0] + '</td><td>' + p[1] + '</td></tr>'; }).join(''); }
    drawT(); document.getElementById('people').onclick = function (e) { var k = e.target.getAttribute('data-sort'); if (k) drawT(k); };
    document.getElementById('file').onchange = function (e) { var f = e.target.files[0]; document.getElementById('file-name').textContent = f ? 'Selected: ' + f.name : ''; };
  };

  // shadow DOM widget for the lab
  if (window.customElements && !customElements.get('aitg-rating')) {
    customElements.define('aitg-rating', class extends HTMLElement {
      connectedCallback() {
        var r = this.attachShadow({ mode: 'open' }); var score = 0;
        r.innerHTML = '<style>button{font:inherit;padding:6px 12px;border-radius:6px;border:1px solid #3b5bdb;background:#fff;color:#3b5bdb;cursor:pointer}</style>' +
          '<span part="label">Rate this shop: </span><button data-testid="rate-up">👍 Like</button> <span data-testid="rating">0 likes</span>';
        r.querySelector('button').onclick = function () { score++; r.querySelector('[data-testid=rating]').textContent = score + (score === 1 ? ' like' : ' likes'); };
      }
    });
  }

  window.AITG = { start: function (name) { document.addEventListener('DOMContentLoaded', function () { pages[name](); }); }, version: VERSION };
})();
