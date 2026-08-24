require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const User = require("./models/User");
const Venue = require("./models/Venue");
const Event = require("./models/Event");
const ShowSeat = require("./models/ShowSeat");

async function seed() {
  await connectDB();

  await User.deleteMany({});
  await Venue.deleteMany({});
  await Event.deleteMany({});
  await ShowSeat.deleteMany({});

  const pass = await bcrypt.hash("Admin@123", 12);

  const admin = await User.create({
    name: "Admin",
    email: "admin@example.com",
    password: pass,
    role: "admin"
  });

  const opass = await bcrypt.hash("Organiser@123", 12);

  const organiser = await User.create({
    name: "Demo Organiser",
    email: "organiser@example.com",
    password: opass,
    role: "organiser"
  });

  const cpass = await bcrypt.hash("Customer@123", 12);

  await User.create({
    name: "Demo Customer",
    email: "customer@example.com",
    password: cpass,
    role: "customer"
  });

  // Create 80 venue seats: A1-H10
  const seats = [];

  for (let r = 0; r < 8; r++) {
    for (let n = 1; n <= 10; n++) {
      seats.push({
        row: String.fromCharCode(65 + r),
        number: n,
        category: r < 2 ? "Premium" : "Standard"
      });
    }
  }

  const venue = await Venue.create({
    name: "Demo Arena",
    address: "City Centre",
    seats
  });

  // Create event
  const event = await Event.create({
    title: "Demo Concert",
    type: "concert",
    description: "Seed event for testing",
    organiser: organiser._id,
    venue: venue._id,
    startAt: new Date(Date.now() + 7 * 86400000),
    prices: [
      {
        category: "Premium",
        price: 1200
      },
      {
        category: "Standard",
        price: 700
      }
    ],
    status: "published"
  });

  // Create event-specific seats
  const showSeats = seats.map((seat) => ({
    event: event._id,
    seatKey: `${seat.row}${seat.number}`,
    row: seat.row,
    number: seat.number,
    category: seat.category,
    status: "available"
  }));

  await ShowSeat.insertMany(showSeats);

  console.log("Seed complete");
  console.log("Created 80 ShowSeat records");
  console.log("admin@example.com / Admin@123");
  console.log("organiser@example.com / Organiser@123");
  console.log("customer@example.com / Customer@123");

  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});