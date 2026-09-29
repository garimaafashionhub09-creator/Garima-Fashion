const express = require("express");
const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");
const requireAdmin = require("../middleware/adminAuth");
const requireCustomer = require("../middleware/customerAuth");

const router = express.Router();

function generateTrackingNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `GFH${datePart}-${randomPart}`;
}

function normalizeShippingAddress(address = {}) {
  return {
    fullName: address.fullName || "",
    phone: address.phone || "",
    address: address.address || address.street || "",
    city: address.city || "",
    state: address.state || "",
    pincode: address.postalCode || address.pincode || "",
    country: address.country || "India",
  };
}

router.get("/mine", requireCustomer, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name slug images price category")
      .lean();

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email phone")
      .populate("items.product", "name slug images price category")
      .lean();

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/", requireCustomer, async (req, res) => {
  try {
    const { items = [], totalAmount, shippingAddress = {}, paymentStatus = "pending", orderStatus = "pending" } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must include at least one item.",
      });
    }

    if (!totalAmount || Number(totalAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order total is required.",
      });
    }

    let trackingNumber = generateTrackingNumber();
    let tries = 0;
    while (tries < 5) {
      const exists = await Order.findOne({ trackingNumber });
      if (!exists) break;
      trackingNumber = generateTrackingNumber();
      tries += 1;
    }

    const mappedItems = [];
    const productsToUpdate = [];

    for (const item of items) {
      const productId = item.productId || item.product || item._id;
      const product = await Product.findById(productId).catch(() => null);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productId}`,
        });
      }

      const quantity = Number(item.quantity || 1);
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available for ${product.name}.`,
        });
      }

      mappedItems.push({
        product: product._id,
        name: item.name || product.name || "Garimaa Fashion Product",
        price: Number(item.price || product.price || 0),
        quantity,
        size: item.size || "",
        color: item.color || "",
        image: item.image || product.images?.[0] || "",
      });

      productsToUpdate.push({
        product,
        quantity,
      });
    }

    const normalizedAddress = normalizeShippingAddress(shippingAddress);
    const order = await Order.create({
      user: req.user._id,
      items: mappedItems,
      totalAmount: Number(totalAmount),
      shippingAddress: normalizedAddress,
      paymentStatus,
      orderStatus,
      trackingNumber,
    });

    await Promise.all(
      productsToUpdate.map(async ({ product, quantity }) => {
        product.stock = Math.max(0, product.stock - quantity);
        await product.save();
      })
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully.",
      order,
      trackingNumber,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully.",
      orderId: req.params.id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber } = req.body || {};
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully.",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
