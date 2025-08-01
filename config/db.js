require("dotenv").config();
const mongoose = require("mongoose");

exports.connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected to DB");
  } catch (error) {
    console.log(error);
  }
};
