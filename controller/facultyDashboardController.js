const db = require("../db");

//find today course
exports.todayCourse = async (req, res) => {
  try {
    const { username } = req.params;
    // console.log("username", username);

    // Get today's day (e.g., 'Monday', 'Tuesday', etc.)
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    // console.log("today", today);

    // Query the database to get the selected time for the current day
    const query = `
    SELECT 
      batch as Batch,
      classType as ClassType,
      course_name AS TodayLecture,
      JSON_UNQUOTE(JSON_EXTRACT(selectedTimes, '$.${today}')) AS TodayTime 
    FROM 
      courses 
    WHERE 
      username = ? 
      AND JSON_EXTRACT(selectedTimes, '$.${today}') IS NOT NULL
  `;

    db.query(query, [username], (err, results) => {
      if (err) {
        console.error("Error fetching today selected time:", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.json(results);
      }
    });
  } catch (error) {
    console.error("Error checking today selected time:", error);
    res.status(500).json({ error: "An error occurred." });
  }
};
