const fs = require('fs');
const sql = fs.readFileSync('insert-trail-routes-data.sql', 'utf8');
console.log('SQL file contains', sql.split('INSERT INTO').length - 1, 'INSERT statements');
console.log('First 500 characters:', sql.substring(0, 500));
