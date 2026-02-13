require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

/* ------------------ MIDDLEWARE ------------------ */
app.use(cors());
app.use(express.json());

/* ------------------ DATABASE ------------------ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

/* ------------------ SCHEMA ------------------ */
const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      required: true,
      trim: true,
    },
    service: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

/* ------------------ ROUTES ------------------ */

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

/* ---------- GET ALL BOOKINGS ---------- */
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/* ---------- CREATE BOOKING ---------- */
app.post("/api/bookings", async (req, res) => {
  try {
    const { customer, service, amount } = req.body;

    if (!customer || !service || !amount) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    const newBooking = await Booking.create({
      customer,
      service,
      amount,
    });

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ error: "Failed to create booking" });
  }
});

/* ---------- UPDATE BOOKING ---------- */
app.put("/api/bookings/:id", async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update booking" });
  }
});

/* ---------- DELETE BOOKING ---------- */
app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully ✅" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

/* ------------------ SERVER ------------------ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
