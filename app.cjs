// Production entry point for Passenger (Hostinger), which loads a CommonJS startup file.
// It hands off to the ES-module Express server.
import('./server/index.js').catch((err) => {
  console.error('[startup] Failed to load server/index.js:', err);
  process.exit(1);
});
