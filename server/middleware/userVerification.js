// let jwt = require("jsonwebtoken");
// let User = require("../models/userModel");

// let verify_token = async (req, res, next) => {
//   let token = req.header("Authorization");
//   console.log("Raw Authorization Header:", token);   // <-- Add this

//   if (token) {
//     try {
//       let payload = jwt.verify(token, process.env.KEY);
//       let user = await User.findById(payload._id);
//       req.user = user;
//       console.log("User found:", user.email);
//       next();
//     } catch (err) {
//       console.error("Token verification failed:", err);
//       res.status(401).send("Invalid Token!");
//     }
//   } else {
//     res.status(401).send("Invalid Token!!");
//   }

// };

// module.exports = verify_token;





let jwt = require("jsonwebtoken");
let User = require("../models/userModel");

let verify_token = async (req, res, next) => {
  let authHeader = req.header("Authorization");
  console.log("Raw Authorization Header:", authHeader);

  if (!authHeader) {
    return res.status(401).send("No token provided!"); 
  }

  // Check if it starts with "Bearer " and extract the token
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
    return res.status(401).send("Invalid Token Format! Expected 'Bearer <token>'.");
  }

  const token = tokenParts[1]; // actual JWT string

  try {
    let payload = jwt.verify(token, process.env.KEY);
    
    // Optional: Fetch user from DB based on payload._id 
    // This is good practice if you need to ensure the user still exists and is active
    let user = await User.findById(payload._id); 
    if (!user) {
        return res.status(401).send("User not found for this token.");
    }

    req.user = user; // Attach user object to request
    console.log("User found for token:", user.email);
    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    console.error("Token verification failed:", err);
    if (err.name === 'TokenExpiredError') {
        return res.status(401).send("Token has expired!");
    }
    return res.status(401).send("Invalid Token!"); // Generic message for other JWT errors
  }
};

module.exports = verify_token;