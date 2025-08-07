const Agency = require("../models/agencyRegisterModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "akashkolaki5@gmail.com",
    pass: "tesr xusy etrh hdvv", // Use App Password
  },
});

const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: "akashkolaki5@gmail.com",
    to,
    subject,
    text,
  });
};

// Register agency
const registerAgency = async (req, res) => {
  try {
    const {
      firstName,
      age,
      email,
      licenseNumber,
      phone,
      password,
      ambulancePlate,
      vehicleType,
    } = req.body;

    // Basic validation
    if (
      !firstName ||
      !age ||
      !email ||
      !licenseNumber ||
      !phone ||
      !password ||
      !ambulancePlate ||
      !vehicleType
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check existing email or phone
    const existing = await Agency.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Email or phone already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgency = await Agency.create({
      firstName,
      age,
      email,
      licenseNumber,
      phone,
      password: hashedPassword,
      ambulancePlate,
      vehicleType,
      isVerified: false, // default: pending admin approval
      isActive: true,
    });

    await sendEmail(
      email,
      "Registration Received",
      `Hello ${firstName}, your agency registration was successful. Please wait for admin approval.`
    );

    res.status(201).json({
      message: "Registered successfully. Please wait for admin approval.",
      agency: newAgency,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

// Login agency
const loginAgency = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res
        .status(400)
        .json({ message: "Provide email or phone and password" });
    }

    const agency = await Agency.findOne({ $or: [{ email }, { phone }] });
    if (!agency)
      return res.status(401).json({ message: "Invalid credentials" });
    if (!agency.isVerified)
      return res.status(403).json({ message: "Agency not verified" });
    if (!agency.isActive)
      return res.status(403).json({ message: "Agency account is deactivated" });

    const isMatch = await bcrypt.compare(password, agency.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: agency._id, role: "agency" },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      partner: {
        id: agency._id,
        firstName: agency.firstName,
        email: agency.email,
        phone: agency.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// Verify agency (Admin)
const verifyAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Agency.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Agency not found" });

    await sendEmail(
      updated.email,
      "Agency Verified",
      `Hello ${updated.firstName}, your agency has been verified. You can now log in.`
    );

    res.status(200).json({ message: "Agency verified", partner: updated });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Verification failed", error: err.message });
  }
};

// Toggle agency active/deactivate
const toggleAgencyActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updated = await Agency.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Agency not found" });

    res.status(200).json({
      message: `Agency ${isActive ? "activated" : "deactivated"} successfully`,
      partner: updated,
    });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// Get all agencies (for admin list)
const getAllAgencies = async (req, res) => {
  try {
    const agencies = await Agency.find();
    res.status(200).json(agencies);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch agencies", error: err.message });
  }
};

module.exports = {
  registerAgency,
  loginAgency,
  verifyAgency,
  toggleAgencyActiveStatus,
  getAllAgencies,
};
