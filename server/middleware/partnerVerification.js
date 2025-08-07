const jwt = require("jsonwebtoken");

const verifyPartner = (req, res, next) => {
  // console.log("TEST LINE: Is this the correct file?");

  const authHeader = req.headers.authorization;
  // console.log(" TEST LINE:authHeader: ", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.KEY, (err, decoded) => {
    if (err) {
      console.error("JWT verification error:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    req.partnerId = decoded.id;

    next();
  });
};

module.exports = { verifyPartner };
