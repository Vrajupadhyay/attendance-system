// // db.js

// const mysql = require('mysql2');

// // Database configuration
// const db = mysql.createConnection({
//   host: process.env.HOST,
//   port: process.env.DB_PORT, // If 3308 is the correct port    
//   user: process.env.USER,
//   password: process.env.PASSWORD,
//   database: process.env.DATABASE,
// });

// // Connect to the database
// db.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL:', err);
//   } else {
//     console.log('Connected to MySQL database');
//   }
// });

// module.exports = db;

const mysql = require('mysql2');

// Database configuration
const db = mysql.createConnection({
  host: process.env.HOST,
  port: process.env.DB_PORT, // If 3308 is the correct port    
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  // Reconnect option with a delay of 2 seconds between reconnect attempts
  reconnect: {
    autoReconnect: true,
    delay: 2000, // milliseconds
  },
});

// Function to handle MySQL connection errors
function handleDisconnect() {
  db.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
      setTimeout(handleDisconnect, 2000); // Attempt to reconnect after 2 seconds
    } else {
      throw err;
    }
  });
}

// Connect to the database and handle disconnections
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    setTimeout(handleDisconnect, 2000); // Attempt to reconnect after 2 seconds
  } else {
    console.log('Connected to MySQL database');
  }
});

module.exports = db.promise();
