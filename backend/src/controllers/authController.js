import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

console.log(
  "ENV VARS:",
  "DB_USER",
  process.env.DB_USER,
  "DB_PASS",
  process.env.DB_PASS,
  "DB_NAME",
  process.env.DB_NAME,
  "DB_HOST",
  process.env.DB_HOST
);

console.log("DB_PASS type:", typeof process.env.DB_PASS);

export const signup = async (req, res) => {
  console.log("Signup endpoint hit");
  console.log("Request body:", req.body);
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    console.log("Missing required fields:", {
      username: !!username,
      email: !!email,
      password: !!password,
    });
    return res
      .status(400)
      .json({ error: "Username, email and password are required." });
  }

  try {
    console.log("Attempting to hash password...");
    const hashed = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    console.log("Attempting database insert...");
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashed]
    );
    console.log("Database insert successful:", result.rows[0]);
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error("Signup error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      stack: error.stack,
    });
    res.status(400).json({ error: "User already exists or invalid input" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and email are required." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    const user = result.rows[0];
    if (!user)
      return res.status(401).json({ error: "Invalid username or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Invalid username or password" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/auth/me
export const getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [userId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Server error." });
  }
};

// PUT /api/auth/profile
export const editProfile = async (req, res) => {
  const userId = req.user.id;
  const { username, password } = req.body;

  if (!username && !password) {
    return res.status(400).json({ error: "Provide username and/or password." });
  }

  try {
    if (username) {
      const { rowCount } = await pool.query(
        "SELECT 1 FROM users WHERE username = $1 AND id <> $2",
        [username, userId]
      );
      if (rowCount) {
        return res.status(400).json({ error: "Username already in use." });
      }
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (username) {
      fields.push(`username = $${idx++}`);
      values.push(username);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push(`password = $${idx++}`);
      values.push(hashed);
    }

    values.push(userId);
    const query = `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING id, username, email
    `;
    const result = await pool.query(query, values);
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Edit profile error:", err);
    res.status(500).json({ error: "Server error." });
  }
};
