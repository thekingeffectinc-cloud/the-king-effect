/* The King Effect — site script: nav, cart, shop, checkout, contact. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  var C = window.KE_CATALOG;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (cents) { return '$' + (cents / 100).toFixed(2).replace(/\.00$/, ''); };
  var fmt2 = function (cents) { return '$' + (cents / 100).toFixed(2); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };
  var byId = function (id) { return C.products.filter(function (p) { return p.id === id; })[0]; };
  var isFile = location.protocol === 'file:';
  var isStatic = /\.github\.io$/.test(location.hostname); // GitHub Pages: no checkout server

  /* ---------- Garment SVGs ---------- */
  var CROWN = '<path d="M-14 6 L-16 -8 L-8 -1 L0 -12 L8 -1 L16 -8 L14 6 Z" fill="{a}"/><rect x="-14" y="8" width="28" height="3" fill="{a}"/>';
  var SHAPES = {
    tee: '<path d="M62 22 L86 12 Q100 30 114 12 L138 22 L182 52 L162 86 L146 76 L146 204 L54 204 L54 76 L38 86 L18 52 Z" fill="{b}" stroke="rgba(0,0,0,.25)"/><path d="M86 12 Q100 30 114 12" fill="none" stroke="{a}" stroke-width="2.5"/><g transform="translate(100 74)">' + CROWN + '</g>',
    longsleeve: '<path d="M62 22 L86 12 Q100 30 114 12 L138 22 L170 60 L192 176 L170 182 L146 96 L146 204 L54 204 L54 96 L30 182 L8 176 L30 60 Z" fill="{b}" stroke="rgba(0,0,0,.25)"/><path d="M86 12 Q100 30 114 12" fill="none" stroke="{a}" stroke-width="2.5"/><path d="M172 170 L192 174 M28 170 L8 174" stroke="{a}" stroke-width="3"/><g transform="translate(100 74)">' + CROWN + '</g>',
    hoodie: '<path d="M58 46 L142 46 L172 70 L194 184 L170 190 L148 104 L148 206 L52 206 L52 104 L30 190 L6 184 L28 70 Z" fill="{b}" stroke="rgba(0,0,0,.25)"/><path d="M68 50 Q66 8 100 8 Q134 8 132 50 Q100 72 68 50 Z" fill="{b}" stroke="rgba(0,0,0,.35)"/><path d="M80 48 Q100 62 120 48 Q118 22 100 22 Q82 22 80 48Z" fill="rgba(0,0,0,.35)"/><path d="M92 60 L90 92 M108 60 L110 92" stroke="{a}" stroke-width="2.5"/><path d="M70 150 L130 150 L138 186 L62 186 Z" fill="rgba(0,0,0,.18)"/><g transform="translate(100 118)">' + CROWN + '</g>',
    joggers: '<path d="M58 14 L142 14 L154 204 L112 206 L100 78 L88 206 L46 204 Z" fill="{b}" stroke="rgba(0,0,0,.25)"/><rect x="58" y="14" width="84" height="14" fill="rgba(0,0,0,.25)"/><path d="M96 28 L92 52 M104 28 L108 52" stroke="{a}" stroke-width="2.5"/><path d="M46 192 L88 194 M112 194 L154 192" stroke="rgba(0,0,0,.3)" stroke-width="10"/><g transform="translate(70 70) scale(.6)">' + CROWN + '</g>',
    cap: '<path d="M38 132 Q38 52 100 52 Q162 52 162 132 Z" fill="{b}" stroke="rgba(0,0,0,.3)"/><path d="M100 52 L100 132" stroke="rgba(0,0,0,.25)"/><path d="M30 132 Q100 112 190 140 Q170 162 100 152 Q50 148 30 132 Z" fill="{b}" stroke="rgba(0,0,0,.35)"/><circle cx="100" cy="54" r="5" fill="{a}"/><g transform="translate(100 100) scale(1.3)">' + CROWN + '</g>'
  };
  function garment(p) {
    return '<svg class="garment" viewBox="0 0 200 220" aria-hidden="true">' + SHAPES[p.shape].replace(/\{b\}/g, p.body).replace(/\{a\}/g, p.accent) + '</svg>';
  }

  /* ---------- Cart (localStorage) ---------- */
  var KEY = 'ke_cart_v1';
  var Cart = {
    read: function () {
      try { var c = JSON.parse(localStorage.getItem(KEY)) || []; return c.filter(function (l) { return byId(l.id); }); }
      catch (e) { return []; }
    },
    write: function (c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} Cart.sync(); },
    add: function (id, size, qty) {
      var c = Cart.read(); qty = qty || 1;
      var line = c.filter(function (l) { return l.id === id && l.size === size; })[0];
      if (line) line.qty = Math.min(10, line.qty + qty); else c.push({ id: id, size: size, qty: qty });
      Cart.write(c);
    },
    setQty: function (id, size, qty) {
      var c = Cart.read().map(function (l) { if (l.id === id && l.size === size) l.qty = Math.max(1, Math.min(10, qty)); return l; });
      Cart.write(c);
    },
    remove: function (id, size) { Cart.write(Cart.read().filter(function (l) { return !(l.id === id && l.size === size); })); },
    clear: function () { Cart.write([]); },
    count: function () { return Cart.read().reduce(function (n, l) { return n + l.qty; }, 0); },
    subtotal: function () { return Cart.read().reduce(function (s, l) { return s + byId(l.id).price * l.qty; }, 0); },
    sync: function () {
      var n = Cart.count();
      $$('.cart-count').forEach(function (el) { el.textContent = n; el.style.display = n ? 'grid' : 'none'; });
      document.dispatchEvent(new CustomEvent('cart:change'));
    }
  };
  window.addEventListener('storage', function (e) { if (e.key === KEY) Cart.sync(); });

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(html) {
    var t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.innerHTML = html; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ---------- Nav ---------- */
  var toggle = $('.menu-toggle');
  if (toggle) toggle.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open);
  });
  $$('.nav-links a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('nav-open'); }); });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Reveal ---------- */
  function observeReveal() {
    if (!('IntersectionObserver' in window)) { $$('.reveal').forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12 });
    $$('.reveal:not(.in)').forEach(function (el) { io.observe(el); });
  }

  /* ---------- Product cards ---------- */
  function card(p) {
    var sizes = p.sizes.length > 1
      ? '<select class="size-select" aria-label="Size for ' + esc(p.name) + '">' + p.sizes.map(function (s) { return '<option' + (s === 'M' ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>'
      : '<span class="one-size">One Size</span>';
    return '<article class="card reveal" data-id="' + p.id + '" data-category="' + p.category + '">' +
      '<div class="card-media bg-' + p.bg + '">' + garment(p) +
      (p.badge ? '<span class="badge' + (p.badge === 'Sale' || p.badge === 'Limited' ? ' alt' : '') + '">' + p.badge + '</span>' : '') + '</div>' +
      '<div class="card-body"><span class="card-cat">' + p.category + '</span><h3 class="card-name">' + esc(p.name) + '</h3>' +
      '<p class="card-desc">' + esc(p.description) + '</p>' +
      '<div class="card-row"><span class="price">' + fmt(p.price) + (p.compareAt ? '<s>' + fmt(p.compareAt) + '</s>' : '') + '</span>' +
      '<span class="swatches">' + p.swatches.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span></div>' +
      '<div class="card-buy">' + sizes + '<button class="btn btn-gold add-btn" type="button">Add to Bag</button></div></div></article>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.add-btn'); if (!b) return;
    var cardEl = b.closest('.card'); var p = byId(cardEl.dataset.id);
    var sel = $('.size-select', cardEl); var size = sel ? sel.value : p.sizes[0];
    Cart.add(p.id, size, 1);
    b.textContent = 'Added ✓'; b.disabled = true;
    setTimeout(function () { b.textContent = 'Add to Bag'; b.disabled = false; }, 1200);
    toast('♛ <span><b>' + esc(p.name) + '</b> (' + size + ') added — <a href="cart.html" style="text-decoration:underline">View bag</a></span>');
  });

  // Featured (home)
  var featured = $('#featured-grid');
  if (featured) { featured.innerHTML = C.products.filter(function (p) { return p.badge; }).slice(0, 4).map(card).join(''); }

  // Shop
  var shopGrid = $('#shop-grid');
  if (shopGrid) {
    var state = { cat: 'all', sort: 'featured' };
    var render = function () {
      var list = C.products.filter(function (p) { return state.cat === 'all' || p.category === state.cat; });
      if (state.sort === 'low') list.sort(function (a, b) { return a.price - b.price; });
      if (state.sort === 'high') list.sort(function (a, b) { return b.price - a.price; });
      if (state.sort === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name); });
      shopGrid.innerHTML = list.map(card).join('');
      $('#result-count').textContent = list.length + (list.length === 1 ? ' piece' : ' pieces');
      observeReveal();
    };
    $$('.chip').forEach(function (ch) {
      ch.addEventListener('click', function () {
        $$('.chip').forEach(function (c) { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
        ch.classList.add('active'); ch.setAttribute('aria-pressed', 'true'); state.cat = ch.dataset.filter; render();
      });
    });
    $('#sort').addEventListener('change', function (e) { state.sort = e.target.value; render(); });
    render();
  }

  /* ---------- Shipping math (mirrors server) ---------- */
  function shippingCost(method, subtotal) {
    if (method === 'express') return C.shipping.express.amount;
    return subtotal >= C.shipping.freeThreshold ? 0 : C.shipping.standard.amount;
  }
  function summaryHTML(method) {
    var sub = Cart.subtotal(); var ship = shippingCost(method || 'standard', sub);
    var lines = Cart.read().map(function (l) {
      var p = byId(l.id);
      return '<li><div class="mini-thumb bg-' + p.bg + '">' + garment(p) + '<em>' + l.qty + '</em></div><div><strong>' + esc(p.name) + '</strong><span>Size ' + esc(l.size) + '</span></div><b>' + fmt2(p.price * l.qty) + '</b></li>';
    }).join('');
    var toFree = C.shipping.freeThreshold - sub;
    return '<ul class="summary-lines">' + lines + '</ul>' +
      '<dl class="totals"><div><dt>Subtotal</dt><dd>' + fmt2(sub) + '</dd></div>' +
      '<div><dt>Shipping</dt><dd>' + (ship ? fmt2(ship) : 'Free') + '</dd></div>' +
      '<div><dt>Tax</dt><dd>Calculated at payment</dd></div>' +
      '<div class="grand"><dt>Total</dt><dd>' + fmt2(sub + ship) + '</dd></div></dl>' +
      (method !== 'express' && toFree > 0 ? '<p class="free-note">Add ' + fmt2(toFree) + ' more for free standard shipping.</p>' : '');
  }

  /* ---------- Cart page ---------- */
  var cartRoot = $('#cart-root');
  if (cartRoot) {
    if (/canceled=1/.test(location.search)) toast('Checkout canceled — your bag is saved.');
    var renderCart = function () {
      var c = Cart.read();
      if (!c.length) {
        cartRoot.innerHTML = '<div class="empty-state"><div class="seal">♛</div><h2>Your bag is empty</h2><p>Every reign begins with a single piece.</p><a class="btn btn-gold" href="shop.html">Shop the Collection</a></div>';
        return;
      }
      var rows = c.map(function (l) {
        var p = byId(l.id);
        return '<li class="cart-line" data-id="' + p.id + '" data-size="' + esc(l.size) + '">' +
          '<div class="line-thumb bg-' + p.bg + '">' + garment(p) + '</div>' +
          '<div class="line-info"><span class="card-cat">' + p.category + '</span><h3>' + esc(p.name) + '</h3><span class="muted">Size: ' + esc(l.size) + ' · ' + fmt2(p.price) + ' each</span>' +
          '<button class="link-btn remove" type="button">Remove</button></div>' +
          '<div class="qty" role="group" aria-label="Quantity for ' + esc(p.name) + '"><button type="button" class="dec" aria-label="Decrease">−</button><input type="number" min="1" max="10" value="' + l.qty + '" aria-label="Quantity"><button type="button" class="inc" aria-label="Increase">+</button></div>' +
          '<div class="line-total">' + fmt2(p.price * l.qty) + '</div></li>';
      }).join('');
      cartRoot.innerHTML = '<div class="cart-layout"><div><ul class="cart-lines">' + rows + '</ul>' +
        '<div class="cart-actions"><a class="btn btn-ghost" href="shop.html">← Continue Shopping</a><button class="link-btn" id="clear-cart" type="button">Clear bag</button></div></div>' +
        '<aside class="summary"><h2>Order Summary</h2>' + summaryHTML('standard') +
        '<a class="btn btn-gold block" href="checkout.html">Proceed to Checkout</a>' +
        '<p class="secure">🔒 Payments processed securely by Stripe</p></aside></div>';
    };
    cartRoot.addEventListener('click', function (e) {
      var line = e.target.closest('.cart-line');
      if (e.target.id === 'clear-cart') { Cart.clear(); return; }
      if (!line) return;
      var id = line.dataset.id, size = line.dataset.size, q = +$('input', line).value;
      if (e.target.classList.contains('remove')) Cart.remove(id, size);
      if (e.target.classList.contains('inc')) Cart.setQty(id, size, q + 1);
      if (e.target.classList.contains('dec')) { if (q <= 1) Cart.remove(id, size); else Cart.setQty(id, size, q - 1); }
    });
    cartRoot.addEventListener('change', function (e) {
      var line = e.target.closest('.cart-line'); if (!line || e.target.tagName !== 'INPUT') return;
      var v = parseInt(e.target.value, 10); Cart.setQty(line.dataset.id, line.dataset.size, isNaN(v) ? 1 : v);
    });
    document.addEventListener('cart:change', renderCart);
    renderCart();
  }

  /* ---------- Form validation helpers ---------- */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function validateField(input) {
    var field = input.closest('.field'); var err = $('.error', field); var v = input.value.trim(); var msg = '';
    if (input.required && !v) msg = (input.dataset.label || 'This field') + ' is required.';
    else if (v && input.type === 'email' && !EMAIL.test(v)) msg = 'Please enter a valid email address.';
    else if (v && input.minLength > 0 && v.length < input.minLength) msg = (input.dataset.label || 'This field') + ' must be at least ' + input.minLength + ' characters.';
    else if (v && input.dataset.pattern && !new RegExp(input.dataset.pattern).test(v)) msg = input.dataset.patternMsg || 'Invalid format.';
    field.classList.toggle('invalid', !!msg); field.classList.toggle('valid', !msg && !!v);
    if (err) err.textContent = msg;
    input.setAttribute('aria-invalid', !!msg);
    return !msg;
  }
  function wireValidation(form) {
    $$('input,textarea,select', form).forEach(function (i) {
      i.addEventListener('blur', function () { validateField(i); });
      i.addEventListener('input', function () { if (i.closest('.field').classList.contains('invalid')) validateField(i); });
    });
  }
  function validateForm(form) {
    var ok = true, first;
    $$('.field input,.field textarea,.field select', form).forEach(function (i) { if (!validateField(i)) { ok = false; first = first || i; } });
    if (first) first.focus();
    return ok;
  }

  /* ---------- Checkout page ---------- */
  var co = $('#checkout-form');
  if (co) {
    var sumBox = $('#checkout-summary');
    var method = function () { return ($('input[name="shippingMethod"]:checked', co) || {}).value || 'standard'; };
    var paint = function () {
      if (!Cart.count()) { location.href = 'cart.html'; return; }
      sumBox.innerHTML = summaryHTML(method());
      var sub = Cart.subtotal();
      $('#std-price').textContent = sub >= C.shipping.freeThreshold ? 'Free' : fmt2(C.shipping.standard.amount);
      $('#exp-price').textContent = fmt2(C.shipping.express.amount);
    };
    $$('input[name="shippingMethod"]', co).forEach(function (r) { r.addEventListener('change', paint); });
    document.addEventListener('cart:change', paint);
    // Restore saved contact details (never payment details)
    try { var saved = JSON.parse(localStorage.getItem('ke_checkout_v1')) || {}; Object.keys(saved).forEach(function (k) { var el = co.elements[k]; if (el && el.type !== 'radio') el.value = saved[k]; }); } catch (e) {}
    wireValidation(co);
    paint();
    if (isFile) $('#server-note').hidden = false;

    co.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = $('#checkout-status'); status.textContent = ''; status.className = 'form-status';
      if (!validateForm(co)) { status.textContent = 'Please fix the highlighted fields.'; status.classList.add('err'); return; }
      var f = co.elements;
      var payload = {
        items: Cart.read(),
        shippingMethod: method(),
        customer: { name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim() },
        shipping: { line1: f.line1.value.trim(), line2: f.line2.value.trim(), city: f.city.value.trim(), state: f.state.value.trim(), postal_code: f.postal_code.value.trim(), country: f.country.value }
      };
      try { var keep = {}; ['name','email','phone','line1','line2','city','state','postal_code','country'].forEach(function (k) { keep[k] = f[k].value; }); localStorage.setItem('ke_checkout_v1', JSON.stringify(keep)); } catch (e2) {}
      if (isStatic) { status.classList.add('err'); status.textContent = 'Online checkout is not live yet on this preview site; secure Stripe payments need the store\'s hosted checkout server. Your bag is saved.'; return; }
      var btn = $('button[type="submit"]', co); btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Connecting to Stripe…';
      fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Checkout failed.'); return j; }); })
        .then(function (j) { location.href = j.url; })
        .catch(function (err) {
          btn.disabled = false; btn.innerHTML = 'Continue to Secure Payment →';
          status.classList.add('err');
          status.textContent = isFile || /Failed to fetch|NetworkError|Load failed/i.test(err.message)
            ? 'Could not reach the checkout server. Start it with "npm start" and open http://localhost:4242.'
            : err.message;
        });
    });
  }

  /* ---------- Success page ---------- */
  var ok = $('#success-root');
  if (ok) {
    var sid = new URLSearchParams(location.search).get('session_id');
    var show = function (html) { ok.innerHTML = html; };
    if (!sid) show('<div class="seal">♛</div><h1>No order found</h1><p class="lead">We couldn\'t find a checkout session.</p><a class="btn btn-gold" href="shop.html">Back to Shop</a>');
    else fetch('/api/session/' + encodeURIComponent(sid)).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error); return j; }); })
      .then(function (s) {
        if (s.payment_status === 'paid' || s.payment_status === 'no_payment_required') {
          Cart.clear();
          var items = (s.line_items || []).map(function (li) { return '<li><span>' + li.quantity + ' × ' + esc(li.description) + '</span><b>' + fmt2(li.amount_total) + '</b></li>'; }).join('');
          show('<div class="seal">✓</div><span class="eyebrow">Order Confirmed</span><h1>Long live the <span class="gold-text">King</span>.</h1>' +
            '<p class="lead">Thank you' + (s.customer_name ? ', ' + esc(s.customer_name.split(' ')[0]) : '') + '. A receipt is on its way to <b>' + esc(s.customer_email || 'your inbox') + '</b>.</p>' +
            '<div class="receipt"><ul>' + items + '</ul><dl class="totals">' +
            (s.shipping_cost != null ? '<div><dt>Shipping</dt><dd>' + (s.shipping_cost ? fmt2(s.shipping_cost) : 'Free') + '</dd></div>' : '') +
            (s.tax ? '<div><dt>Tax</dt><dd>' + fmt2(s.tax) + '</dd></div>' : '') +
            '<div class="grand"><dt>Total paid</dt><dd>' + fmt2(s.amount_total) + '</dd></div></dl>' +
            '<p class="muted small">Order ref: ' + esc(s.id.slice(-12).toUpperCase()) + (s.livemode ? '' : ' · <span class="test-pill">Stripe test mode</span>') + '</p></div>' +
            '<a class="btn btn-gold" href="shop.html">Continue Shopping</a>');
        } else {
          show('<div class="seal">…</div><h1>Payment pending</h1><p class="lead">Your payment hasn\'t completed yet (status: ' + esc(s.payment_status) + '). Your bag is still saved.</p><a class="btn btn-gold" href="cart.html">Return to Bag</a>');
        }
      })
      .catch(function (err) { show('<div class="seal">!</div><h1>We couldn\'t verify your order</h1><p class="lead">' + esc(err.message || 'Please make sure the server is running.') + '</p><a class="btn btn-ghost" href="cart.html">Return to Bag</a>'); });
  }

  /* ---------- Contact form ---------- */
  var contact = $('#contact-form');
  if (contact) {
    wireValidation(contact);
    var msg = contact.elements.message, counter = $('#char-count');
    msg.addEventListener('input', function () { counter.textContent = msg.value.length + ' / 1000'; });
    contact.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(contact)) return;
      var name = contact.elements.name.value.trim().split(' ')[0];
      contact.hidden = true;
      var s = $('#form-success'); $('#success-name').textContent = name; s.classList.add('show'); s.focus();
    });
    $('#send-another').addEventListener('click', function () { contact.reset(); $$('.field', contact).forEach(function (f) { f.classList.remove('valid', 'invalid'); }); counter.textContent = '0 / 1000'; contact.hidden = false; $('#form-success').classList.remove('show'); });
  }

  /* ---------- Newsletter ---------- */
  $$('.newsletter').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var i = $('input', f);
      if (!EMAIL.test(i.value.trim())) { toast('Please enter a valid email.'); i.focus(); return; }
      i.value = ''; toast('♛ <span>Welcome to the <b>Court</b>. Watch your inbox.</span>');
    });
  });

  Cart.sync();
  observeReveal();
})();
