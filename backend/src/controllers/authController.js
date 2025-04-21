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
  const { username, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashed]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error("Signup error: ", error.message);
    res.status(400).json({ error: "User already exists or invalid input" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    const user = result.rows[0];
    if (!user)
      return res.status(400).json({ error: "Invalid username or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ error: "Invalid username or password" });

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
