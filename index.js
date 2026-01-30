const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const db = require("./db");

const app = express();
const port = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

/* ========== MULTER CONFIG ========== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
/* ================================== */

/* ========== ROUTES ========== */

// Landing
app.get("/", (req, res) => {
  res.render("landing.ejs");
});

/* ===== CUSTOMER AUTH ===== */

// Signup page
app.get("/signup", (req, res) => {
  res.render("signup.ejs", { error: null });
});

// Signup POST
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password],
    err => {
      if (err) {
        return res.render("signup.ejs", { error: "Email already exists" });
      }
      res.redirect("/login");
    }
  );
});

// Login page
app.get("/login", (req, res) => {
  res.render("login.ejs", { error: null });
});

// Login POST
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.render("login.ejs", { error: "Server error" });
      }

      if (rows.length === 0) {
        return res.render("login.ejs", { error: "Invalid credentials" });
      }

      res.redirect("/customer");
    }
  );
});



/* ===== CUSTOMER MENU ===== */

app.get("/customer", (req, res) => {
  db.query("SELECT * FROM food", (err, foods) => {
    res.render("customer-menu.ejs", { foods });
  });
});

/* ===== ADMIN AUTH ===== */

app.get("/admin/login", (req, res) => {
  res.render("admin-login.ejs", { error: null });
});
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM admin WHERE username=? AND password=?",
    [username, password],
    (err, rows) => {
      if(err) {
        console.error(err);
        return res.json({ success: false, message: 'Server error' });
      }

      if(rows.length === 0) {
        return res.json({ success: false, message: 'Invalid username or password' });
      }

      // login success
      res.json({ success: true });
    }
  );
});


/* ===== ADMIN DASHBOARD ===== */

app.get("/admin/dashboard", (req, res) => {
  db.query("SELECT * FROM food", (err, foods) => {
    res.render("admin-dashboard.ejs", { foods });
  });
});

// Add food
app.get("/admin/add", (req, res) => {
  res.render("add-food.ejs");
});

app.post("/admin/add", upload.single("foodImage"), (req, res) => {
  const { name, price } = req.body;
  const image = req.file ? req.file.filename : null;
  db.query(
    "INSERT INTO food (name, price, image) VALUES (?, ?, ?)",
    [name, price, image],
    () => res.redirect("/admin/dashboard")
  );
});

// Delete food + image
app.get("/admin/delete/:id", (req, res) => {
  db.query(
    "SELECT image FROM food WHERE id=?",
    [req.params.id],
    (err, rows) => {

      // ✅ ADD THIS (SAFETY CHECK)
      if (err || rows.length === 0) {
        return res.redirect("/admin/dashboard");
      }

      const imgPath = path.join(__dirname, "public/uploads", rows[0].image);
      if (rows[0].image && fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }

      db.query(
        "DELETE FROM food WHERE id=?",
        [req.params.id],
        () => res.redirect("/admin/dashboard")
      );
    }
  );
});
// GET route to show edit food page
app.get("/admin/edit/:id", (req, res) => {
  const id = req.params.id;

  db.query("SELECT * FROM food WHERE id=?", [id], (err, rows) => {
    if (err || rows.length === 0) {
      console.error(err);
      return res.redirect("/admin/dashboard"); // redirect if not found
    }
    res.render("edit-food.ejs", { food: rows[0] });
  });
});

app.post("/admin/edit/:id", (req, res) => {
  const id = req.params.id;
  const { name, price } = req.body;

  db.query(
    "UPDATE food SET name=?, price=? WHERE id=?",
    [name, price, id],
    (err) => {
      if (err) {
        console.error(err);
      }
      res.redirect("/admin/dashboard");
    }
  );
});


/* ===== SERVER ===== */
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
