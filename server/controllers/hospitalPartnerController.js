// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");

// const HospitalPartner = require("../models/HospitalPartner");

// const registerHospitalPartner = async (req, res) => {
//   try {
//     const { hospitalName, hospitalPhone, email, password } = req.body;

//     // Check if partner already exists by email or phone
//     const existing = await HospitalPartner.findOne({
//       $or: [{ email }, { hospitalPhone }],
//     });

//     if (existing) {
//       return res
//         .status(400)
//         .json({ status: "failed", message: "Partner already registered" });
//     }

//     // Generate salt and hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create new partner instance
//     const partner = new HospitalPartner({
//       hospitalName,
//       hospitalPhone,
//       email,
//       password: hashedPassword,
//     });

//     // Save to DB
//     await partner.save();

//     // Remove password from response data
//     const { password: _, ...partnerData } = partner.toObject();

//     // Send success response
//     res.status(201).json({
//       status: "success",
//       message: "Partner registered successfully",
//       partner: partnerData,
//     });
//   } catch (err) {
//     res.status(500).json({ status: "failed", message: err.message });
//   }
// };

// module.exports = {
//   registerHospitalPartner,
// };

// // Login Hospital Partner
// const loginHospitalPartner = async (req, res) => {
//   try {
//     const { email, phone, password } = req.body;

//     const partner = email
//       ? await HospitalPartner.findOne({ email })
//       : await HospitalPartner.findOne({ hospitalPhone: phone });

//     if (!partner) {
//       return res
//         .status(400)
//         .json({ status: "failed", message: "Partner not found" });
//     }

//     const isMatch = await bcrypt.compare(password, partner.password);
//     if (!isMatch) {
//       return res
//         .status(400)
//         .json({ status: "failed", message: "Invalid password" });
//     }

//     const token = jwt.sign({ id: partner._id }, process.env.KEY, {
//       expiresIn: "1d",
//     });

//     const { password: _, ...partnerData } = partner.toObject();

//     res.status(200).json({
//       status: "success",
//       message: "Logged in successfully",
//       partner: partnerData,
//       token,
//     });
//   } catch (err) {
//     res.status(500).json({ status: "failed", message: err.message });
//   }
// };

// // Logout Hospital Partner
// const logoutHospitalPartner = (req, res) => {
//   res.json({ status: "success", message: "Logged out successfully" });
// };

// // Forgot Password
// const forgotPasswordHospitalPartner = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const partner = await HospitalPartner.findOne({ email });
//     if (!partner) {
//       return res.send({ message: "Partner not registered" });
//     }

//     const token = jwt.sign({ id: partner._id }, process.env.KEY, {
//       expiresIn: "10m",
//     });

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "akashkolaki5@gmail.com",
//         pass: "tesr xusy etrh hdvv",
//       },
//     });

//     const resetLink = `http://localhost:3001/api/partners-register/reset-password/${token}`;

//     const mailOptions = {
//       from: "akashkolaki5@gmail.com",
//       to: email,
//       subject: "Reset Your Password",
//       html: `
//         <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
//           <h2 style="color: #333;">Reset Your Hospital Partner Account Password</h2>
//           <p>Hello,</p>
//           <p>Click the button below to reset your password. The link will expire in 10 minutes.</p>
//           <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0066ff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
//           <p>If you did not request this, please ignore this email.</p>
//           <p>Thanks,<br/>Ambulance App Team</p>
//         </div>
//       `,
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         return res.json({ message: "Error sending email" });
//       } else {
//         return res.json({ status: true, message: "Reset link sent to email" });
//       }
//     });
//   } catch (err) {
//     res
//       .status(500)
//       .send({ status: "failed", message: "Internal server error" });
//   }
// };

// // Reset Password
// const resetPasswordHospitalPartner = async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;

//   try {
//     const decoded = jwt.verify(token, process.env.KEY);
//     const id = decoded.id;

//     const hashPassword = await bcrypt.hash(password, 10);
//     await HospitalPartner.findByIdAndUpdate(
//       { _id: id },
//       { password: hashPassword }
//     );

//     return res.json({ status: true, message: "Password updated successfully" });
//   } catch (err) {
//     res
//       .status(400)
//       .send({ status: false, message: "Invalid or expired token" });
//   }
// };

