const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    purpose: {
      type: String,
      required: true,
    },
    startOdometer: {
      type: Number,
      required: true,
    },
    endOdometer: {
      type: Number,
    },
    status: {
      type: String,
      default: "scheduled",
    },
    passengers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
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
TripSchema.index({ vehicle: 1 });
TripSchema.index({ driver: 1 });
TripSchema.index({ startDate: 1 });
TripSchema.index({ status: 1 });

module.exports = mongoose.model("Trip", TripSchema);
