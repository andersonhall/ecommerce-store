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

router.post("/:id", async (req, res) => {
  if (!req.body.item_id) {
    return res.json({ message: "No item provided." });
  }
  const itemToAdd = await db.query("SELECT * FROM product WHERE id = $1", [
    req.body.item_id,
  ]);
  if (itemToAdd.rows.length === 0) {
    return res.json({ message: "No item with that Id exists." });
  }
  const itemInCart = await db.query(
    "SELECT * FROM cart_item WHERE product_id = $1",
    [req.body.item_id]
  );
  let addedItem;
  if (itemInCart.rows.length === 0) {
    addedItem = await db.query(
      "INSERT INTO cart_item (cart_id, product_id, quantity, created_at) VALUES ($1, $2, $3, now()) RETURNING *",
      [req.params.id, req.body.item_id, 1]
    );
  } else {
    addedItem = await db.query(
      "UPDATE cart_item SET quantity = cart_item.quantity + 1, modified_at = now() WHERE product_id = $1 RETURNING *",
      [req.body.item_id]
    );
  }
  await db.query(
    "UPDATE cart SET total = cart.total + $1, modified_at = now() WHERE id = $2",
    [itemToAdd.rows[0].price, req.params.id]
  );
  res.json({ message: "Item added to cart.", item: addedItem.rows[0] });
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
