import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initializeSocketServer } from './server/socket-server.ts';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Tüm network interface'lerini dinle
const port = parseInt(process.env.PORT || '3000', 10); // Railway dinamik port kullanır

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io
  initializeSocketServer(httpServer);

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://localhost:${port}`);
      console.log(`> Environment: ${dev ? 'development' : 'production'}`);
      if (process.env.RAILWAY_STATIC_URL) {
        console.log(`> Railway URL: https://${process.env.RAILWAY_STATIC_URL}`);
      }
    });
});
