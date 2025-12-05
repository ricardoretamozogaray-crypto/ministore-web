const initDb = require('../initDb');

console.log('Starting manual database initialization...');

initDb()
    .then(() => {
        console.log('Manual initialization completed successfully.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Manual initialization failed:', err);
        process.exit(1);
    });
