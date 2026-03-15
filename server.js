const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const Vendor = require("./models/Vendor");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://quickfind_user:5Haron.com05qf@quickfind.qpfg8ox.mongodb.net/?appName=Quickfind")
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.log("❌ MongoDB connection error:", err));

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'QuickFind backend is connected to MongoDB' });
});

// GET all approved vendors
app.get('/vendors', async (req, res) => {
    try {
        const vendors = await Vendor.find({ status: "approved" });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

// GET one vendor by ID
app.get('/vendors/id/:id', async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.json(vendor);
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

// GET vendors by category
app.get('/vendors/:category', async (req, res) => {
    try {
        const vendors = await Vendor.find({
            category: req.params.category,
            status: "approved"
        });

        res.json(vendors);
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

// POST add vendor
app.post('/vendors', async (req, res) => {
    try {
        const vendor = new Vendor(req.body);
        await vendor.save();

        res.json({ message: "Vendor submitted for approval" });
    } catch (error) {
        res.status(500).json({ error: "Failed to add vendor" });
    }
});

// UPDATE vendor status
app.put('/vendors/:id', async (req, res) => {
    try {
        await Vendor.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status }
        );

        res.json({ message: "Vendor status updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update vendor" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});