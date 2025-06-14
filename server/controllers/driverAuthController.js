const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Driver = require("../models/DriverAuth");
const mongoose = require("mongoose");

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
    } = req.body;

    const existingDriver = await Driver.findOne({ phone });
    if (existingDriver) {
      return res
        .status(400)
        .json({ status: "failed", message: "Driver already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const driver = new Driver({
      partnerId,
      phone,
      password: hashedPassword,
      firstName,
      lastName,
      email,
      licenseNumber,
      age,
      vehicleType,
    });
    await driver.save();

    const { password: _, ...driverData } = driver.toObject();

    res.status(201).json({
      status: "success",
      message: "Driver registered successfully",
      driver: driverData,
    });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

// Login Driver
const loginDriver = async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    const driver = email
      ? await Driver.findOne({ email })
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

    const payload = { id: driver._id };
    const token = jwt.sign(payload, process.env.KEY, { expiresIn: "1d" });

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

// Logout Driver
const logoutDriver = (req, res) => {
  res.json({ status: "success", message: "Logged out successfully" });
};

// Forgot Password
const forgotPasswordDriver = async (req, res) => {
  const { email } = req.body;

  try {
    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.send({ message: "Driver not registered" });
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

    const resetLink = `http://localhost:3001/api/drivers/reset-password/${token}`;

    const mailOptions = {
      from: "akashkolaki5@gmail.com",
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #333;">Reset Your Driver Account Password</h2>
          <p>Hello,</p>
          <p>Click the button below to reset your password. The link will expire in 10 minutes.</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0066ff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
          <p>Thanks,<br/>Ambulance App Team</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.json({ message: "Error sending email" });
      } else {
        return res.json({ status: true, message: "Reset link sent to email" });
      }
    });
  } catch (err) {
    res
      .status(500)
      .send({ status: "failed", message: "Internal server error" });
  }
};

// Reset Password
const resetPasswordDriver = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.KEY);
    const id = decoded.id;

    const hashPassword = await bcrypt.hash(password, 10);
    await Driver.findByIdAndUpdate({ _id: id }, { password: hashPassword });

    return res.json({ status: true, message: "Password updated successfully" });
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

const getDriversByPartner = async (req, res) => {
  const { partnerId } = req.query;

  if (!partnerId) {
    return res.status(400).json({ status: "failed", message: "partnerId is required" });
  }

  try {
    // const drivers = await Driver.find({ partnerId }).select("-password");
    const drivers = await Driver.find({ partnerId: new mongoose.Types.ObjectId(partnerId) });
    console.log("Drivers found:", drivers.length);
    
    res.status(200).json({ status: "success", drivers });
  } catch (error) {
    console.error("Driver registration error:", error); 
    res.status(500).json({ status: "failed", message: error.message });
  }
};

module.exports = {
  registerDriver,
  loginDriver,
  logoutDriver,
  forgotPasswordDriver,
  resetPasswordDriver,
  getAllDrivers,
  getDriversByPartner,
};
