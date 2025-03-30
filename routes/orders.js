const router = require("express").Router();
const db = require("../db/index");

router.get("/", async (req, res) => {
  const { user_id } = req.body;
  if (user_id === undefined) {
    return res.json({ message: "User Id not provided." });
  }
  const orders = await db.query(
    "SELECT * FROM order_details WHERE user_id = $1",
    [user_id]
  );
  let result = {};
  for (const order of orders.rows) {
    result.order = order;
    const items = await db.query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [order.id]
    );
    result.order.items = items.rows;
  }
  res.json(result);
});

router.get("/:id", async (req, res) => {
  const order = await db.query("SELECT * FROM order_details WHERE id = $1", [
    req.params.id,
  ]);
  if (order === undefined) {
    return res.json({ message: "Order with that Id does not exist." });
  }
  const items = await db.query(
    "SELECT * FROM order_items WHERE order_id = $1",
    [req.params.id]
  );
  let result = {};
  result.order = order.rows[0];
  result.order.items = items.rows;
  res.json(result);
});

module.exports = router;
