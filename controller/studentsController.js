// controllers/studentsController.js

const db = require("../db");
// const XLSX = require("xlsx");
const ExcelJS = require("exceljs");
const fileUpload = require("express-fileupload");
// const mysql = require("mysql2");

// Controller functions

// exports.getAllStudents = (req, res) => {
//   const query = "SELECT * FROM students";

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching students:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//     } else {
//       res.json(results);
//     }
//   });
// };

// exports.createStudent = (req, res) => {
//   const {
//     uid,
//     fullname,
//     department,
//     contact_number,
//     emailid,
//     current_sem,
//     course_id,
//     username,
//   } = req.body;
//   // console.log(req.body);
//   const query =
//     "INSERT INTO students (uid, fullname, department, contact_number, emailid, current_sem, course_id, username) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

//   db.query(
//     query,
//     [
//       uid,
//       fullname,
//       department,
//       contact_number,
//       emailid,
//       current_sem,
//       course_id,
//       username,
//     ],
//     (err, result) => {
//       if (err) {
//         console.error("Error creating student:", err);
//         res.status(500).json({ error: "Internal Server Error" });
//       } else {
//         res.status(200).json({ message: "Student created successfully" });
//       }
//     }
//   );
// };

// //get student by course id and username
// exports.getStudentByCourseId = (req, res) => {
//   const { course_id, username } = req.params;
//   // console.log(req.params);
//   const query = "SELECT * FROM students WHERE course_id = ? AND username = ?";

//   db.query(query, [course_id, username], (err, results) => {
//     if (err) {
//       console.error("Error fetching student:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//     } else {
//       res.json(results);
//       // console.log(results);
//     }
//   });
// };

// exports.getStudentById = (req, res) => {
//   const { id } = req.params;
//   const query = "SELECT * FROM students WHERE id = ?";

//   db.query(query, [id], (err, results) => {
//     if (err) {
//       console.error("Error fetching student:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//     } else {
//       res.json(results);
//     }
//   });
// };

// //delete student by id
// exports.deleteStudent = (req, res) => {
//   const { id } = req.params;
//   const query = "DELETE FROM students WHERE id = ?";

//   db.query(query, [id], (err, results) => {
//     if (err) {
//       console.error("Error deleting student:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//     } else {
//       res.json(results);
//     }
//   });
// };

