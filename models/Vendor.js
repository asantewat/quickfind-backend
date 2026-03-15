const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
    business_name: String,
    category: String,
    location: String,
    phone: String,
    image: String,
    status: {
        type: String,
        default: "pending"
    }
});

module.exports = mongoose.model("Vendor", vendorSchema);