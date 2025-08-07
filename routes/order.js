const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Products");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();
const transporter = require('../config/transporter')
// Place an order
router.post("/", verifyToken, async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ msg: "Cart is empty" });
    }

    const order = new Order({
      user: req.user.id,
      items,
      shippingAddress,
      totalAmount,
    });

    await order.save();


    // deduction of stock

    for (const item of items) {
  const foundProduct = await Product.findById(item.product);

  if (!foundProduct) {
    console.warn(`Product not found in DB for ID: ${item.product}`);
    continue;
  }

  if (foundProduct.stock < item.quantity) {
    return res.status(400).json({
      msg: `Insufficient stock for ${foundProduct.name}. Only ${foundProduct.stock} left.`,
    });
  }

  foundProduct.stock -= item.quantity;
  await foundProduct.save();
}



    const populatedOrder = await Order.findById(order._id).populate("items.product", "name price image");


    
    // Send confirmation email
    const userEmail = req.user.email;   // assume your verifyToken middleware populates user.email
    console.log("User email:", req.user.email);


const mailOptions = {
  from: process.env.MAIL_USER,
  to: userEmail,
  subject: "Your BSCustoms Order Confirmation",
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; border: 1px solid #e2e2e2; border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <div style="background-color: #004aad; color: #fff; padding: 20px; text-align: center;">
        <img src="https://res.cloudinary.com/dlb1wp9az/image/upload/v1747627151/bscustoms_lwezqr.png" alt="BSCustoms Logo" style="height: 100px;"/>

        <p style="margin: 5px 0 0; font-size: 14px;">Order Confirmation</p>
      </div>

      <!-- Body -->
      <div style="padding: 20px;">
        <p>Hi,</p>
        <p>Thank you for shopping with <strong>BSCustoms</strong>! Your order has been received and is currently <span style="color: #e67e22; font-weight: bold;">PENDING</span> confirmation by our team.</p>

        <h2 style="font-size: 18px; border-bottom: 1px solid #e2e2e2; padding-bottom: 5px;">Order Details</h2>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Placed on:</strong> ${new Date(order.placedAt).toLocaleString()}</p>

        <h3 style="margin-top: 20px; font-size: 16px;">Shipping Address</h3>
        <p>
          ${shippingAddress.city}, ${shippingAddress.state}<br/>
          ${shippingAddress.country} - ${shippingAddress.pincode}<br/>
          Phone: ${shippingAddress.phoneNumber}
        </p>

        <h3 style="margin-top: 20px; font-size: 16px;">Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; border-bottom: 1px solid #ccc; padding: 8px;">Product</th>
              <th style="text-align: center; border-bottom: 1px solid #ccc; padding: 8px;">Qty</th>
              <th style="text-align: right; border-bottom: 1px solid #ccc; padding: 8px;">Price</th>
              <th style="text-align: right; border-bottom: 1px solid #ccc; padding: 8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${populatedOrder.items.map(i => `
              <tr>
                <td style="padding: 8px 0;">${i.product.name}</td>
                <td style="text-align: center;">${i.quantity}</td>
                <td style="text-align: right;">₹${i.price}</td>
                <td style="text-align: right;">₹${i.price * i.quantity}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <p style="text-align: right; margin-top: 15px; font-size: 16px;">
          <strong>Order Total: ₹${order.totalAmount}</strong>
        </p>

        <p style="margin-top: 30px;">We’ll send you another email once your order has been confirmed and shipped. In the meantime, if you have any questions, feel free to reply to this email or contact our support team.</p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9f9f9; color: #555; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">BSCustoms • Your one-stop shop for quality automotive parts</p>
        <p style="margin: 5px 0 0;">&copy; ${new Date().getFullYear()} BSCustoms. All rights reserved.</p>
      </div>
    </div>
  `,
};


    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email error:", error);
      } else {
        console.log("Confirmation email sent:", info.response);
      }
    });

    res.status(201).json({ msg: "Order placed successfully!", order });

  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


router.get("/all", authMiddleware, async (req, res) => {
    try {
    //   if (!req.user.isAdmin) return res.status(403).json({ msg: "Unauthorized" });
  
      const orders = await Order.find()
        .populate("user", "name email")
        .populate("items.product", "name price image");
  
      res.json(orders);
    } catch (err) {
      res.status(500).json({ msg: "Server error", error: err.message });
    }
  });
  

// Get orders for a user
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("items.product");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});



// // Update order status (admin only)
// router.put("/:id/status", authMiddleware, async (req, res) => {
//     try {
//       const { status } = req.body;
  
//       if (!["Pending", "Confirmed", "Cancelled"].includes(status)) {
//         return res.status(400).json({ msg: "Invalid status" });
//       }
  
//       const order = await Order.findById(req.params.id);
//       if (!order) return res.status(404).json({ msg: "Order not found" });
  
//       order.status = status;
//       await order.save();
  
//       res.json({ msg: "Order status updated", order });
//     } catch (err) {
//       res.status(500).json({ msg: "Server error", error: err.message });
//     }
//   });





router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Confirmed", "Cancelled"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    // Fetch order + user email
    const order = await Order.findById(req.params.id).populate("user", "email name");
    if (!order) return res.status(404).json({ msg: "Order not found" });

    // Update status
    order.status = status;
    await order.save();

    // Build email details
    const userEmail = order.user.email;
    const userName = order.user.name;
    let subject, htmlBody;

    if (status === "Confirmed") {
      subject = "Your BSCustoms Order is Confirmed!";
      htmlBody = `
        <div style="font-family: Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
          <h2 style="color:#28a745;">Order Confirmed</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Your order <strong>${order._id}</strong> has been <span style="color:#28a745;">CONFIRMED</span> and is now being processed.</p>
          <p>We will let you know once it’s shipped.</p>
          <p>Thank you for shopping at BSCustoms!</p>
          <hr/>
          <p style="font-size:12px;color:#666;">&copy; ${new Date().getFullYear()} BSCustoms</p>
        </div>
      `;
    } else if (status === "Cancelled") {
      subject = "Your BSCustoms Order has been Cancelled";
      htmlBody = `
        <div style="font-family: Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
          <h2 style="color:#e74c3c;">Order Cancelled</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>We’re sorry to inform you that your order <strong>${order._id}</strong> has been <span style="color:#e74c3c;">CANCELLED</span>.</p>
          <p>If you have already been charged, the refund will be processed within 5–7 business days.</p>
          <p>Contact support if you have any questions.</p>
          <hr/>
          <p style="font-size:12px;color:#666;">&copy; ${new Date().getFullYear()} BSCustoms</p>
        </div>
      `;
    }

    // Send the email (fire‑and‑forget)
    transporter.sendMail({
      from: process.env.MAIL_USER,
      to: userEmail,
      subject,
      html: htmlBody,
    }, (err, info) => {
      if (err) console.error("Status email error:", err);
      else console.log("Status email sent:", info.response);
    });

    // Respond to client
    res.json({ msg: "Order status updated", order });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
