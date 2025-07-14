const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const validator = require("validator");
const axios = require("axios");
const Driver = require("../models/IndividualDriverModel");
const mongoose = require("mongoose");

// Email validation helper
const isRealEmail = async (email) => {
  try {
    const response = await axios.get(
      "https://emailvalidation.abstractapi.com/v1/",
      {
        params: {
          api_key: process.env.ABSTRACT_API_KEY,
          email,
        },
      }
    );
    return (
      response.data &&
      response.data.is_valid_format.value &&
      response.data.deliverability === "DELIVERABLE"
    );
  } catch (err) {
    console.error("Email validation error:", err.message);
    return false;
  }
};

// Register Driver
const registerDriver = async (req, res) => {
  try {
    const {
      phone,
      password,
      firstName,
      lastName,
      email,
      licenseNumber,
      age,
      vehicleType,
      partnerId,
      ambulancePlateNumber,
    } = req.body;

    // Basic email format check
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid email format",
      });
    }

    // Deliverability check via API
    const validEmail = await isRealEmail(email);
    if (!validEmail) {
      return res.status(400).json({
        status: "failed",
        message: "Email is not valid or deliverable",
      });
    }

    // Password strength validation
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        status: "failed",
        message:
          "Password must be 8 characters, include 1 uppercase letter, 1 number & 1 special character.",
      });
    }

    // Ambulance plate validation
    const plateRegex = /^[A-Z]{2}\d{2}\s?[A-Z]{1,2}\s?\d{4}$/; // Example: RJ14 AB 1234
    if (!ambulancePlateNumber || !plateRegex.test(ambulancePlateNumber.trim().toUpperCase())) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid ambulance plate number. Expected format: RJ14 AB 1234",
      });
    }

    const cleanedPlate = ambulancePlateNumber.trim().toUpperCase();

    // Check for duplicate phone
    const existingDriver = await Driver.findOne({ phone });
    if (existingDriver) {
      return res.status(400).json({
        status: "failed",
        message: "Driver already registered",
      });
    }

    // Check for duplicate ambulance plate number
    const existingPlate = await Driver.findOne({ ambulancePlateNumber: cleanedPlate });
    if (existingPlate) {
      return res.status(400).json({
        status: "failed",
        message: "Ambulance with this plate number already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save driver
    const driver = new Driver({
      partnerId,
      phone,
      password: hashedPassword,
      firstName,
      lastName,
      email: email.trim().toLowerCase(),
      licenseNumber,
      age,
      vehicleType,
      ambulancePlateNumber: cleanedPlate, // Save cleaned plate
    });

    await driver.save();

    // Remove password before returning
    const { password: _, ...driverData } = driver.toObject();

    res.status(201).json({
      status: "success",
      message: "Driver registered successfully",
      driver: driverData,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};


// Login Driver
const loginDriver = async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    const driver = email
      ? await Driver.findOne({ email: email.trim().toLowerCase() })
      : await Driver.findOne({ phone });

    if (!driver) {
      return res
        .status(400)
        .json({ status: "failed", message: "Driver not found" });
    }

    const validPassword = await bcrypt.compare(password, driver.password);
    if (!validPassword) {
      return res
        .status(400)
        .json({ status: "failed", message: "Invalid password" });
    }

    const token = jwt.sign({ id: driver._id }, process.env.KEY, {
      expiresIn: "1d",
    });

    const { password: _, ...driverData } = driver.toObject();

    res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      driver: driverData,
      token,
    });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

// Forgot Password - Send Reset Email with Button
const forgotPasswordDriver = async (req, res) => {
  const { email } = req.body;

  try {
    const driver = await Driver.findOne({ email: email.trim().toLowerCase() });
    if (!driver) {
      return res.send({ status: "failed", message: "Driver not registered" });
    }

    const token = jwt.sign({ id: driver._id }, process.env.KEY, {
      expiresIn: "10m",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "akashkolaki5@gmail.com",
        pass: "tesr xusy etrh hdvv",
      },
    });

    const resetLink = `http://localhost:3000/driver-reset-password/${token}`;

    const mailOptions = {
      from: "akashkolaki5@gmail.com",
      to: email,
      subject: "Reset Your Password",
      html: `
        <h2>Reset Your Driver Account Password</h2>
        <p>Click the button below to reset your password (expires in 10 minutes):</p>
        <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:5px;">Reset Password</a>
        <p>If the button doesn't work, use the link below:</p>
        <p>${resetLink}</p>
      `,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error)
        return res.json({ status: false, message: "Error sending email" });
      res.json({ status: true, message: "Reset link sent to email" });
    });
  } catch (err) {
    res
      .status(500)
      .send({ status: "failed", message: "Internal server error" });
  }
};

// Reset Password (API endpoint)
const resetPasswordDriver = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({
      status: false,
      message:
        "Password must be 8 characters, include 1 uppercase letter, 1 number & 1 special character.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.KEY);
    const hashed = await bcrypt.hash(password, 10);

    await Driver.findByIdAndUpdate(decoded.id, { password: hashed });

    res.json({ status: true, message: "Password updated successfully" });
  } catch (err) {
    res
      .status(400)
      .send({ status: false, message: "Invalid or expired token" });
  }
};

// Get All Drivers
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().select("-password");
    res.status(200).json({ status: "success", drivers });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

// Get Drivers by Partner ID
const getDriversByPartner = async (req, res) => {
  const { partnerId } = req.query;
  if (!partnerId) {
    return res
      .status(400)
      .json({ status: "failed", message: "partnerId is required" });
  }

  try {
    const drivers = await Driver.find({
      partnerId: new mongoose.Types.ObjectId(partnerId),
    }).select("-password");
    res.status(200).json({ status: "success", drivers });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

module.exports = {
  registerDriver,
  loginDriver,
  forgotPasswordDriver,
  resetPasswordDriver,
  logoutDriver: (req, res) =>
    res.json({ status: "success", message: "Logged out successfully" }),
  getAllDrivers,
  getDriversByPartner,
};
