const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentType: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    isInstallment: {
      type: Boolean,
      default: false,
    },
    installmentPlan: {
      totalAmount: { type: Number },
      numberOfInstallments: { type: Number },
      paidInstallments: { type: Number, default: 0 },
    },
    receiptNumber: {
      type: String,
      unique: true,
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
PaymentSchema.index({ member: 1 });
PaymentSchema.index({ paymentDate: 1 });
PaymentSchema.index({ paymentType: 1 });
PaymentSchema.index({ isPaid: 1 });

module.exports = mongoose.model("Payment", PaymentSchema);
