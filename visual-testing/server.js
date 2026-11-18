// AITG Demo Shop v2 - fake data only. Run: node server.js  (http://127.0.0.1:8766)
const http = require('http');
const PORT = process.env.PORT || 8766;
const PRODUCTS = [
  { id: 1, name: 'Mechanical keyboard', price: 49 },
  { id: 2, name: 'USB-C hub', price: 29 },
  { id: 3, name: 'Webcam', price: 59 },
];
let state;
function reset() { state = { cart: [], orders: [], visual: 'a' }; }
reset();
const css = () => state.visual === 'b'
  ? 'body{font-family:Georgia,serif;margin:0;background:#fff7ed}nav{background:#9a3412;padding:18px}nav a{color:#fff;margin-right:24px}main{padding:32px;max-width:760px}button,.btn{background:#16a34a;color:#fff;border:0;padding:14px 22px;border-radius:999px;font-size:18px}li{margin:18px 0}'
  : 'body{font-family:Arial,sans-serif;margin:0;background:#fff}nav{background:#0f172a;padding:12px}nav a{color:#fff;margin-right:16px}main{padding:24px;max-width:720px}button,.btn{background:#2563eb;color:#fff;border:0;padding:10px 16px;border-radius:4px;font-size:16px}li{margin:10px 0}';
const page = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} - AITG Demo Shop</title><style>${css()}</style></head><body><nav aria-label="Main"><a href="/">Shop</a><a href="/cart">Cart (${state.cart.length})</a><a href="/orders">Orders</a></nav><main><h1>${title}</h1>${body}</main></body></html>`;
const find = id => PRODUCTS.find(p => p.id === Number(id));
const send = (res, code, type, body, extra = {}) => { res.writeHead(code, { 'content-type': type, ...extra }); res.end(body); };
const html = (res, t, b, code = 200) => send(res, code, 'text/html; charset=utf-8', page(t, b));
const json = (res, code, o) => send(res, code, 'application/json', JSON.stringify(o));
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x'); const u = url.pathname;
  let body = ''; req.on('data', c => body += c); req.on('end', () => {
    const form = new URLSearchParams(body);
    if (u === '/') return html(res, 'Shop', '<ul>' + PRODUCTS.map(p => `<li><a href="/product/${p.id}">${p.name}</a> - $${p.price}</li>`).join('') + '</ul>');
    let m;
    if ((m = u.match(/^\/product\/(\d+)$/))) { const p = find(m[1]); if (!p) return html(res, 'Not found', '<p>No such product.</p>', 404);
      return html(res, p.name, `<p data-testid="price">$${p.price}</p><form method="post" action="/cart/add"><input type="hidden" name="id" value="${p.id}"><button>Add to cart</button></form>`); }
    if (u === '/cart/add' && req.method === 'POST') { const p = find(form.get('id')); if (p) state.cart.push(p); return send(res, 303, 'text/plain', '', { location: '/cart' }); }
    if (u === '/cart') { const total = state.cart.reduce((s, p) => s + p.price, 0);
      return html(res, 'Cart', state.cart.length ? '<ul>' + state.cart.map(p => `<li>${p.name} - $${p.price}</li>`).join('') + `</ul><p data-testid="total">Total: $${total}</p><a class="btn" href="/checkout">Checkout</a>` : '<p>Your cart is empty.</p>'); }
    if (u === '/checkout' && req.method === 'GET') return html(res, 'Checkout', '<form method="post" action="/checkout"><label>Email <input name="email" type="email" required></label> <button>Place order</button></form>');
    if (u === '/checkout' && req.method === 'POST') { const email = form.get('email') || '';
      if (!/^\S+@\S+\.\S+$/.test(email) || !state.cart.length) return html(res, 'Checkout', '<p role="alert">Enter a valid email and add an item first.</p>', 400);
      const o = { id: state.orders.length + 1, email, items: state.cart.map(p => p.name), total: state.cart.reduce((s, p) => s + p.price, 0) }; state.orders.push(o); state.cart = [];
      return html(res, 'Order placed', `<p data-testid="confirmation">Thanks! Order #${o.id} confirmed.</p>`); }
    if (u === '/orders') return html(res, 'Orders', state.orders.length ? '<ul>' + state.orders.map(o => `<li>#${o.id} - ${o.items.join(', ')} - $${o.total}</li>`).join('') + '</ul>' : '<p>No orders yet.</p>');
    if (u === '/api/products') return json(res, 200, PRODUCTS);
    if (u === '/api/orders') return json(res, 200, state.orders);
    if (u === '/api/reset' && req.method === 'POST') { reset(); return json(res, 200, { ok: true }); }
    if (u === '/api/visual' && req.method === 'POST') { state.visual = url.searchParams.get('v') === 'b' ? 'b' : 'a'; return json(res, 200, { visual: state.visual }); }
    html(res, 'Not found', '<p>Page not found.</p>', 404);
  });
}).listen(PORT, '127.0.0.1', () => console.log('Demo Shop on ' + PORT));
