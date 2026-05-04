const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    business_name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: ""
    },
    mapLink: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
    featured: {
        type: Boolean,
        default: false
   }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);