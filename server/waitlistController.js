const Waitlist = require("../models/Waitlist");

async function join(req, res) {
  const { eventId, category } = req.body;

  const duplicate = await Waitlist.findOne({
    event: eventId,
    customer: req.user.id,
    category,
    status: {
      $in: ["waiting", "offered"]
    }
  });

  if (duplicate) {
    return res
      .status(409)
      .json({
        message: "Already on waitlist"
      });
  }

  res.status(201).json(
    await Waitlist.create({
      event: eventId,
      customer: req.user.id,
      category
    })
  );
}

async function mine(req, res) {
  res.json(
    await Waitlist.find({
      customer: req.user.id
    })
      .populate(
        "event",
        "title startAt"
      )
      .populate(
        "offeredSeat",
        "row number seatKey category"
      )
      .sort({
        createdAt: -1
      })
  );
}

async function cancel(req, res) {
  const w =
    await Waitlist.findOneAndUpdate(
      {
        _id: req.params.id,
        customer: req.user.id,
        status: "waiting"
      },
      {
        $set: {
          status: "cancelled"
        }
      },
      {
        new: true
      }
    );

  res.json(
    w || {
      message: "Waitlist entry not found"
    }
  );
}

async function offerBook(req, res) {
  const { token } = req.body;

  const w = await Waitlist.findOne({
    _id: req.params.id,
    customer: req.user.id,
    status: "offered",
    offerToken: token
  });

  if (
    !w ||
    !w.offerExpiresAt ||
    w.offerExpiresAt <= new Date()
  ) {
    return res
      .status(410)
      .json({
        message: "Offer expired"
      });
  }

  req.body.eventId = w.event;
  req.body.seatIds = [w.offeredSeat];
  req.body.waitlistId = w._id;

  const {
    confirmBooking,
    emailBooking
  } = require("../services/bookingService");

  try {
    const b = await confirmBooking({
      userId: req.user.id,
      eventId: w.event,
      seatIds: [w.offeredSeat],
      waitlistId: w._id
    });

    await emailBooking(b);

    res.status(201).json(b);
  } catch (e) {
    res.status(409).json({
      message: e.message
    });
  }
}

module.exports = {
  join,
  mine,
  cancel,
  offerBook
};