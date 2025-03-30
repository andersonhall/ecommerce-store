const router = require("express").Router();
const db = require("../db/index");

// Get cart by ID
router.get("/:id", async (req, res) => {
  const cart = await db.query("SELECT * FROM cart WHERE id = $1", [
    req.params.id,
  ]);
  res.json({ cart: cart.rows[0] });
});

// Create cart
router.post("/", async (req, res) => {
  const cart = await db.query(
    "INSERT INTO cart (user_id, created_at) VALUES ($1, now()) RETURNING *",
    [req.body.user_id]
  );
  res.json(cart.rows[0]);
});

// Add item to cart
router.post("/:id", async (req, res) => {
  if (!req.body.product_id) {
    return res.json({ message: "No item provided." });
  }
  const itemToAdd = await db.query("SELECT * FROM product WHERE id = $1", [
    req.body.product_id,
  ]);
  if (itemToAdd.rows.length === 0) {
    return res.json({ message: "No item with that Id exists." });
  }
  const itemInCart = await db.query(
    "SELECT * FROM cart_item WHERE product_id = $1 AND cart_id = $2",
    [req.body.product_id, req.params.id]
  );
  let addedItem;
  if (itemInCart.rows.length === 0) {
    addedItem = await db.query(
      "INSERT INTO cart_item (cart_id, product_id, quantity, created_at) VALUES ($1, $2, $3, now()) RETURNING *",
      [req.params.id, req.body.product_id, 1]
    );
  } else {
    addedItem = await db.query(
      "UPDATE cart_item SET quantity = cart_item.quantity + 1, modified_at = now() WHERE product_id = $1 AND cart_id = $2 RETURNING *",
      [req.body.product_id, req.params.id]
    );
  }
  const price = itemToAdd.rows[0].price;
  await db.query(
    "UPDATE cart SET total = cart.total + $1, modified_at = now() WHERE id = $2",
    [price, req.params.id]
  );
  res.json({ message: "Item added to cart.", item: addedItem.rows[0] });
});

// Remove item from cart
router.put("/:id", async (req, res) => {
  const productToRemove = req.body.product_id;
  if (productToRemove === undefined) {
    return res.json({ message: "No product id provided." });
  }
  const product = await db.query(
    "SELECT * FROM cart_item WHERE product_id = $1 AND cart_id = $2",
    [productToRemove, req.params.id]
  );
  if (product.rows.length === 0) {
    return res.json({
      message: "A product with that Id does not exist in the cart.",
    });
  }
  const updatedCart = await db.query(
    "UPDATE cart_item SET quantity = cart_item.quantity - 1, modified_at = now() WHERE cart_id = $1 AND product_id = $2 RETURNING *",
    [req.params.id, productToRemove]
  );
  const price = await db.query("SELECT price FROM product WHERE id = $1", [
    productToRemove,
  ]);
  await db.query("DELETE FROM cart_item WHERE quantity = 0");
  await db.query("UPDATE cart SET total = cart.total - $1 WHERE id = $2", [
    price.rows[0].price,
    req.params.id,
  ]);
  res.json({ message: "Item removed from cart.", cart: updatedCart.rows });
});

// Delete cart
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

// Checkout
router.post("/:id/checkout", async (req, res) => {
  // Find the cart and it's items
  const cart = await db.query("SELECT * FROM cart WHERE id = $1", [
    req.params.id,
  ]);
  if (cart.rows.length === 0) {
    return res.json({ message: "Cart does not exist." });
  }
  const cartItems = await db.query(
    "SELECT * FROM cart_item WHERE cart_id = $1",
    [req.params.id]
  );
  // TODO: Process Payment
  // Create order details and order items
  const { user_id, total } = cart.rows[0];
  const orderDetails = await db.query(
    "INSERT INTO order_details (user_id, total, payment_id, created_at) VALUES ($1, $2, $3, now()) RETURNING *",
    [user_id, total, 1 /*Placeholder for now*/]
  );
  const order_id = orderDetails.rows[0].id;
  for (const cartItem of cartItems.rows) {
    const { product_id, quantity } = cartItem;
    await db.query(
      "INSERT INTO order_items (order_id, product_id, quantity, created_at) VALUES ($1, $2, $3, now()) RETURNING *",
      [order_id, product_id, quantity]
    );
  }
  res.json({ cart: cart.rows[0], items: cartItems.rows });
});

module.exports = router;
