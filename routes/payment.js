const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const verifyToken = require("../middlewares/verifyToken"); // Your auth middleware
const Order = require("../models/Order"); // Your Order model
const Product = require("../models/Products");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,     // Store your Razorpay keys in .env
  key_secret: process.env.RAZORPAY_SECRET,
});

// Route: Create Razorpay order
router.post("/razorpay/order", verifyToken, async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ message: "Amount and currency required" });
    }

    const options = {
      amount, // in smallest currency unit, e.g., paise
      currency,
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) return res.status(500).json({ message: "Unable to create order" });

    res.json(order);
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ message: "Server error creating Razorpay order" });
  }
});

// Route: Verify Razorpay payment and save order
router.post("/razorpay/verify", verifyToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment details are missing" });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }

    // Calculate totalAmount from items
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );



    for (const item of items) {
  const foundProduct = await Product.findById(item.product);

  if (!foundProduct) continue;

  if (foundProduct.stock < item.quantity) {
    return res.status(400).json({
      msg: `Insufficient stock for ${foundProduct.name}`,
    });
  }

  foundProduct.stock -= item.quantity;
  await foundProduct.save();
}




    // Save order to DB
    const order = new Order({
      user: req.user.id,
      items,
      shippingAddress,
      totalAmount,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpay: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      },
    });

    await order.save();

    res.json({ message: "Payment verified and order placed!", order });
  } catch (error) {
    console.error("Razorpay payment verification error:", error);
    res.status(500).json({ message: "Server error verifying payment" });
  }
});

module.exports = router;
