//controller/courseController.js

const db = require("../db");

// Controller functions
// Create a route to handle adding a course
exports.createCourse = (req, res) => {
  const {
    username,
    courseId,
    courseName,
    department,
    startDate,
    endDate,
    // selectedDays,
    classType,
    batch,
    selectedTimes,
    sem,
  } = req.body;
  // console.log(req.body);
  if (
    !courseId ||
    !courseName ||
    !department ||
    !sem ||
    !username ||
    !startDate ||
    !endDate ||
    // !selectedDays ||
    !classType ||
    !selectedTimes
  ) {
    return res.status(400).json({ error: "Invalid request data" });
  }
  // Convert selectedTimes object to JSON
  const selectedTimesJSON = JSON.stringify(selectedTimes);

  const query =
    "INSERT INTO courses (username, course_id, course_name, department, sem, start_date, end_date, classType, batch, selectedTimes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    query,
    [
      username,
      courseId,
      courseName,
      department,
      sem,
      startDate,
      endDate,
      // selectedDays,
      classType,
      batch,
      selectedTimesJSON,
    ],
    (err, result) => {
      if (err) {
        console.error("Error adding course:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(201).json({ message: "Course added successfully" });
    }
  );
};

//view course by username
exports.viewCourse = (req, res) => {
  const { username } = req.params;
  const query = "SELECT * FROM courses WHERE username = ?";
  db.execute(query, [username], (err, result) => {
    if (err) {
      console.error("Error viewing course:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json(result);
  });
};

// Edit course by ID
exports.editCourse = (req, res) => {
  const { id, courseId, courseName, department, selectedDays } = req.body;
  // console.log(req.body);
  // Check for missing or invalid data
  if (!id || !courseId || !courseName || !department || !selectedDays) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  const query =
    "UPDATE courses SET course_id = ?, course_name = ?, department = ?, week_days = ? WHERE id = ?";
  db.query(
    query,
    [courseId, courseName, department, selectedDays, id], // Added 'id' to the parameter array
    (err, result) => {
      if (err) {
        console.error("Error editing course:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(200).json({ message: "Course edited successfully" });
    }
  );
};

//view course by id
exports.viewCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    // console.log(req.params);
    // Query the database for the course with the specified ID
    const sql = "SELECT * FROM courses WHERE id = ?";
    db.query(sql, [courseId], (err, results) => {
      if (err) {
        console.error("Database query error: " + err.message);
        res.status(500).json({ error: "Database query error" });
        return;
      }

      if (results.length === 0) {
        // No course found with the specified ID
        res.status(404).json({ error: "Course not found" });
      } else {
        // Course found, send it as a response
        res.json(results[0]);
      }
    });
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
//delete course as well as attendance by id
exports.deleteCourse = (req, res) => {
  const { id } = req.params;
  // console.log(req.params);
  if (!id) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  // First, delete the course record
  const deleteAttendanceQuery = "DELETE FROM attendance WHERE course_id = ?";  
  db.query(deleteAttendanceQuery, [id], (err, result) => {
    if (err) {
      console.error("Error deleting course:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // After successfully deleting the course, delete related attendance records
    const deleteCourseQuery = "DELETE FROM courses WHERE id = ?";
    db.query(deleteCourseQuery, [id], (err, result) => {
      if (err) {
        console.error("Error deleting attendance records:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.status(200).json({ message: "Course and associated attendance records deleted successfully" });
    });
  });
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
