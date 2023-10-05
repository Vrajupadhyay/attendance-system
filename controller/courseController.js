//controller/courseController.js

// const db = require("../db");
const pool = require('../db'); // Adjust the path as needed
// Controller functions
// Create a route to handle adding a course
// exports.createCourse = (req, res) => {
//   const {
//     username,
//     courseId,
//     courseName,
//     department,
//     startDate,
//     endDate,
//     // selectedDays,
//     classType,
//     batch,
//     selectedTimes,
//     sem,
//   } = req.body;
//   // console.log(req.body);
//   if (
//     !courseId ||
//     !courseName ||
//     !department ||
//     !sem ||
//     !username ||
//     !startDate ||
//     !endDate ||
//     // !selectedDays ||
//     !classType ||
//     !selectedTimes
//   ) {
//     return res.status(400).json({ error: "Invalid request data" });
//   }
//   // Convert selectedTimes object to JSON
//   const selectedTimesJSON = JSON.stringify(selectedTimes);

//   const query =
//     "INSERT INTO courses (username, course_id, course_name, department, sem, start_date, end_date, classType, batch, selectedTimes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
//   db.query(
//     query,
//     [
//       username,
//       courseId,
//       courseName,
//       department,
//       sem,
//       startDate,
//       endDate,
//       // selectedDays,
//       classType,
//       batch,
//       selectedTimesJSON,
//     ],
//     (err, result) => {
//       if (err) {
//         console.error("Error adding course:", err);
//         return res.status(500).json({ error: "Internal Server Error" });
//       }
//       res.status(201).json({ message: "Course added successfully" });
//     }
//   );
// };

