import { createApp } from './app.js';
import { resolveSecret } from './auth.js';
import { openDatabase } from './db.js';

const PORT = Number(process.env.PORT) || 8080;
const db = openDatabase();
const secret = resolveSecret();
if (!process.env.SESSION_SECRET) {
  console.log('SESSION_SECRET is not set: using a temporary secret, so sign-ins end when the server restarts.');
}

const server = createApp({ db, secret }).listen(PORT, () => {
  console.log(`TaskTrackr API listening on http://localhost:${PORT}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => {
      db.close();
      process.exit(0);
    });
  });
}
