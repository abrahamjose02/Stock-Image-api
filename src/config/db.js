// db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("Connecting to MongoDB...");
  try {
    const uri = process.env.MONGO_URI; 

    const options = {}; 

    await mongoose.connect(uri, options);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};

module.exports = connectDB;