exports.createCourse = async (req, res) => {
  try {
    const {
      username,
      courseId,
      courseName,
      department,
      startDate,
      endDate,
      classType,
      batch,
      selectedTimes,
      sem,
    } = req.body;

    // Check if any required field is missing
    if (
      !courseId ||
      !courseName ||
      !department ||
      !sem ||
      !username ||
      !startDate ||
      !endDate ||
      !classType ||
      !selectedTimes
    ) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Convert selectedTimes object to JSON
    const selectedTimesJSON = JSON.stringify(selectedTimes);

    // Your SQL query for inserting a new course
    const query =
      "INSERT INTO courses (username, course_id, course_name, department, sem, start_date, end_date, classType, batch, selectedTimes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    // Execute the query using the connection pool
    await pool.execute(query, [
      username,
      courseId,
      courseName,
      department,
      sem,
      startDate,
      endDate,
      classType,
      batch,
      selectedTimesJSON,
    ]);

    // Send a success response
    res.status(201).json({ message: "Course added successfully" });
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//view course by username
// exports.viewCourse = (req, res) => {
//   const { username } = req.params;
//   const query = "SELECT * FROM courses WHERE username = ?";
//   db.query(query, [username], (err, result) => {
//     if (err) {
//       console.error("Error viewing course:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//     res.status(200).json(result);
//   });
// };

// // Edit course by ID
// exports.editCourse = (req, res) => {
//   const { id, courseId, courseName, department, selectedDays } = req.body;
//   // console.log(req.body);
//   // Check for missing or invalid data
//   if (!id || !courseId || !courseName || !department || !selectedDays) {
//     return res.status(400).json({ error: "Invalid request data" });
//   }

//   const query =
//     "UPDATE courses SET course_id = ?, course_name = ?, department = ?, week_days = ? WHERE id = ?";
//   db.query(
//     query,
//     [courseId, courseName, department, selectedDays, id], // Added 'id' to the parameter array
//     (err, result) => {
//       if (err) {
//         console.error("Error editing course:", err);
//         return res.status(500).json({ error: "Internal Server Error" });
//       }
//       res.status(200).json({ message: "Course edited successfully" });
//     }
//   );
// };

// //view course by id
// exports.viewCourseById = async (req, res) => {
//   try {
//     const courseId = req.params.id;
//     // console.log(req.params);
//     // Query the database for the course with the specified ID
//     const sql = "SELECT * FROM courses WHERE id = ?";
//     db.query(sql, [courseId], (err, results) => {
//       if (err) {
//         console.error("Database query error: " + err.message);
//         res.status(500).json({ error: "Database query error" });
//         return;
//       }

//       if (results.length === 0) {
//         // No course found with the specified ID
//         res.status(404).json({ error: "Course not found" });
//       } else {
//         // Course found, send it as a response
//         res.json(results[0]);
//       }
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// View all courses by username
exports.viewCourse = async (req, res) => {
  try {
    const { username } = req.params;
    // console.log(req.params);
    const query = "SELECT * FROM courses WHERE username = ?";
    const [results, fields] = await pool.execute(query, [username]);

    res.status(200).json(results);
    // console.log(results);
  } catch (error) {
    console.error("Error viewing course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Edit course by ID
exports.editCourse = async (req, res) => {
  try {
    const { id, courseId, courseName, department, selectedDays } = req.body;

    // Check for missing or invalid data
    if (!id || !courseId || !courseName || !department || !selectedDays) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const query =
      "UPDATE courses SET course_id = ?, course_name = ?, department = ?, week_days = ? WHERE id = ?";
    await pool.execute(query, [courseId, courseName, department, selectedDays, id]);

    res.status(200).json({ message: "Course edited successfully" });
  } catch (error) {
    console.error("Error editing course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// View course by id
exports.viewCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Query the database for the course with the specified ID
    const sql = "SELECT * FROM courses WHERE id = ?";
    const [results, fields] = await pool.execute(sql, [courseId]);

    if (results.length === 0) {
      // No course found with the specified ID
      res.status(404).json({ error: "Course not found" });
    } else {
      // Course found, send it as a response
      res.json(results[0]);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//delelte course by id
// exports.deleteCourse = (req, res) => {
//   const { id } = req.params;
//   console.log(req.params);
//   if (!id) {
//     return res.status(400).json({ error: "Invalid request data" });
//   }
//   const query = "DELETE FROM courses WHERE id = ?";
//   db.query(query, [id], (err, result) => {
//     if (err) {
//       console.error("Error deleting course:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//     res.status(200).json({ message: "Course deleted successfully" });
//   });
// };

//finally delete course by id
//delete course as well as attendance by id
// exports.deleteCourse = (req, res) => {
//   const { id } = req.params;
//   // console.log(req.params);
//   if (!id) {
//     return res.status(400).json({ error: "Invalid request data" });
//   }

//   // First, delete the course record
//   const deleteAttendanceQuery = "DELETE FROM attendance WHERE course_id = ?";  
//   db.query(deleteAttendanceQuery, [id], (err, result) => {
//     if (err) {
//       console.error("Error deleting course:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }

//     // After successfully deleting the course, delete related attendance records
//     const deleteCourseQuery = "DELETE FROM courses WHERE id = ?";
//     db.query(deleteCourseQuery, [id], (err, result) => {
//       if (err) {
//         console.error("Error deleting attendance records:", err);
//         return res.status(500).json({ error: "Internal Server Error" });
//       }

//       res.status(200).json({ message: "Course and associated attendance records deleted successfully" });
//     });
//   });
// };

// Delete course by ID
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // First, delete the attendance records related to the course
    const deleteAttendanceQuery = "DELETE FROM attendance WHERE course_id = ?";
    await pool.execute(deleteAttendanceQuery, [id]);

    // After successfully deleting the attendance records, delete the course record
    const deleteCourseQuery = "DELETE FROM courses WHERE id = ?";
    await pool.execute(deleteCourseQuery, [id]);

    res.status(200).json({ message: "Course and associated attendance records deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// //update week_days by username and course_id
// exports.updateCourse = (req, res) => {
//   const { username, courseId, weekDays } = req.body;
//   console.log(req.body);
//   const query = "UPDATE courses SET week_days = ? WHERE username = ? AND course_id = ?";
//   db.query(query, [weekDays, username, courseId], (err, result) => {
//     if (err) {
//       console.error("Error updating course:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//     res.status(200).json({ message: "Course updated successfully" });
//   });
// };
