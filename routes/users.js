const router = require("express").Router();
const db = require("../db/index");
const bcrypt = require("bcrypt");

router.get("/", async (req, res) => {
  const users = await db.query(
    "SELECT id, username, first_name, last_name, created_at, modified_at FROM users"
  );
  res.json(users.rows);
});

router.get("/:id", async (req, res) => {
  const user = await db.query(
    "SELECT id, username, first_name, last_name, created_at, modified_at FROM users WHERE id = $1",
    [req.params.id]
  );
  res.json(user.rows[0]);
});

router.put("/:id", async (req, res) => {
  const { username, password, first_name, last_name } = req.body;
  if (username !== undefined) {
    const newUsername = username;
    const duplicateUsername = await db.query(
      "SELECT username FROM users WHERE username = $1 AND id <> $2",
      [newUsername, req.params.id]
    );
    if (duplicateUsername.rows.length > 0) {
      return res.status(400).json({ message: "That username is taken." });
    }
    await db.query(
      "UPDATE users SET username = $1, modified_at = now() WHERE id = $2 AND username <> $1",
      [newUsername, req.params.id]
    );
  }
  if (first_name !== undefined) {
    const newFirstName = first_name;
    await db.query(
      "UPDATE users SET first_name = $1, modified_at = now()  WHERE id = $2 AND first_name <> $1",
      [newFirstName, req.params.id]
    );
  }
  if (last_name !== undefined) {
    const newLastName = last_name;
    await db.query(
      "UPDATE users SET last_name = $1, modified_at = now()  WHERE id = $2 AND last_name <> $1",
      [newLastName, req.params.id]
    );
  }
  if (password !== undefined) {
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(password, salt);
    await db.query(
      "UPDATE users SET password = $1, modified_at = now()  WHERE id = $2",
      [newHashedPassword, req.params.id]
    );
  }
  const user = await db.query("SELECT * FROM users WHERE id = $1", [
    req.params.id,
  ]);
  res.json(user.rows[0]);
});

module.exports = router;
