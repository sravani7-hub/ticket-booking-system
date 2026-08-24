const crypto = require("crypto");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const ShowSeat = require("../models/ShowSeat");
const Event = require("../models/Event");
const { createQR } = require("./qrService");
const { sendMail } = require("./emailService");

async function confirmBooking({
  userId,
  eventId,
  seatIds,
  waitlistId = null
}) {
  const session = await mongoose.startSession();

  try {
    let booking;

    await session.withTransaction(async () => {
      const now = new Date();

      const seats = await ShowSeat.find({
        _id: { $in: seatIds },
        event: eventId
      }).session(session);

      if (seats.length !== seatIds.length) {
        throw new Error("Invalid seat selection");
      }

      // Verify that all seats are still held by this customer
      if (
        seats.some(
          (s) =>
            s.status !== "held" ||
            String(s.holdBy) !== String(userId) ||
            !s.holdExpiresAt ||
            s.holdExpiresAt <= now
        )
      ) {
        throw new Error(
          "Seat hold expired or belongs to another customer"
        );
      }

      const event = await Event.findById(eventId).session(session);

      if (!event) {
        throw new Error("Event not found");
      }

      /*
       * Build a normalized price map.
       * This prevents "Premium" vs "premium"
       * or accidental whitespace from causing ₹0.
       */
      const priceMap = new Map(
        (event.prices || []).map((p) => [
          String(p.category).trim().toLowerCase(),
          Number(p.price)
        ])
      );

      let amount = 0;

      for (const seat of seats) {
        const category = String(seat.category)
          .trim()
          .toLowerCase();

        const price = priceMap.get(category);

        if (price === undefined || Number.isNaN(price)) {
          throw new Error(
            `Price not configured for seat category: ${seat.category}`
          );
        }

        amount += price;
      }

      console.log("===== BOOKING PRICE =====");
      console.log(
        "Seats:",
        seats.map((s) => ({
          seatKey: s.seatKey,
          category: s.category
        }))
      );
      console.log("Event prices:", event.prices);
      console.log("Total amount:", amount);
      console.log("=========================");

      const reference =
        "TKT-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        crypto.randomBytes(3).toString("hex").toUpperCase();

      const qrData = await createQR(reference);

      [booking] = await Booking.create(
        [
          {
            reference,
            customer: userId,
            event: eventId,
            seats: seatIds,
            amount,
            qrData
          }
        ],
        { session }
      );

      await ShowSeat.updateMany(
        { _id: { $in: seatIds } },
        {
          $set: {
            status: "booked",
            holdBy: null,
            holdExpiresAt: null,
            booking: booking._id
          }
        },
        { session }
      );

      if (waitlistId) {
        const Waitlist = require("../models/Waitlist");

        await Waitlist.updateOne(
          {
            _id: waitlistId,
            customer: userId,
            status: "offered"
          },
          {
            $set: {
              status: "completed",
              offerToken: null
            }
          }
        );
      }
    });

    return booking;
  } finally {
    await session.endSession();
  }
}

async function emailBooking(booking) {
  const user = await require("../models/User").findById(
    booking.customer
  );

  await sendMail({
    to: user.email,
    subject: `Booking confirmed — ${booking.reference}`,
    html: `
      <h2>Booking Confirmed</h2>
      <p>Reference: <b>${booking.reference}</b></p>
      <p>Seats: ${booking.seats.length}</p>
      <p>Total: ₹${booking.amount}</p>
    `,
    attachments: [
      {
        filename: `${booking.reference}.png`,
        content: booking.qrData.split(",")[1],
        encoding: "base64"
      }
    ]
  });
}

module.exports = {
  confirmBooking,
  emailBooking
};