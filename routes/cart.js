const express = require("express");
const { readDB } = require("../models/db");

const router = express.Router();

function getCartWithDetails(req) {
  const db = readDB();
  const cart = req.session.cart || [];
  const items = cart
    .map((item) => {
      const product = db.products.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
      };
    })
    .filter(Boolean);

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);
  return { items, total };
}

// GET /api/cart
router.get("/", (req, res) => {
  res.json(getCartWithDetails(req));
});

// POST /api/cart  { productId, quantity }
router.post("/", (req, res) => {
  const { productId, quantity } = req.body;
  const qty = Math.max(1, parseInt(quantity, 10) || 1);

  const db = readDB();
  const product = db.products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  if (!req.session.cart) req.session.cart = [];
  const existing = req.session.cart.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    req.session.cart.push({ productId, quantity: qty });
  }

  res.status(201).json(getCartWithDetails(req));
});

// PUT /api/cart/:productId  { quantity }
router.put("/:productId", (req, res) => {
  const { quantity } = req.body;
  const qty = parseInt(quantity, 10);

  if (!req.session.cart) req.session.cart = [];
  const item = req.session.cart.find((i) => i.productId === req.params.productId);
  if (!item) {
    return res.status(404).json({ error: "Item not in cart." });
  }

  if (qty <= 0) {
    req.session.cart = req.session.cart.filter((i) => i.productId !== req.params.productId);
  } else {
    item.quantity = qty;
  }

  res.json(getCartWithDetails(req));
});

// DELETE /api/cart/:productId
router.delete("/:productId", (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  req.session.cart = req.session.cart.filter((i) => i.productId !== req.params.productId);
  res.json(getCartWithDetails(req));
});

// DELETE /api/cart
router.delete("/", (req, res) => {
  req.session.cart = [];
  res.json(getCartWithDetails(req));
});

module.exports = router;
