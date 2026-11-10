// Tiny local server: serves the demo shop and a /users JSON endpoint. Run: node server.js
const http = require('http'), fs = require('fs'), path = require('path');
const users = JSON.stringify(Array.from({length: 20}, (_, i) => ({ id: i + 1, name: 'user' + (i + 1) })));
http.createServer((req, res) => {
  if (req.url === '/users') { res.writeHead(200, {'Content-Type': 'application/json'}); return res.end(users); }
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(fs.readFileSync(path.join(__dirname, 'public', 'index.html')));
}).listen(3000, '127.0.0.1', () => console.log('Listening on http://127.0.0.1:3000'));
