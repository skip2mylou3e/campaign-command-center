process.env.NEXT_TELEMETRY_DISABLED = '1';

const next = require('next');
const http = require('http');

const app = next({ dev: true, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => {
    handle(req, res);
  }).listen(3000, () => {
    console.log('Ready on http://localhost:3000');
  });
}).catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
