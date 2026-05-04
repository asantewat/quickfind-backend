require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const Vendor = require("./models/Vendor");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "QuickFind backend is connected to MongoDB" });
});

// =========================
// VENDOR ROUTES
// =========================

// GET all approved vendors
app.get("/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find({ status: "approved" });
    res.json(vendors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// GET pending vendors (for admin)
// IMPORTANT: must come before /vendors/:category
app.get("/vendors/pending", async (req, res) => {
  try {
    const vendors = await Vendor.find({ status: "pending" });
    res.json(vendors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// GET vendors by vendor email (for vendor dashboard)
// IMPORTANT: must come before /vendors/:category
app.get("/vendors/vendor-email/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const vendors = await Vendor.find({ email });
    res.json(vendors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// GET one vendor by ID
app.get("/vendors/id/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(vendor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// GET vendors by location
app.get("/vendors/location/:location", async (req, res) => {
  try {
    const location = decodeURIComponent(req.params.location);

    const vendors = await Vendor.find({
      location: { $regex: location, $options: "i" },
      status: "approved"
    });

    res.json(vendors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// GET vendors by category
app.get("/vendors/:category", async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);

    const vendors = await Vendor.find({
      category,
      status: "approved"
    });

    res.json(vendors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// POST vendor submission
app.post("/vendors", async (req, res) => {
  try {
    const { business_name, category, location, phone, image, email } = req.body;

    const newVendor = new Vendor({
      business_name,
      category,
      location,
      phone,
      image,
      email,
      status: "pending"
    });

    await newVendor.save();

    res.json({ message: "Vendor submitted for approval" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add vendor" });
  }
});

// PUT update vendor status or details
app.put("/vendors/:id", async (req, res) => {
  try {
    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json({
      message: "Vendor updated successfully",
      vendor: updatedVendor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update vendor" });
  }
});

// DELETE vendor
app.delete("/vendors/:id", async (req, res) => {
  try {
    const deletedVendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!deletedVendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete vendor" });
  }
});

// =========================
// AUTH ROUTES
// =========================

console.log("Signup route loaded");

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});