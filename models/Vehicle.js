const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      default: "available",
    },
    currentOdometer: {
      type: Number,
      default: 0,
    },
    fuelType: {
      type: String,
      default: "gasoline",
    },
    registrationExpiry: {
      type: Date,
    },
    insuranceExpiry: {
      type: Date,
    },
    documents: [
      {
        type: String, // Paths to uploaded documents
      },
    ],
    notes: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
VehicleSchema.index({ status: 1 });
VehicleSchema.index({ licensePlate: 1 });

module.exports = mongoose.model("Vehicle", VehicleSchema);
