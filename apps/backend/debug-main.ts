process.on('uncaughtException', (err) => {
  console.error('CRITICAL UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, _promise) => {
  console.error('CRITICAL UNHANDLED REJECTION:', reason);
  process.exit(1);
});

console.log('--- STARTING NESTJS ---');

try {
  import('./src/main.ts')
    .then(() => {
      console.log('--- IMPORT SUCCESS ---');
    })
    .catch((err) => {
      console.error('--- IMPORT ERROR ---', err);
      process.exit(1);
    });
} catch (err) {
  console.error('--- SYNC ERROR ---', err);
  process.exit(1);
}
