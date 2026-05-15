const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));


// ================= MULTER SETUP =================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }

});

const upload = multer({ storage });


// ================= REGISTER =================

app.post("/register", (req, res) => {

  const { name, roll, email, password } = req.body;

  const sql = `
    INSERT INTO users (name, roll, email, password, role)
    VALUES (?, ?, ?, ?, 'student')
  `;

  db.query(sql, [name, roll, email, password], (err) => {

    if (err) {
      console.log(err);
      return res.status(400).send("Email already exists");
    }

    res.send("Registered Successfully");
  });

});


// ================= LOGIN =================

app.post("/login", (req, res) => {

  const { email, password } = req.body;

  const sql = `
    SELECT * FROM users
    WHERE email=?
  `;

  db.query(sql, [email], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).send("Server Error");
    }

    if (result.length === 0) {
      return res.json(null);
    }

    // Simple password check (JWT/Bcrypt later)
    if (result[0].password !== password) {
      return res.json(null);
    }

    res.json(result[0]);

  });

});


// ================= ADD COMPLAINT =================

app.post("/add-complaint", upload.single("photo"), (req, res) => {

  const {
    user_id,
    category,
    hostel,
    room,
    priority,
    contact,
    message
  } = req.body;

  const photo = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO complaints
    (user_id, category, hostel, room_no, priority_level, contact_no, message, photo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    user_id,
    category,
    hostel,
    room,
    priority,
    contact,
    message,
    photo
  ], (err) => {

    if (err) {
      console.log(err);
      return res.status(500).send("Database Error");
    }

    res.send("Complaint Submitted Successfully");

  });

});


// ================= GET COMPLAINTS (ADMIN) =================

app.get("/complaints", (req, res) => {

  const role = req.headers.role;

  if (role !== "admin") {
    return res.status(403).send("Unauthorized");
  }

  const sql = `
    SELECT 
      complaints.*,
      users.name,
      users.roll
    FROM complaints
    JOIN users ON complaints.user_id = users.id
    ORDER BY complaints.date DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).send("DB Error");
    }

    res.json(result);

  });

});


// ================= UPDATE STATUS =================

app.put("/update/:id", (req, res) => {

  const { status } = req.body;
  const id = req.params.id;

  db.query(
    "UPDATE complaints SET status=? WHERE id=?",
    [status, id],
    (err) => {

      if (err) {
        console.log(err);
        return res.status(500).send("Update Failed");
      }

      res.send("Status Updated");

    }
  );

});


// ================= START SERVER =================

app.listen(PORT, () => {
  console.log("Server running at http://localhost:3000");
});
