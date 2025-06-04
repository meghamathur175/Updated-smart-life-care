const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB is connected");
  } catch (err) {
    console.log("Not connected to MongoDB", err);
  }
};

module.exports = connectDb;
