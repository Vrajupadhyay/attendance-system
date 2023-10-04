const db = require("../db");
const XLSX = require("xlsx");

//attendance mark
// exports.markAttendance = (req, res) => {
//   // Destructure the necessary properties from req.body
//   const { id, username, date, time, attendanceData } = req.body;

//   // Define the SQL query
//   const insertAttendanceQuery = `
//     INSERT INTO attendance (course_id, student_id, username, date, time, status)
//     VALUES (?, ?, ?, ?, ?, ?)
//   `;

//   // Loop through attendanceData and insert each record into the database
//   attendanceData.forEach((record) => {
//     const { student_id, status } = record;
//     const values = [id, student_id, username, date, time, status];

//     db.query(insertAttendanceQuery, values, (err, result) => {
//       if (err) {
//         console.error("Error inserting attendance data:", err);
//         return res.status(500).json({ error: "Internal Server Error" });
//       }
//     });
//   });

//   // Send a response indicating successful attendance marking with a status of 201
//   return res.status(201).json({ message: "Attendance marked successfully" });
// };

//attendance mark but duplicate attendace not mark in database
exports.markAttendance = (req, res) => {
  const { id, username, date, time, attendanceData } = req.body;

  // Create an array to store duplicate entries
  const duplicateEntries = [];

  // Define the SQL query to check for existing attendance records
  const checkDuplicateQuery = `
    SELECT *
    FROM attendance
    WHERE course_id = ? AND student_id = ? AND date = ? AND time = ?
  `;

  // Define the SQL query to insert attendance data
  const insertAttendanceQuery = `
    INSERT INTO attendance (course_id, student_id, username, date, time, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Loop through attendanceData and check/insert each record into the database
  attendanceData.forEach((record) => {
    const { student_id, status } = record;
    const values = [id, student_id, username, date, time, status];

    // Check for duplicate record
    db.query(checkDuplicateQuery, [id, student_id, date, time], (err, results) => {
      if (err) {
        console.error("Error checking duplicate attendance:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (results.length > 0) {
        // Duplicate entry found, add to the list of duplicates
        duplicateEntries.push(`Attendance for student ${student_id} already marked for ${date} ${time}`);
      } else {
        // No duplicate found, insert the new record
        db.query(insertAttendanceQuery, values, (err, result) => {
          if (err) {
            console.error("Error inserting attendance data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
        });
      }
    });
  });

  // Check if any duplicates were found
  if (duplicateEntries.length > 0) {
    // Send a response indicating duplicate entries with a status of 409 (Conflict)
    return res.status(409).json({ message: "Duplicate attendance entries", duplicates: duplicateEntries });
  } else {
    // Send a response indicating successful attendance marking with a status of 201 (Created)
    return res.status(201).json({ message: "Attendance marked successfully" });
  }
};


//get attendance by course id and date and username
exports.getAttendance = (req, res) => {
  const { course_id, date, username } = req.params;
  // console.log(req.params);
  // const query = "SELECT * FROM attendance WHERE course_id = ? AND date = ? AND username = ?";
  const query =
    "SELECT students.id, students.uid, attendance.status, students.fullname FROM students INNER JOIN attendance ON students.id = attendance.student_id WHERE attendance.course_id = ? AND attendance.date = ? AND attendance.username = ?;";
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

// Define an API endpoint to generate the attendance report
// exports.generateAttendanceReport = (req, res) => {
//   const { course_id, username } = req.params;

//   // Fetch course details (assuming there is a 'courses' table)
//   const courseQuery = "SELECT course_name FROM courses WHERE id = ?";
//   db.query(courseQuery, [course_id], (err, courseResult) => {
//     if (err) {
//       console.error("Error fetching course details:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }

//     if (courseResult.length === 0) {
//       return res.status(404).json({ error: "Course not found" });
//     }

//     const courseName = courseResult[0].course_name;

//     // Fetch student attendance data (assuming there is an 'attendance' table)
//     const attendanceQuery = `
//       SELECT students.uid, students.fullname, attendance.date, attendance.status
//       FROM attendance
//       INNER JOIN students ON attendance.student_id = students.id
//       WHERE attendance.course_id = ? AND attendance.username = ?
//     `;

//     db.query(
//       attendanceQuery,
//       [course_id, username],
//       (err, attendanceResult) => {
//         if (err) {
//           console.error("Error fetching attendance data:", err);
//           return res.status(500).json({ error: "Internal Server Error" });
//         }

//         //  // Log the attendance data to the console
//         // console.log('Attendance Data:', attendanceResult);

//         // Create a workbook and worksheet
//         const workbook = XLSX.utils.book_new();
//         const worksheet = XLSX.utils.json_to_sheet(attendanceResult);

//         // Add headers to the worksheet
//         XLSX.utils.sheet_add_aoa(
//           worksheet,
//           [["ID", "Student UID", "Student Name", "Date", "Status"]],
//           { origin: "A1" }
//         );

//         // Set column widths
//         const colWidths = [
//           { wch: 5 },
//           { wch: 15 },
//           { wch: 20 },
//           { wch: 15 },
//           { wch: 10 },
//         ];
//         worksheet["!cols"] = colWidths;

//         // Add worksheet to the workbook
//         XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

//         // Generate a unique filename for the report
//         const fileName = `Attendance_Report_${course_id}_${username}.xlsx`;

//         // Send the Excel file as a response
//         res.setHeader(
//           "Content-Type",
//           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//         );
//         res.setHeader(
//           "Content-Disposition",
//           `attachment; filename="${fileName}"`
//         );
//         // XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
//         const excelBuffer = XLSX.write(workbook, {
//           bookType: "xlsx",
//           type: "buffer",
//         });
//         res.send(excelBuffer);
//         res.end();
//       }
//     );
//   });
// };

//final working code
// exports.generateAttendanceReport = (req, res) => {
//   const { course_id, username } = req.params;

//   // Fetch course details (assuming there is a 'courses' table)
//   const courseQuery = "SELECT course_name FROM courses WHERE id = ?";
//   db.query(courseQuery, [course_id], (err, courseResult) => {
//     if (err) {
//       console.error("Error fetching course details:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }

//     if (courseResult.length === 0) {
//       return res.status(404).json({ error: "Course not found" });
//     }

//     const courseName = courseResult[0].course_name;

//     // Fetch student attendance data (assuming there is an 'attendance' table)
//     const attendanceQuery = `
//       SELECT students.uid, students.fullname, attendance.date, attendance.status
//       FROM attendance
//       INNER JOIN students ON attendance.student_id = students.id
//       WHERE attendance.course_id = ? AND attendance.username = ?
//     `;

//     db.query(
//       attendanceQuery,
//       [course_id, username],
//       (err, attendanceResult) => {
//         if (err) {
//           console.error("Error fetching attendance data:", err);
//           return res.status(500).json({ error: "Internal Server Error" });
//         }

//         // Reorganize the data to group by UID and name
//         const groupedData = {};
//         attendanceResult.forEach((record) => {
//           const { uid, fullname, date, status } = record;
//           if (!groupedData[uid]) {
//             groupedData[uid] = { uid, fullname };
//           }
//           if (!groupedData[uid][date]) {
//             groupedData[uid][date] = status;
//           }
//         });

//         // Create a workbook and worksheet
//         const workbook = XLSX.utils.book_new();
//         const worksheet = XLSX.utils.aoa_to_sheet([
//           [...Object.keys(groupedData[Object.keys(groupedData)[0]])],
//           ...Object.values(groupedData).map((student) => [
//             student.uid,
//             student.fullname,
//             ...Object.values(student).slice(2), // Exclude UID and name
//           ]),
//         ]);

//         // Set column widths
//         const colWidths = [{ wch: 10 }, { wch: 20 }, ...Array(Object.keys(groupedData[Object.keys(groupedData)[0]]).length).fill({ wch: 5 })];
//         worksheet["!cols"] = colWidths;

//         // Add worksheet to the workbook
//         XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

//         // Generate a unique filename for the report
//         const fileName = `Attendance_Report_${course_id}_${username}.xlsx`;

//         // Send the Excel file as a response
//         res.setHeader(
//           "Content-Type",
//           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//         );
//         res.setHeader(
//           "Content-Disposition",
//           `attachment; filename="${fileName}"`
//         );
//         const excelBuffer = XLSX.write(workbook, {
//           bookType: "xlsx",
//           type: "buffer",
//         });
//         res.send(excelBuffer);
//         res.end();
//       }
//     );
//   });
// };
exports.generateAttendanceReport = (req, res) => {
  const { course_id, username } = req.params;

  // Fetch course details (assuming there is a 'courses' table)
  const courseQuery =
    "SELECT course_name, start_date, end_date, course_id, sem  FROM courses WHERE id = ?";
  db.query(courseQuery, [course_id], (err, courseResult) => {
    if (err) {
      console.error("Error fetching course details:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (courseResult.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    const courseName = courseResult[0].course_name;

    // Fetch student attendance data (assuming there is an 'attendance' table)
    const attendanceQuery = `
      SELECT students.uid, students.fullname, DATE_FORMAT(attendance.date, '%Y-%m-%d') AS formatted_date, attendance.status
      FROM attendance
      INNER JOIN students ON attendance.student_id = students.id
      WHERE attendance.course_id = ? AND attendance.username = ?`;

    db.query(
      attendanceQuery,
      [course_id, username],
      (err, attendanceResult) => {
        if (err) {
          console.error("Error fetching attendance data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        if (!attendanceResult || attendanceResult.length === 0) {
          // Handle the case where no attendance data is found
          return res.status(404).json({ error: "Attendance data not found" });
        }

        // Fetch student statistics using the second query
        const attendanceQuery2 = `
        SELECT
          students.uid,
          students.fullname,
          COUNT(*) AS total_lectures,
          SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) AS present_lectures,
          SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) / COUNT(*) * 100 AS percentage_attendance
        FROM students
        LEFT JOIN attendance ON students.id = attendance.student_id
        WHERE attendance.course_id = ? AND attendance.username = ?
        GROUP BY students.uid, students.fullname;
      `;

        db.query(
          attendanceQuery2,
          [course_id, username],
          (err, attendanceResult2) => {
            if (err) {
              console.error("Error fetching student statistics:", err);
              return res.status(500).json({ error: "Internal Server Error" });
            }

            // Create a dictionary to group data by uid and name
            const groupedData = {};

            attendanceResult.forEach((row) => {
              const { uid, fullname, formatted_date, status } = row;

              if (!groupedData[uid]) {
                groupedData[uid] = { uid, fullname, data: {} };
              }

              groupedData[uid].data[formatted_date] = status;
            });

            // Extract unique dates from the attendance data
            const uniqueDates = [
              ...new Set(attendanceResult.map((row) => row.formatted_date)),
            ];

            const courseName = courseResult[0].course_name;
            const startDate = courseResult[0].start_date;
            const endDate = courseResult[0].end_date;
            const semester = courseResult[0].sem;
            const courseCode = courseResult[0].course_id;

            // Create a workbook and worksheet
            const workbook = XLSX.utils.book_new();
            const worksheetData = [];

            // Add custom headers and information to the worksheet
            worksheetData.push(["BIRLA VISHVAKARMA MAHAVIDHYALAYA"]); // Add your custom headers here
            worksheetData.push(["INFORMATION TECHNOLOGY"]);
            worksheetData.push([
              "Student Attendance Sheet(AY: " +
                startDate.getFullYear() +
                "-" +
                endDate.getFullYear() +
                ", Sem-" +
                semester +
                ")",
            ]);
            worksheetData.push([
              "Subject Name and Code: " + courseName + "(" + courseCode + ")",
            ]);

            const headers = [
              "UID",
              "Name",
              ...uniqueDates,
              "Total Lectures",
              "Present Lectures",
              "Percentage",
            ];
            worksheetData.push(headers);
            const merges = [
              { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }, // Merge cells for the first row
              { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }, // Merge cells for the second row
              { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } }, // Merge cells for the third row
              { s: { r: 3, c: 0 }, e: { r: 3, c: headers.length - 1 } }, // Merge cells for the fourth row
            ];

            attendanceResult2.forEach((row) => {
              const {
                uid,
                fullname,
                total_lectures,
                present_lectures,
                percentage_attendance,
              } = row;
              const dataRow = groupedData[uid];

              if (dataRow) {
                const rowData = [
                  uid,
                  fullname,
                  ...uniqueDates.map((date) => dataRow.data[date] || ""), // Display each date only once
                  total_lectures,
                  present_lectures,
                  percentage_attendance,
                ];
                worksheetData.push(rowData);
              }
            });

            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

            // Set column widths
            const colWidths = [
              { wch: 10 },
              { wch: 20 },
              ...Array(headers.length - 2).fill({ wch: 12 }), // Adjust width for date columns
              { wch: 15 },
              { wch: 15 },
              { wch: 15 },
            ];
            worksheet["!cols"] = colWidths;
            // Add merges to the worksheet
            worksheet["!merges"] = merges;

            // Add worksheet to the workbook
            XLSX.utils.book_append_sheet(
              workbook,
              worksheet,
              "Attendance Report"
            );

            // Generate a unique filename for the report
            const fileName = `Attendance_Report_${course_id}_${username}.xlsx`;

            // Send the Excel file as a response
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="${fileName}"`
            );
            const excelBuffer = XLSX.write(workbook, {
              bookType: "xlsx",
              type: "buffer",
            });
            res.send(excelBuffer);
          }
        );
      }
    );
  });
};

exports.generateMonthlyAttendanceReport = (req, res) => {
  const { course_id, username, selectedMonth } = req.params;

  // Fetch course details (assuming there is a 'courses' table)
  const courseQuery =
    "SELECT course_name, start_date, end_date, course_id, sem  FROM courses WHERE id = ?";
  db.query(courseQuery, [course_id], (err, courseResult) => {
    if (err) {
      console.error("Error fetching course details:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (courseResult.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    const courseName = courseResult[0].course_name;

    // Fetch student attendance data (assuming there is an 'attendance' table)
    const attendanceQuery = `
      SELECT students.uid, students.fullname, DATE_FORMAT(attendance.date, '%Y-%m-%d') AS formatted_date, attendance.status
      FROM attendance
      INNER JOIN students ON attendance.student_id = students.id
      WHERE attendance.course_id = ? AND attendance.username = ? AND MONTH(attendance.date) = ?`;

    db.query(
      attendanceQuery,
      [course_id, username, selectedMonth],
      (err, attendanceResult) => {
        if (err) {
          console.error("Error fetching attendance data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        if (!attendanceResult || attendanceResult.length === 0) {
          // Handle the case where no attendance data is found
          return res.status(404).json({ error: "Attendance data not found" });
        }

        // Fetch student statistics using the second query
        const attendanceQuery2 = `
        SELECT
          students.uid,
          students.fullname,
          COUNT(*) AS total_lectures,
          SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) AS present_lectures,
          SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) / COUNT(*) * 100 AS percentage_attendance
        FROM students
        LEFT JOIN attendance ON students.id = attendance.student_id
        WHERE attendance.course_id = ? AND attendance.username = ? AND MONTH(attendance.date) = ?
        GROUP BY students.uid, students.fullname;
      `;

        db.query(
          attendanceQuery2,
          [course_id, username, selectedMonth],
          (err, attendanceResult2) => {
            if (err) {
              console.error("Error fetching student statistics:", err);
              return res.status(500).json({ error: "Internal Server Error" });
            }

            // Create a dictionary to group data by uid and name
            const groupedData = {};

            attendanceResult.forEach((row) => {
              const { uid, fullname, formatted_date, status } = row;

              if (!groupedData[uid]) {
                groupedData[uid] = { uid, fullname, data: {} };
              }

              groupedData[uid].data[formatted_date] = status;
            });

            // Extract unique dates from the attendance data
            const uniqueDates = [
              ...new Set(attendanceResult.map((row) => row.formatted_date)),
            ];

            const courseName = courseResult[0].course_name;
            const startDate = courseResult[0].start_date;
            const endDate = courseResult[0].end_date;
            const semester = courseResult[0].sem;
            const courseCode = courseResult[0].course_id;

            // Create a workbook and worksheet
            const workbook = XLSX.utils.book_new();
            const worksheetData = [];

            // Add custom headers and information to the worksheet
            worksheetData.push(["BIRLA VISHVAKARMA MAHAVIDHYALAYA"]); // Add your custom headers here
            worksheetData.push(["INFORMATION TECHNOLOGY"]);
            worksheetData.push([
              "Student Attendance Sheet(AY: " +
                startDate.getFullYear() +
                "-" +
                endDate.getFullYear() +
                ", Sem-" +
                semester +
                ")",
            ]);
            worksheetData.push([
              "Subject Name and Code: " + courseName + "(" + courseCode + ")",
            ]);

            const headers = [
              "UID",
              "Name",
              ...uniqueDates,
              "Total Lectures",
              "Present Lectures",
              "Percentage",
            ];
            worksheetData.push(headers);
            const merges = [
              { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }, // Merge cells for the first row
              { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }, // Merge cells for the second row
              { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } }, // Merge cells for the third row
              { s: { r: 3, c: 0 }, e: { r: 3, c: headers.length - 1 } }, // Merge cells for the fourth row
            ];

            attendanceResult2.forEach((row) => {
              const {
                uid,
                fullname,
                total_lectures,
                present_lectures,
                percentage_attendance,
              } = row;
              const dataRow = groupedData[uid];

              if (dataRow) {
                const rowData = [
                  uid,
                  fullname,
                  ...uniqueDates.map((date) => dataRow.data[date] || ""), // Display each date only once
                  total_lectures,
                  present_lectures,
                  percentage_attendance,
                ];
                worksheetData.push(rowData);
              }
            });

            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

            // Set column widths
            const colWidths = [
              { wch: 10 },
              { wch: 20 },
              ...Array(headers.length - 2).fill({ wch: 12 }), // Adjust width for date columns
              { wch: 15 },
              { wch: 15 },
              { wch: 15 },
            ];
            worksheet["!cols"] = colWidths;
            // Add merges to the worksheet
            worksheet["!merges"] = merges;

            // Add worksheet to the workbook
            XLSX.utils.book_append_sheet(
              workbook,
              worksheet,
              "Attendance Report"
            );

            // Generate a unique filename for the report
            const fileName = `Attendance_Report_${course_id}_${username}.xlsx`;

            // Send the Excel file as a response
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="${fileName}"`
            );
            const excelBuffer = XLSX.write(workbook, {
              bookType: "xlsx",
              type: "buffer",
            });
            res.send(excelBuffer);
          }
        );
      }
    );
  });
};

