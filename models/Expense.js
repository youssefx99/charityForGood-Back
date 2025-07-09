const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    receipt: {
      type: String, // Path to uploaded receipt file
    },
    approvalStatus: {
      type: String,
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    spentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ date: 1 });
ExpenseSchema.index({ approvalStatus: 1 });

module.exports = mongoose.model("Expense", ExpenseSchema);
