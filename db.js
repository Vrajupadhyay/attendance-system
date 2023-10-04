// db.js

const mysql = require('mysql2');

// Database configuration
const db = mysql.createConnection({
  host: 'localhost',
  port: 3308, // If 3308 is the correct port    
  user: 'root',
  password: '',
  database: 'attendence_system',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

module.exports = db;
