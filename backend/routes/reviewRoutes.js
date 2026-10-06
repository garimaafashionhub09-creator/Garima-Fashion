const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams gives access to :productId
const Review = require("../models/Review");
const Product = require("../models/Product");
const requireCustomer = require("../middleware/customerAuth");
const requireAdmin = require("../middleware/adminAuth");

// ─────────────────────────────────────────────
// Helper: recalculate product rating + reviewCount
// ─────────────────────────────────────────────
async function syncProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const count = stats.length > 0 ? stats[0].count : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: avg,
    reviewCount: count,
  });
}

// ─────────────────────────────────────────────
// GET /api/products/:productId/reviews
// Public — anyone can read reviews
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load reviews." });
  }
});

// ─────────────────────────────────────────────
// POST /api/products/:productId/reviews
// Customer only — must be logged in
// ─────────────────────────────────────────────
router.post("/", requireCustomer, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }
    if (!comment || comment.trim().length < 3) {
      return res.status(400).json({ success: false, message: "Please write a review comment." });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // Check duplicate
    const existing = await Review.findOne({
      product: req.params.productId,
      user: req.user._id,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product. Edit your existing review instead.",
      });
    }

    const review = await Review.create({
      product: req.params.productId,
      user: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment: comment.trim(),
    });

    await syncProductRating(product._id);

    res.status(201).json({ success: true, review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }
    res.status(500).json({ success: false, message: "Failed to submit review." });
  }
});

// ─────────────────────────────────────────────
// PUT /api/products/:productId/reviews/:reviewId
// Customer only — can only edit their OWN review
// ─────────────────────────────────────────────
router.put("/:reviewId", requireCustomer, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    // Only the author can edit
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only edit your own review." });
    }

    const { rating, comment } = req.body;

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
      }
      review.rating = Number(rating);
    }

    if (comment !== undefined) {
      if (comment.trim().length < 3) {
        return res.status(400).json({ success: false, message: "Please write a review comment." });
      }
      review.comment = comment.trim();
    }

    await review.save();
    await syncProductRating(review.product);

    res.status(200).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update review." });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/products/:productId/reviews/:reviewId
// Admin can delete any review
// Customer can delete their OWN review
// ─────────────────────────────────────────────
router.delete("/:reviewId", async (req, res) => {
  try {
    // Try admin token first
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const jwt = require("jsonwebtoken");
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }

    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    const isAdmin = decoded.role === "admin";
    const isOwner = decoded.id && review.user.toString() === decoded.id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Only the review author or an admin can delete this review.",
      });
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    await syncProductRating(review.product);

    res.status(200).json({ success: true, message: "Review deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete review." });
  }
});

module.exports = router;
