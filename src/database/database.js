const mysql = require('mysql');

const JWT_SECRET = 'bilbil'; // Your secret key

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'proj_bil'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

module.exports = { db, JWT_SECRET };
