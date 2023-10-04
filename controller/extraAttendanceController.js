const db = require("../db");

exports.markExtraAttendance = (req, res) => {
    // Destructure the necessary properties from req.body
    const { id, username, date, attendanceData } = req.body;
  
    // Define the SQL query
    const insertAttendanceQuery = `
      INSERT INTO extra_attendance (course_id, student_id, username, date, status)
      VALUES (?, ?, ?, ?, ?)
    `;
  
    // Loop through attendanceData and insert each record into the database
    attendanceData.forEach((record) => {
      const { student_id, status } = record;
      const values = [id, student_id, username, date, status];
  
      db.query(insertAttendanceQuery, values, (err, result) => {
        if (err) {
          console.error("Error inserting attendance data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
      });
    });
  
    // Send a response indicating successful attendance marking with a status of 201
    return res.status(201).json({ message: "Attendance marked successfully" });
  };
  
  
//get attendance by course id and date and username
exports.getExtraAttendance = (req, res) => {
    const { course_id, date, username } = req.params;
    // console.log(req.params);
    // const query = "SELECT * FROM attendance WHERE course_id = ? AND date = ? AND username = ?";
    const query =
      "SELECT students.id, students.uid, extra_attendance.status, students.fullname FROM students INNER JOIN extra_attendance ON students.id = extra_attendance.student_id WHERE extra_attendance.course_id = ? AND extra_attendance.date = ? AND extra_attendance.username = ?;";
    db.query(query, [course_id, date, username], (err, results) => {
      if (err) {
        console.error("Error fetching attendance:", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        // console.log(results);
        res.json(results);
      }
    });
  };