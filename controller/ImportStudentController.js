// Import required modules
// const fileUpload = require('express-fileupload');
const mysql = require('mysql2/promise');
const ExcelJS = require('exceljs');

// // Configure Express to use middleware for file uploads
// app.use(fileUpload());

// Database configuration
const db = mysql.createPool({
  host: 'localhost',
   port: 3308, // If 3308 is the correct port
  user: 'root',
  password: '',
  database: 'attendance_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


// Define a POST route to upload Excel files
exports.ImportStudentExcel = async (req, res) => {
  try {
    // Check if a file was uploaded
    // if (!req.files || !req.files.file) {
    //   return res.status(400).json({ error: 'No file uploaded.' });
    // }

    // Get the uploaded file
    const excelFile = req.files.file;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(excelFile.data);

    // Get the first worksheet assuming data is in the first sheet
    const worksheet = workbook.getWorksheet(1);

    // Define an array to store parsed data
    const data = [];

    // Iterate over rows and columns to parse data
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber !== 1) {
        const [uid, fullname, department, gender, contactNumber, emailid, currentSem] = row.values;
        data.push([uid, fullname, department, gender, contactNumber, emailid, currentSem]);
      }
    });

    // Insert data into the database (replace 'students' with your table name)
    const query =
      'INSERT INTO students (uid, fullname, department, gender, contact_number, emailid, current_sem) VALUES ?';

    await req.db.query(query, [data]);

    res.status(200).json({ message: 'Data uploaded successfully.' });
  } catch (error) {
    console.error('Error uploading data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// // Start the Express server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
