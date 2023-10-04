// Import necessary modules
const db = require('../db'); // Assuming you have a database connection module

// Controller function for faculty registration
exports.registerFaculty = (req, res) => {
    const { fullname, email, contact_number, department, username, password } = req.body;

    // Check if any required fields are null or empty
    if (!fullname || !email || !contact_number || !department || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    // Proceed with inserting data into the database
    const insertQuery = 'INSERT INTO faculty (fullname, email, contact_number, department, username, password) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(insertQuery, [fullname, email, contact_number, department, username, password], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      return res.status(201).json({ message: 'Faculty registered successfully' });
    });
};

// Controller function for faculty login
exports.loginFaculty = (req, res) => {
    const { username, password } = req.body;

    // Check if any required fields are null or empty
    if (!username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    // Proceed with inserting data into the database
    const selectQuery = 'SELECT * FROM faculty WHERE username = ? AND password = ?';
    db.execute(selectQuery, [username, password], (err, result) => {
      if (err) {
        console.error('Error fetching data:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (result.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      // console.log(result);
      return res.status(200).json({ message: 'Login successful' });
    });
};

exports.getFacultyById = (req, res) => {
  const { username, password } = req.params;
  const query = "SELECT * FROM faculty WHERE username = ? AND password = ?";
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("Error fetching faculty:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(results);
    }
  });
}

//update password
exports.updatePassword = (req, res) => {
  const { id, password } = req.body;
  const query = "UPDATE faculty SET password = ? WHERE fid = ?";
  db.query(query, [password, id], (err, results) => {
    if (err) {
      console.error("Error updating password:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(results);
    }
  });
}