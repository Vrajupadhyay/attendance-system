// const db = require("../db");
const pool = require('../db'); // Adjust the path as needed
// exports.markExtraAttendance = (req, res) => {
//     // Destructure the necessary properties from req.body
//     const { id, username, date, attendanceData } = req.body;
  
//     // Define the SQL query
//     const insertAttendanceQuery = `
//       INSERT INTO extra_attendance (course_id, student_id, username, date, status)
//       VALUES (?, ?, ?, ?, ?)
//     `;
  
//     // Loop through attendanceData and insert each record into the database
//     attendanceData.forEach((record) => {
//       const { student_id, status } = record;
//       const values = [id, student_id, username, date, status];
  
//       db.query(insertAttendanceQuery, values, (err, result) => {
//         if (err) {
//           console.error("Error inserting attendance data:", err);
//           return res.status(500).json({ error: "Internal Server Error" });
//         }
//       });
//     });
  
//     // Send a response indicating successful attendance marking with a status of 201
//     return res.status(201).json({ message: "Attendance marked successfully" });
//   };
  

exports.markExtraAttendance = async (req, res) => {
  // Destructure the necessary properties from req.body
  const { id, username, date, attendanceData } = req.body;

  try {
    // Define the SQL query
    const insertAttendanceQuery = `
      INSERT INTO extra_attendance (course_id, student_id, username, date, status)
      VALUES (?, ?, ?, ?, ?)
    `;

    // Loop through attendanceData and insert each record into the database
    for (const record of attendanceData) {
      const { student_id, status } = record;
      const values = [id, student_id, username, date, status];

      // Execute the insert query using the pool
      await executeQuery(insertAttendanceQuery, values);
    }

    // Send a response indicating successful attendance marking with a status of 201
    res.status(201).json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error("Error inserting attendance data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//get attendance by course id and date and username
const mysql = require('mysql2/promise'); // Import the promise-based MySQL2 library

// Your database configuration
const dbConfig = {
  host: process.env.HOST,
  port: process.env.DB_PORT,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
};

exports.getExtraAttendance = async (req, res) => {
  try {
    const { course_id, date, username } = req.params;

    // Create a new connection pool
    const pool = mysql.createPool(dbConfig);

    const query = `
      SELECT students.id, students.uid, extra_attendance.status, students.fullname
      FROM students
      INNER JOIN extra_attendance ON students.id = extra_attendance.student_id
      WHERE extra_attendance.course_id = ? AND extra_attendance.date = ? AND extra_attendance.username = ?;
    `;

    const [results] = await pool.query(query, [course_id, date, username]);

    // Check if results are empty
    if (results.length === 0) {
      res.status(404).json({ error: 'Attendance data not found' });
    } else {
      res.json(results);
      console.log(results);
    }

    // Close the connection pool when done
    pool.end();
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
