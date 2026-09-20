const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../models/db");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are all required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  const db = readDB();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDB(db);

  req.session.userId = newUser.id;
  res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const db = readDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  req.session.userId = user.id;
  res.json({ id: user.id, name: user.name, email: user.email });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully." });
  });
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in." });
  }
  const db = readDB();
  const user = db.users.find((u) => u.id === req.session.userId);
  if (!user) {
    return res.status(401).json({ error: "Not logged in." });
  }
  res.json({ id: user.id, name: user.name, email: user.email });
});

module.exports = router;
