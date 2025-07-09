const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema(
  {
    fullName: {
      first: { type: String, required: true },
      middle: { type: String },
      last: { type: String, required: true },
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    nationalId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    contact: {
      phone: { type: String, required: true },
      email: { type: String, trim: true },
    },
    primaryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String, default: "Saudi Arabia" },
    },
    alternateAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String, default: "Saudi Arabia" },
    },
    tribeAffiliation: {
      type: String,
    },
    membershipStatus: {
      type: String,
      default: "active",
    },
    profilePhoto: {
      type: String, // Path to stored image
    },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
    // Reference to payment records
    paymentRecords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
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

module.exports = mongoose.model("Member", MemberSchema);
