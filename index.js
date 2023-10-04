// app.js

const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Configure middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); // Add this line to parse JSON request bodies

// Import the database configuration
require('./db');

// Import controllers
const studentsController = require('./controller/studentsController');
const attendanceController = require('./controller/attendanceController')
const facultyController = require('./controller/facultyController');
const courseController = require('./controller/courseController');
// const ImportStudentController = require('./controller/ImportStudentController');
const facultyDashboardController = require('./controller/facultyDashboardController');
const extraAttendanceController = require('./controller/extraAttendanceController');

// Define routes using controllers
app.get('/students', studentsController.getAllStudents);//get all students
app.get('/students/:course_id/:username', studentsController.getStudentByCourseId);//get students by course id and username
app.delete('/students/delete/:id', studentsController.deleteStudent);//delete student by id
app.post('/students', studentsController.createStudent);
app.get('/students/:id', studentsController.getStudentById);
// app.get('/students/Add_Excel_Template', studentsController.addStudentToCourseTemplate);//add student to course template
// app.post('/students/ImportStudent', ImportStudentController.ImportStudentExcel);//add student to course template
app.post('/students/ImportStudent', studentsController.ImportStudentExcel);//add student to course template

app.post('/attendance', attendanceController.markAttendance);
app.get('/attendance/:date/:course_id/:username', attendanceController.getAttendance);
app.get('/attendance-report/:course_id/:username', attendanceController.generateAttendanceReport);//full semester attendance report
app.get('/attendance-report/:course_id/:username/:selectedMonth', attendanceController.generateMonthlyAttendanceReport);//attendance report for a particular month
app.get('/percentage-attendance/:course_id/:date/:username', attendanceController.getAttendancePercentage);//get attendance percentage for a particular date
app.get('/percentage-attendance/:course_id/:username', attendanceController.getStudentAttendance);//get attendance percentage for all dates
app.put('/update-attendance-toggle/:currentDate/:username/:course_id/:studentUID', attendanceController.updateStudentAttendance);
app.get('/percentage-attendance-filter/:course_id/:username/:percentage', attendanceController.getAttendanceByPercentageFilter);//get attendance percentage for a particular date
app.delete('/attendance/delete/:course_id/:date/:username', attendanceController.deleteAttendanceByDate);

app.post('/extra-attendance', extraAttendanceController.markExtraAttendance);
app.get('/extra-attendance/:date/:course_id/:username', extraAttendanceController.getExtraAttendance);

app.post('/faculty', facultyController.registerFaculty);
app.post('/login', facultyController.loginFaculty);
app.get('/faculty/:username/:password', facultyController.getFacultyById);
app.put('/faculty/update-password', facultyController.updatePassword);

app.post('/courses', courseController.createCourse);
app.get('/courses/:username', courseController.viewCourse);
// app.put('/courses/update-weekdays', courseController.updateCourse);
app.put('/courses/update/:id', courseController.editCourse);
app.get('/courses/edit/:id', courseController.viewCourseById);
app.delete('/courses/delete/:id', courseController.deleteCourse);

//faculty-dashboard
app.get('/today-lecture/:username', facultyDashboardController.todayCourse);

// Define more routes for other features using similar controller patterns

// Start the server
const PORT = process.env.PORT || 3000;
const localhost =  '192.168.29.180';
app.listen(PORT, () => {
  console.log(`Server is running on port https://localhost:${PORT}`);
});
