const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../models/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/orders  { shippingAddress }  -> checkout, requires login
router.post("/", requireAuth, (req, res) => {
  const { shippingAddress } = req.body;
  if (!shippingAddress || !shippingAddress.trim()) {
    return res.status(400).json({ error: "Shipping address is required." });
  }

  const cart = req.session.cart || [];
  if (cart.length === 0) {
    return res.status(400).json({ error: "Your cart is empty." });
  }

  const db = readDB();

  // Validate stock and build order items
  const orderItems = [];
  for (const item of cart) {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Product ${item.productId} no longer exists.` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ error: `Not enough stock for "${product.name}".` });
    }
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal: product.price * item.quantity,
    });
  }

  // Deduct stock
  orderItems.forEach((oi) => {
    const product = db.products.find((p) => p.id === oi.productId);
    product.stock -= oi.quantity;
  });

  const total = orderItems.reduce((sum, i) => sum + i.subtotal, 0);

  const newOrder = {
    id: uuidv4(),
    userId: req.session.userId,
    items: orderItems,
    total,
    shippingAddress,
    status: "Processing",
    createdAt: new Date().toISOString(),
  };

  db.orders.push(newOrder);
  writeDB(db);

  req.session.cart = [];

  res.status(201).json(newOrder);
});

// GET /api/orders  -> current user's order history
router.get("/", requireAuth, (req, res) => {
  const db = readDB();
  const myOrders = db.orders
    .filter((o) => o.userId === req.session.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(myOrders);
});

module.exports = router;
