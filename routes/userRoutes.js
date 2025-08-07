const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();
const nodemailer = require("nodemailer")
// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password,username, address } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // const defaultAddress = {
    //     city: "",
    //     state: "",
    //     country: "",
    //     pincode: "",
    //     phoneNumber: "",
    //     alternatePhoneNumber: "",
    //   };

    const user = new User({
      name,
      email,
      username,
      password: hashedPassword,
    //   image,
      address,
    });

    await user.save();

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin ,email: user.email}, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.json({ token, user: { id: user._id, name: user.name, email,isAdmin:user.isAdmin , address: user.address} });
    // res.status(201).json({ token, user: { id: user._id, name, email ,isAdmin:user.isAdmin} });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({ token, user: { id: user._id, name: user.name, email,isAdmin:user.isAdmin , address: user.address} });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});



router.put("/update", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { name, address, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Update name, image, address if provided
    if (name) user.name = name;
    
    if (address) user.address = address;

    // Handle password change if both fields are provided
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    } else if (currentPassword || newPassword) {
      // If only one is provided, it's an error
      return res.status(400).json({ msg: "To change password, provide both currentPassword and newPassword" });
    }

    await user.save();

    res.json({
      msg: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


// POST /api/users/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Create a JWT token that expires in 15 mins
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:3000/reset-password/${token}`; // Frontend link

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.name || ""},</p>
        <p>You requested to reset your password.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    res.json({ msg: "Reset link sent to email" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});



// POST /api/users/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    return res.status(400).json({ msg: "Invalid or expired token" });
  }
});





router.post("/contactmail", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!email || !message || !name || !subject) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // You should already have a transporter configured
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your provider
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.MAIL_USER, // Your receiving email
      subject: `Contact Form: ${subject}`,
      html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; background-color: #f9f9f9;">
    <h2 style="text-align: center; color: #333;">📩 New Contact Message</h2>

    <table style="width: 100%; margin-top: 20px; font-size: 15px; color: #444;">
      <tr>
        <td style="padding: 8px 0;"><strong>Name:</strong></td>
        <td style="padding: 8px 0;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0;"><strong>Email:</strong></td>
        <td style="padding: 8px 0;">${email}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0;"><strong>Subject:</strong></td>
        <td style="padding: 8px 0;">${subject}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top: 16px;">
          <strong>Message:</strong>
          <div style="margin-top: 8px; padding: 12px; background-color: #fff; border-radius: 4px; border: 1px solid #ddd; white-space: pre-line;">
            ${message}
          </div>
        </td>
      </tr>
    </table>

    <p style="text-align: center; font-size: 13px; color: #888; margin-top: 40px;">
      This message was sent via your website contact form.
    </p>
  </div>
`

    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: "Message sent successfully." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});



module.exports = router;
