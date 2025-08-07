const HospitalPartner = require("../models/hospitalregisterModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "akashkolaki5@gmail.com",
    pass: "tesr xusy etrh hdvv",
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

const registerHospitalPartner = async (req, res) => {
  try {
    const { hospitalName, phone, email, password } = req.body;

    if (!hospitalName || !phone || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await HospitalPartner.findOne({
      $or: [{ email }, { phone }],
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Email or phone already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const partner = await HospitalPartner.create({
      hospitalName,
      phone,
      email,
      password: hashedPassword,
    });

    await sendEmail(
      email,
      "Registration Received",
      `Hello ${hospitalName}, your registration was successful. Please wait for admin approval.`
    );

    res.status(201).json({ message: "Registered successfully", partner });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

const loginHospitalPartner = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res
        .status(400)
        .json({ message: "Provide email or phone and password" });
    }

    const partner = await HospitalPartner.findOne({
      $or: [{ email }, { phone }],
    });

    if (!partner) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!partner.isVerified) {
      return res.status(403).json({ message: "Hospital not verified" });
    }

    if (!partner.isActive) {
      return res
        .status(403)
        .json({ message: "Hospital account is deactivated" });
    }

    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: partner._id, role: "hospital" },
      process.env.KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      partner: {
        id: partner._id,
        hospitalName: partner.hospitalName,
        email: partner.email,
        phone: partner.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

const verifyHospitalPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await HospitalPartner.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    await sendEmail(
      updated.email,
      "Hospital Verified",
      `Hello ${updated.hospitalName}, your hospital has been verified. You can now log in.`
    );

    res.status(200).json({ message: "Hospital verified", partner: updated });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Verification failed", error: err.message });
  }
};

const toggleHospitalActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updated = await HospitalPartner.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.status(200).json({
      message: `Hospital ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      partner: updated,
    });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

const getAllHospitalPartners = async (req, res) => {
  try {
    const partners = await HospitalPartner.find();
    res.status(200).json(partners);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch partners", error: err.message });
  }
};

module.exports = {
  registerHospitalPartner,
  loginHospitalPartner,
  verifyHospitalPartner,
  getAllHospitalPartners,
  toggleHospitalActiveStatus,
};
