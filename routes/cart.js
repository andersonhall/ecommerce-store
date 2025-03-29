const router = require("express").Router();
const db = require("../db/index");

router.get("/:id", async (req, res) => {
  const cart = await db.query("SELECT * FROM cart WHERE id = $1", [
    req.params.id,
  ]);
  res.json({ cart: cart.rows[0] });
});

router.post("/", async (req, res) => {
  const cart = await db.query(
    "INSERT INTO cart (user_id, created_at) VALUES ($1, now()) RETURNING *",
    [req.body.user_id]
  );
  res.json(cart.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const cartToDelete = await db.query("SELECT * FROM cart WHERE id = $1", [
    req.params.id,
  ]);
  if (cartToDelete.rows.length === 0) {
    return res.json({ message: "Cart with that Id does not exist." });
  }
  await db.query("DELETE FROM cart WHERE id = $1", [req.params.id]);
  res.json({ message: "Cart deleted." });
});

module.exports = router;