exports.getAllStudents = async (req, res) => {
  try {
    const query = "SELECT * FROM students";
    const [results] = await db.execute(query);
    res.json(results);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const {
      uid,
      fullname,
      department,
      contact_number,
      emailid,
      current_sem,
      course_id,
      batch,
      classType,
      username,
    } = req.body;

    const query =
      "INSERT INTO students (uid, fullname, department, contact_number, emailid, current_sem, course_id, classType, batch, username) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    await db.execute(query, [
      uid,
      fullname,
      department,
      contact_number,
      emailid,
      current_sem,
      course_id,
      classType,
      batch,
      username,
    ]);

    res.status(200).json({ message: "Student created successfully" });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getStudentByCourseId = async (req, res) => {
  try {
    const { course_id, batch, username } = req.params;
    const query =
      "SELECT * FROM students WHERE course_id = ? AND batch = ? AND username = ?";
    const [results] = await db.execute(query, [course_id, batch, username]);
    res.json(results);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM students WHERE id = ?";
    const [results] = await db.execute(query, [id]);
    res.json(results);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Identify related attendance records
    const attendanceQuery = "SELECT * FROM attendance WHERE student_id = ?";
    const [attendanceResults] = await db.execute(attendanceQuery, [id]);

    // Step 2: Delete related attendance records
    const deleteAttendanceQuery = "DELETE FROM attendance WHERE student_id = ?";
    await db.execute(deleteAttendanceQuery, [id]);

    // Step 3: Delete the student record
    const deleteStudentQuery = "DELETE FROM students WHERE id = ?";
    await db.execute(deleteStudentQuery, [id]);

    res.json({
      message: "Student and related attendance records deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//add student to course excel template

// exports.addStudentToCourseTemplate = (req, res) => {
//   // Create a new workbook
// const workbook = new exceljs.Workbook();

// // Add a worksheet
// const worksheet = workbook.addWorksheet('Students');

// // Set the header row
// worksheet.columns = [
//   { header: 'uid', key: 'uid' },
//   { header: 'fullname', key: 'fullname' },
//   { header: 'department', key: 'department' },
//   { header: 'gender', key: 'gender' },
//   { header: 'contact_number', key: 'contact_number' },
//   { header: 'emailid', key: 'emailid' },
//   { header: 'current_sem', key: 'current_sem' },
// ];

// // Add some data to the worksheet
// const students = [
//   { uid: 1, fullname: 'John Doe', department: 'Computer Science', gender: 'Male', contact_number: '1234567890', emailid: 'john.doe@example.com', current_sem: 3 },
//   { uid: 2, fullname: 'Jane Doe', department: 'Electrical Engineering', gender: 'Female', contact_number: '9876543210', emailid: 'jane.doe@example.com', current_sem: 2 },
// ];

// students.forEach((student) => {
//   worksheet.addRow(student);
// });

// // Save the workbook to a file
// const filename = 'students.xlsx';
// workbook.xlsx.writeFile(filename);

// // Send the file to the front end
// const fs = require('fs');

// const fileContent = fs.readFileSync(filename);

// // Set the response headers
// response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
// response.setHeader('Content-Disposition', `attachment; filename=${filename}`);

// // Send the file
// response.send(fileContent);
// };

// const ExcelJS = require('exceljs');
// const mysql = require("mysql2/promise");

// // Database configuration
// const dbConfig = {
//   host: process.env.HOST,
//   port: process.env.DB_PORT,
//   user: process.env.USER,
//   password: process.env.PASSWORD,
//   database: process.env.DATABASE,
// };

// exports.ImportStudentExcel = async (req, res) => {
//   try {
//     // Extract the 'courseId' and 'username' from the request body
//     const { courseId, username, filepath } = req.body;

//     if (!courseId || !username) {
//       return res.status(400).send("Invalid request data."); // Handle missing data
//     }

//     // Load the Excel file
//     const workbook = new ExcelJS.Workbook();
//     await workbook.xlsx.readFile(filepath); // Replace with the actual file path

//     // Assuming the data is in the first worksheet
//     const worksheet = workbook.getWorksheet(1);

//     // Create a database connection
//     const connection = await mysql.createConnection(dbConfig);

//     // Iterate through rows and insert data into the database
//     for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
//       const row = worksheet.getRow(rowNumber);
//       const uid = row.getCell(1).value?.toString() ?? "";
//       const fullname = row.getCell(2).value?.toString() ?? "";
//       const department = row.getCell(3).value?.toString() ?? "";
//       // const gender = row.getCell(4).value?.toString() ?? "";
//       const contactNumber = row.getCell(4).value?.toString() ?? "";
//        // Check the cell value for non-string types and convert to a string
//        const emailCell = row.getCell(5);
//        const emailid = emailCell.text || '';

//       const currentSem = row.getCell(6).value?.toString() ?? "";
//       // console.log(row.getCell(6).value?.toString());
//       // console.log(emailid);
//       // Insert the student data into the database (replace 'students' with your actual table name)
//       const query = `
//         INSERT INTO students (uid, fullname, department, contact_number, emailid, current_sem, course_id, username)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//       `;

//       await connection.execute(query, [
//         uid,
//         fullname,
//         department,
//         contactNumber,
//         emailid,
//         currentSem,
//         courseId,
//         username,
//       ]);
//     }

//     // Close the database connection
//     await connection.end();

//     res.status(200).send("Students uploaded from Excel file successfully.");
//   } catch (error) {
//     console.error("Error uploading students from Excel:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };

//final code for import student excel but work in only local host
// exports.ImportStudentExcel = async (req, res) => {
//   try {
//     // Extract the 'courseId' and 'username' from the request body
//     const { courseId, username, filepath } = req.body;
//     // console.log(req.body);
//     console.log(courseId,username,filepath);
//     if (!courseId || !username) {
//       return res.status(400).send("Invalid request data."); // Handle missing data
//     }

//     // Load the Excel file
//     const workbook = new ExcelJS.Workbook();
//     await workbook.xlsx.readFile(filepath); // Replace with the actual file path

//     // Assuming the data is in the first worksheet
//     const worksheet = workbook.getWorksheet(1);

//     // Create a database connection
//     const connection = await db.getConnection();

//     // Iterate through rows and insert data into the database
//     for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
//       const row = worksheet.getRow(rowNumber);
//       const uid = row.getCell(1).value?.toString() ?? "";
//       const fullname = row.getCell(2).value?.toString() ?? "";
//       const department = row.getCell(3).value?.toString() ?? "";
//       // const contactNumber = row.getCell(4).value?.toString() ?? "";
//       // const emailCell = row.getCell(5);
//       // const emailid = emailCell.text || '';
//       const currentSem = row.getCell(4).value?.toString() ?? "";

//       // Insert the student data into the database (replace 'students' with your actual table name)
//       const query = `
//         INSERT INTO students (uid, fullname, department, current_sem, course_id, username)
//         VALUES (?, ?, ?, ?, ?, ?)
//       `;

//       await connection.execute(query, [
//         uid,
//         fullname,
//         department,
//         currentSem,
//         courseId,
//         username,
//       ]);
//     }

//     // Release the database connection
//     connection.release();

//     res.status(200).send("Students uploaded from Excel file successfully.");
//   } catch (error) {
//     console.error("Error uploading students from Excel:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };
exports.ImportStudentExcel = async (req, res) => {
  try {
    const { courseId, username, classType, batch, students } = req.body;
    // console.log(req.body);

    // Check if required data is missing
    if (!courseId || !username || !students || !Array.isArray(students)) {
      return res.status(400).send("Invalid request data.");
    }

    // Create a database connection (assuming you have a reusable connection pool)
    const connection = await db.getConnection();

    // Iterate through the received student data and insert into the database
    for (const studentData of students) {
      const { uid, fullname, department, currentSem } = studentData;

      // Check if any of the required data is missing
      if (!uid || !fullname || !department || !currentSem) {
        console.error("Missing required data for a student:", studentData);
        continue; // Skip this student and log an error
      }

      // Insert the student data into the database (replace 'students' with your actual table name)
      const query = `
        INSERT INTO students (uid, fullname, department, current_sem, classType, batch, course_id, username)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(query, [
        uid,
        fullname,
        department,
        currentSem,
        classType,
        batch,
        courseId,
        username,
      ]);
    }

    // Release the database connection
    connection.release();

    res.status(200).send("Students uploaded successfully.");
  } catch (error) {
    console.error("Error uploading students:", error);
    res.status(500).send("Internal Server Error");
  }
};

//here start a code for student role
// SELECT students.uid, students.fullname, courses.course_id, courses.course_name, COUNT(*) AS total_lectures, SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) AS present_lectures, (SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS percentage_attendance FROM students LEFT JOIN attendance ON students.id = attendance.student_id LEFT JOIN courses ON courses.id = attendance.course_id WHERE students.uid = '22IT402' GROUP BY students.uid, students.fullname, courses.course_id, courses.course_name;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           