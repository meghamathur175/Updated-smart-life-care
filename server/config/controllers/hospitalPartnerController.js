const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const HospitalPartner = require("../models/HospitalPartner");
const Partner = require("../models/PartnerModel");

// Self-registration of Partner (After Admin Onboarding)
const selfRegisterHospitalPartner = async (req, res) => {
  try {
    const { hospitalName, hospitalPhone, email, password } = req.body;

    // 1. Check if email exists from Admin onboarding
    const partner = await Partner.findOne({ email });

    if (!partner) {
      return res.status(404).json({
        status: "failed",
        message: "Email not found. Please contact the administrator.",
      });
    }

    // 2. Check if already registered
    const alreadyRegistered = await HospitalPartner.findOne({ email });
    if (alreadyRegistered) {
      return res.status(400).json({
        status: "failed",
        message: "This email has already been registered. Please log in.",
      });
    }

    // 3. Hash password and update entry
    const hashedPassword = await bcrypt.hash(password, 10);
    partner.password = hashedPassword;
    await partner.save();

    const newPartner = await HospitalPartner.create({
      hospitalName,
      hospitalPhone,
      email,
      password: hashedPassword,
    });

    // 4. Generate token
    const token = jwt.sign(
      { hospitalPartnerId: newPartner._id },
      process.env.KEY,
      { expiresIn: "7d" }
    );

    const { password: _, ...partnerData } = partner.toObject();

    res.status(201).json({
      status: "success",
      message: "Registered successfully",
      partner: newPartner,
      token,
    }); 
  } catch (err) {
    console.error("Self-registration error:", err);
    res.status(500).json({
      status: "failed",
      message: "Internal server error during registration",
    });
  }
};

// LOGIN Hospital Partner
const loginHospitalPartner = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const hospitalPartner = email
      ? await HospitalPartner.findOne({ email })
      : await HospitalPartner.findOne({ hospitalPhone: phone });

    if (!hospitalPartner) {
      return res.status(400).json({ status: "failed", message: "Partner not found" });
    }

    const isMatch = await bcrypt.compare(password, hospitalPartner.password);
    if (!isMatch) {
      return res.status(400).json({ status: "failed", message: "Invalid password" });
    }

    // Get corresponding Partner model
    const partner = await Partner.findOne({ email: hospitalPartner.email });
    if (!partner) {
      return res.status(400).json({ status: "failed", message: "Partner record not found" });
    }

    const token = jwt.sign({ id: partner._id }, process.env.KEY, { expiresIn: "1d" });

    const { password: _, ...partnerData } = partner.toObject();

    res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      partner: partnerData, // from Partner model
      token,
    });
  } catch (err) {
    res.status(500).json({ status: "failed", message: err.message });
  }
};


// LOGOUT Hospital Partner (stateless)
const logoutHospitalPartner = (req, res) => {
  res.status(200).json({ status: "success", message: "Logged out successfully" });
};

// FORGOT Password
const forgotPasswordHospitalPartner = async (req, res) => {
  const { email } = req.body;
  try {
    const partner = await HospitalPartner.findOne({ email });
    if (!partner) {
      return res.status(404).json({ status: "failed", message: "Partner not registered" });
    }

    const token = jwt.sign({ id: partner._id }, process.env.KEY, { expiresIn: "10m" });
    const resetLink = `http://localhost:3000/partner-reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "akashkolaki5@gmail.com",
        pass: "tesr xusy etrh hdvv",
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #333;">Reset Your Hospital Partner Account Password</h2>
          <p>Hello,</p>
          <p>Click below to reset your password. The link expires in 10 minutes.</p>
          <a href="${resetLink}" style="padding: 10px 20px; background-color: #0066ff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you did not request this, ignore this email.</p>
          <p>Thanks,<br/>Ambulance App Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ status: true, message: "Reset link sent to email" });
  } catch (err) {
    return res.status(500).json({ status: "failed", message: "Error sending email" });
  }
};

// RESET Password
const resetPasswordHospitalPartner = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.KEY);
    const id = decoded.id;

    const hashPassword = await bcrypt.hash(password, 10);
    await HospitalPartner.findByIdAndUpdate(id, { password: hashPassword });

    return res.status(200).json({ status: true, message: "Password updated successfully" });
  } catch (err) {
    return res.status(400).json({ status: false, message: "Invalid or expired token" });
  }
};

// GET ALL Hospital Partners
const getAllHospitalPartners = async (req, res) => {
  try {
    const partners = await HospitalPartner.find().select("-password");
    res.status(200).json({ status: "success", partners });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

// GET Logged-in Hospital Partner
const getLoggedInHospitalPartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.partnerId).select("-password");
    if (!partner) {
      return res.status(404).json({ status: "failed", message: "Hospital Partner not found" });
    }
    res.status(200).json({ status: "success", hospitalPartner: partner });
  } catch (err) {
    res.status(500).json({ status: "failed", message: err.message });
  }
};

module.exports = {
  selfRegisterHospitalPartner,
  loginHospitalPartner,
  logoutHospitalPartner,
  forgotPasswordHospitalPartner,
  resetPasswordHospitalPartner,
  getAllHospitalPartners,
  getLoggedInHospitalPartner,
};
