const mongoose = require("mongoose");

const MaintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    maintenanceType: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    odometer: {
      type: Number,
    },
    description: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    serviceProvider: {
      type: String,
      required: true,
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
MaintenanceSchema.index({ vehicle: 1 });
MaintenanceSchema.index({ date: 1 });
MaintenanceSchema.index({ maintenanceType: 1 });

module.exports = mongoose.model("Maintenance", MaintenanceSchema);
