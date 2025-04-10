const mongoose = require("mongoose");
const { PASSWORD_REQUIRED, EMAIL_REQUIRED, PHONE_REQUIRED } = require('../errors/mongoose');

const AgencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: [true, EMAIL_REQUIRED],
      unique: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, PHONE_REQUIRED],
      unique: true
    },
    destination: {
      type: String,
      required: false,
      trim: true
    },
    enrolledUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: []
    },
    description: {
      type: String,
      trim: true
    },
    password: {
      type: String,
      required: [true, PASSWORD_REQUIRED],
      minlength: 6
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    profileImage: {
      type: String,
      default: ''
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  {
    timestamps: true,
  }
);

// Add index for faster queries
AgencySchema.index({ name: 1 });
AgencySchema.index({ email: 1 });
AgencySchema.index({ phone: 1 });

module.exports = mongoose.model("Agency", AgencySchema);
