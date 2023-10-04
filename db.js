// db.js

const mysql = require('mysql2');

// Database configuration
const db = mysql.createConnection({
  host: process.env.HOST,
  port: process.env.DB_PORT, // If 3308 is the correct port    
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
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