// percentage of attendance by date
exports.getAttendancePercentage = (req, res) => {
  const { course_id, username, date } = req.params;
  // console.log(req.params);
  const query =
    "SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present, SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent FROM attendance WHERE course_id = ? AND username = ? AND date = ?";
  db.query(query, [course_id, username, date], (err, results) => {
    if (err) {
      console.error("Error fetching attendance:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      // console.log(results);
      res.json(results);
    }
  });
};

// each student attendance by course id and username
exports.getStudentAttendance = (req, res) => {
  const { course_id, username } = req.params;
  // console.log(req.params);
  // const query = "SELECT students.uid, students.fullname, COUNT(*) AS total_lectures, SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) AS present_lectures, (SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS attendance_percentage FROM FROM students LEFT JOIN attendance ON students.id = attendance.student_id WHERE attendance.course_id = ? AND attendance.username = ? GROUP BY students.uid, students.fullname;";
  const query =
    "SELECT  students.uid, students.emailid, students.fullname, students.contact_number, COUNT(*) AS total_lectures,  SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) AS present_lectures, SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) / COUNT(*) * 100 AS percentage_attendance FROM  students LEFT JOIN attendance ON students.id = attendance.student_id WHERE  attendance.course_id = ? AND attendance.username = ? GROUP BY  students.uid, students.fullname; ";

  db.query(query, [course_id, username], (err, results) => {
    if (err) {
      console.error("Error fetching attendance:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      // console.log(results);
      res.json(results);
    }
  });
};

//update student by toggle button
exports.updateStudentAttendance = (req, res) => {
  const { username, course_id, currentDate, studentUID } = req.params;
  // console.log(req.params);
  // console.log(req.params);
  const query = `
  UPDATE attendance
  SET status = CASE
    WHEN status = 'Present' THEN 'Absent'
    WHEN status = 'Absent' THEN 'Present'
    ELSE status
  END
  WHERE username = ? AND course_id = ? AND date = ? AND student_id = ?`;
  db.query(
    query,
    [course_id, username, currentDate, studentUID],
    (err, results) => {
      if (err) {
        console.error("Error fetching attendance:", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        // console.log(results);
        res.json(results);
      }
    }
  );
};

//filter attendance by percentage
exports.getAttendanceByPercentageFilter = (req, res) => {
  const { course_id, username, percentage } = req.params;
  // Fetch course details (assuming there is a 'courses' table)
  const courseQuery =
    "SELECT course_name, start_date, end_date, course_id, sem  FROM courses WHERE id = ?";
  db.query(courseQuery, [course_id], (err, courseResult) => {
    if (err) {
      console.error("Error fetching course details:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (courseResult.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    const courseName = courseResult[0].course_name;

    // Fetch student attendance data (assuming there is an 'attendance' table)
    const attendanceQuery = `
      SELECT students.uid, students.fullname, DATE_FORMAT(attendance.date, '%Y-%m-%d') AS formatted_date, attendance.status
      FROM attendance
      INNER JOIN students ON attendance.student_id = students.id
      WHERE attendance.course_id = ? AND attendance.username = ?`;

    db.query(
      attendanceQuery,
      [course_id, username],
      (err, attendanceResult) => {
        if (err) {
          console.error("Error fetching attendance data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        if (!attendanceResult || attendanceResult.length === 0) {
          // Handle the case where no attendance data is found
          return res.status(404).json({ error: "Attendance data not found" });
        }

        // Fetch student statistics using the second query
        const attendanceQuery2 = `
        SELECT
    students.uid,
    students.fullname,
    COUNT(*) AS total_lectures,
    SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) AS present_lectures,
    SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) / COUNT(*) * 100 AS percentage_attendance
  FROM
    students
  LEFT JOIN
    attendance ON students.id = attendance.student_id
  WHERE
    attendance.course_id = ?
    AND attendance.username = ?
  GROUP BY
    students.uid, students.fullname
  HAVING
    percentage_attendance < ?;`;
        db.query(
          attendanceQuery2,
          [course_id, username, percentage],
          (err, attendanceResult2) => {
            if (err) {
              console.error("Error fetching student statistics:", err);
              return res.status(500).json({ error: "Internal Server Error" });
            }

            // Create a dictionary to group data by uid and name
            const groupedData = {};

            attendanceResult.forEach((row) => {
              const { uid, fullname, formatted_date, status } = row;

              if (!groupedData[uid]) {
                groupedData[uid] = { uid, fullname, data: {} };
              }

              groupedData[uid].data[formatted_date] = status;
            });

            // Extract unique dates from the attendance data
            const uniqueDates = [
              ...new Set(attendanceResult.map((row) => row.formatted_date)),
            ];

            const courseName = courseResult[0].course_name;
            const startDate = courseResult[0].start_date;
            const endDate = courseResult[0].end_date;
            const semester = courseResult[0].sem;
            const courseCode = courseResult[0].course_id;

            // Create a workbook and worksheet
            const workbook = XLSX.utils.book_new();
            const worksheetData = [];

            // Add custom headers and information to the worksheet
            worksheetData.push(["BIRLA VISHVAKARMA MAHAVIDHYALAYA"]); // Add your custom headers here
            worksheetData.push(["INFORMATION TECHNOLOGY"]);
            worksheetData.push([
              "Student Attendance Sheet(AY: " +
                startDate.getFullYear() +
                "-" +
                endDate.getFullYear() +
                ", Sem-" +
                semester +
                ")",
            ]);
            worksheetData.push([
              "Subject Name and Code: " + courseName + "(" + courseCode + ")",
            ]);

            const headers = [
              "UID",
              "Name",
              ...uniqueDates,
              "Total Lectures",
              "Present Lectures",
              "Percentage",
            ];
            worksheetData.push(headers);
            const merges = [
              { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }, // Merge cells for the first row
              { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }, // Merge cells for the second row
              { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } }, // Merge cells for the third row
              { s: { r: 3, c: 0 }, e: { r: 3, c: headers.length - 1 } }, // Merge cells for the fourth row
            ];

            attendanceResult2.forEach((row) => {
              const {
                uid,
                fullname,
                total_lectures,
                present_lectures,
                percentage_attendance,
              } = row;
              const dataRow = groupedData[uid];

              if (dataRow) {
                const rowData = [
                  uid,
                  fullname,
                  ...uniqueDates.map((date) => dataRow.data[date] || ""), // Display each date only once
                  total_lectures,
                  present_lectures,
                  percentage_attendance,
                ];
                worksheetData.push(rowData);
              }
            });

            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

            // Set column widths
            const colWidths = [
              { wch: 10 },
              { wch: 20 },
              ...Array(headers.length - 2).fill({ wch: 12 }), // Adjust width for date columns
              { wch: 15 },
              { wch: 15 },
              { wch: 15 },
            ];
            worksheet["!cols"] = colWidths;
            // Add merges to the worksheet
            worksheet["!merges"] = merges;

            // Add worksheet to the workbook
            XLSX.utils.book_append_sheet(
              workbook,
              worksheet,
              "Attendance Report"
            );

            // Generate a unique filename for the report
            const fileName = `Attendance_Report_${course_id}_${username}.xlsx`;

            // Send the Excel file as a response
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="${fileName}"`
            );
            const excelBuffer = XLSX.write(workbook, {
              bookType: "xlsx",
              type: "buffer",
            });
            res.send(excelBuffer);
          }
        );
      }
    );
  });
};

//delete attendance by date with course id and username
exports.deleteAttendanceByDate = (req, res) => {
  const { course_id, username, date } = req.params;
  // console.log(req.params);
  const query = "DELETE FROM attendance WHERE course_id = ? AND username = ? AND date = ?";
  db.query(query, [course_id, username, date], (err, results) => {
    if (err) {
      console.error("Error fetching attendance:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      // console.log(results);
      res.json(results);
    }
  });
};