// // Get All Hospital Partners
// const getAllHospitalPartners = async (req, res) => {
//   try {
//     const partners = await HospitalPartner.find().select("-password");
//     res.status(200).json({ status: "success", partners });
//   } catch (error) {
//     res.status(500).json({ status: "failed", message: error.message });
//   }
// };

// module.exports = {
//   registerHospitalPartner,
//   loginHospitalPartner,
//   logoutHospitalPartner,
//   forgotPasswordHospitalPartner,
//   resetPasswordHospitalPartner,
//   getAllHospitalPartners,
// };

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const HospitalPartner = require("../models/HospitalPartner");

// Register Hospital Partner
const registerHospitalPartner = async (req, res) => {
  try {
    const { hospitalName, hospitalPhone, email, password } = req.body;

    const existing = await HospitalPartner.findOne({
      $or: [{ email }, { hospitalPhone }],
    });

    if (existing) {
      return res
        .status(400)
        .json({ status: "failed", message: "Partner already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const partner = new HospitalPartner({
      hospitalName,
      hospitalPhone,
      email,
      password: hashedPassword,
    });

    await partner.save();

    const { password: _, ...partnerData } = partner.toObject();

    res.status(201).json({
      status: "success",
      message: "Partner registered successfully",
      partner: partnerData,
    });
  } catch (err) {
    res.status(500).json({ status: "failed", message: err.message });
  }
};

// Login Hospital Partner
const loginHospitalPartner = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const partner = email
      ? await HospitalPartner.findOne({ email })
      : await HospitalPartner.findOne({ hospitalPhone: phone });

    if (!partner) {
      return res
        .status(400)
        .json({ status: "failed", message: "Partner not found" });
    }

    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "failed", message: "Invalid password" });
    }

    const token = jwt.sign({ id: partner._id }, process.env.KEY, {
      expiresIn: "1d",
    });

    const { password: _, ...partnerData } = partner.toObject();

    res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      partner: partnerData,
      token,
    });
  } catch (err) {
    res.status(500).json({ status: "failed", message: err.message });
  }
};

// Logout Hospital Partner
const logoutHospitalPartner = (req, res) => {
  res.json({ status: "success", message: "Logged out successfully" });
};

// Forgot Password
const forgotPasswordHospitalPartner = async (req, res) => {
  const { email } = req.body;

  try {
    const partner = await HospitalPartner.findOne({ email });
    if (!partner) {
      return res
        .status(404)
        .json({ status: "failed", message: "Partner not registered" });
    }

    const token = jwt.sign({ id: partner._id }, process.env.KEY, {
      expiresIn: "10m",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "akashkolaki5@gmail.com",
        pass: "tesr xusy etrh hdvv", // ⚠️ Use environment variable in production
      },
    });

    const resetLink = `http://localhost:3000/partner-reset-password/${token}`;

    const mailOptions = {
      from: "akashkolaki5@gmail.com",
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #333;">Reset Your Hospital Partner Account Password</h2>
          <p>Hello,</p>
          <p>Click the button below to reset your password. This link will expire in 10 minutes.</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0066ff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
          <p>Thanks,<br/>Ambulance App Team</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.json({ status: false, message: "Error sending email" });
      } else {
        return res.json({ status: true, message: "Reset link sent to email" });
      }
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};

// Reset Password
const resetPasswordHospitalPartner = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.KEY);
    const id = decoded.id;

    const hashPassword = await bcrypt.hash(password, 10);
    await HospitalPartner.findByIdAndUpdate(
      { _id: id },
      { password: hashPassword }
    );

    return res.json({ status: true, message: "Password updated successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ status: false, message: "Invalid or expired token" });
  }
};

// Get All Hospital Partners
const getAllHospitalPartners = async (req, res) => {
  try {
    const partners = await HospitalPartner.find().select("-password");
    res.status(200).json({ status: "success", partners });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

module.exports = {
  registerHospitalPartner,
  loginHospitalPartner,
  logoutHospitalPartner,
  forgotPasswordHospitalPartner,
  resetPasswordHospitalPartner,
  getAllHospitalPartners,
};
