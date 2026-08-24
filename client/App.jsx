import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "./api";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [seats, setSeats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [waitlists, setWaitlists] = useState([]);
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState("customer@example.com");
  const [password, setPassword] = useState("Customer@123");

  const [waitlistCategory, setWaitlistCategory] = useState("");

  // ================================
  // LOGIN
  // ================================
  async function login(e) {
    e.preventDefault();

    try {
      const r = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", r.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(r.data.user)
      );

      setToken(r.data.token);
      setUser(r.data.user);
      setMessage("Logged in successfully");
    } catch (e) {
      setMessage(
        e.response?.data?.message || "Login failed"
      );
    }
  }

  // ================================
  // LOAD EVENTS
  // ================================
  async function load() {
    try {
      const r = await api.get("/events");
      setEvents(r.data);
    } catch (e) {
      setMessage(
        e.response?.data?.message ||
          "Could not load events"
      );
    }
  }

  // ================================
  // LOAD BOOKING HISTORY
  // ================================
  async function loadBookings() {
    if (!token) {
      setBookings([]);
      return;
    }

    try {
      const r = await api.get("/bookings/my");

      setBookings(
        Array.isArray(r.data)
          ? r.data
          : r.data.bookings || []
      );
    } catch (e) {
      console.log("Could not load bookings:", e);
    }
  }

  // ================================
  // LOAD WAITLIST
  // ================================
  async function loadWaitlists() {
    if (!token) {
      setWaitlists([]);
      return;
    }

    try {
      const r = await api.get("/waitlist/my");

      setWaitlists(
        Array.isArray(r.data)
          ? r.data
          : r.data.waitlists || []
      );
    } catch (e) {
      console.log("Could not load waitlist:", e);
    }
  }

  // ================================
  // OPEN EVENT / LOAD SEATS
  // ================================
  async function openEvent(id) {
    try {
      setSelected(id);

      const r = await api.get(
        `/events/${id}/seats`
      );

      const loadedSeats = r.data.map((seat) => ({
        ...seat,
        pick: false,
      }));

      setSeats(loadedSeats);

      const categories = [
        ...new Set(
          loadedSeats.map((seat) => seat.category)
        ),
      ];

      if (categories.length) {
        setWaitlistCategory(categories[0]);
      } else {
        setWaitlistCategory("");
      }
    } catch (e) {
      setMessage(
        e.response?.data?.message ||
          "Could not load seats"
      );
    }
  }

  // ================================
  // INITIAL LOAD
  // ================================
  useEffect(() => {
    load();
  }, []);

  // ================================
  // LOAD USER DATA
  // ================================
  useEffect(() => {
    if (token) {
      loadBookings();
      loadWaitlists();
    } else {
      setBookings([]);
      setWaitlists([]);
    }
  }, [token]);

  // ================================
  // SOCKET.IO
  // ================================
  useEffect(() => {
    if (!selected) return;

    const socket = io(
      API.replace(/\/api$/, "")
    );

    socket.emit("join-show", selected);

    socket.on("seat-updated", () => {
      api
        .get(`/events/${selected}/seats`)
        .then((r) => {
          setSeats((currentSeats) =>
            r.data.map((serverSeat) => {
              const oldSeat = currentSeats.find(
                (s) => s._id === serverSeat._id
              );

              return {
                ...serverSeat,
                pick: oldSeat?.pick || false,
              };
            })
          );

          loadWaitlists();
          loadBookings();
        })
        .catch(() => {});
    });

    return () => {
      socket.disconnect();
    };
  }, [selected]);

  // ================================
  // SELECT / DESELECT SEAT
  // ================================
  function toggle(id) {
    setSeats((currentSeats) =>
      currentSeats.map((seat) => {
        if (seat._id !== id) {
          return seat;
        }

        if (seat.status !== "available") {
          return seat;
        }

        return {
          ...seat,
          pick: !seat.pick,
        };
      })
    );
  }

  // ================================
  // HOLD SELECTED SEATS
  // ================================
  async function hold() {
    try {
      if (!token) {
        setMessage("Please login first");
        return;
      }

      if (!selected) {
        setMessage("Please select an event");
        return;
      }

      const ids = seats
        .filter(
          (seat) =>
            seat.pick &&
            seat.status === "available"
        )
        .map((seat) => seat._id);

      if (!ids.length) {
        setMessage(
          "Please select at least one available seat"
        );
        return;
      }

      const r = await api.post("/seats/hold", {
        eventId: selected,
        seatIds: ids,
      });

      setSeats((currentSeats) =>
        currentSeats.map((seat) =>
          ids.includes(seat._id)
            ? {
                ...seat,
                status: "held",
                holdExpiresAt: r.data.expiresAt,
                pick: true,
              }
            : seat
        )
      );

      setMessage(
        `Seats held until ${new Date(
          r.data.expiresAt
        ).toLocaleTimeString()}`
      );
    } catch (e) {
      setMessage(
        e.response?.data?.message ||
          "Hold failed"
      );
    }
  }

  // ================================
  // CONFIRM BOOKING
  // ================================
  async function book() {
    try {
      if (!token) {
        setMessage("Please login first");
        return;
      }

      if (!selected) {
        setMessage("Please select an event");
        return;
      }

      const ids = seats
        .filter(
          (seat) =>
            seat.pick &&
            seat.status === "held"
        )
        .map((seat) => seat._id);

      if (!ids.length) {
        setMessage(
          "Please hold at least one seat before confirming"
        );
        return;
      }

      const r = await api.post("/bookings", {
        eventId: selected,
        seatIds: ids,
      });

      setMessage(
        `Booking confirmed: ${
          r.data.reference ||
          r.data.booking?.reference ||
          "Success"
        }`
      );

      const seatResponse = await api.get(
        `/events/${selected}/seats`
      );

      setSeats(
        seatResponse.data.map((seat) => ({
          ...seat,
          pick: false,
        }))
      );

      await loadBookings();
      await loadWaitlists();
    } catch (e) {
      setMessage(
        e.response?.data?.message ||
          "Booking failed"
      );
    }
  }

  // ================================
  // CANCEL BOOKING
  // ================================
  async function cancelBooking(id) {
    try {
      const r = await api.post(
        `/bookings/${id}/cancel`
      );

      setMessage(
        r.data?.message ||
          "Booking cancelled successfully"
      );

      await loadBookings();
      await loadWaitlists();

      if (selected) {
        const seatResponse = await api.get(
          `/events/${selected}/seats`
        );

        setSeats(
          seatResponse.data.map((seat) => ({
            ...seat,
            pick: false,
          }))
        );
      }
    } catch (e) {
      setMessage(
        e.response?.data?.message ||
          "Could not cancel booking"
      );
    }
  }

  // ================================
  // JOIN WAITLIST
  // ================================
  async function joinWaitlist() {
    try {
      if (!token) {
        setMessage("Please login first");
        return;
      }

      if (!selected) {
        setMessage("Please select an event");
        return;
      }

      if (!waitlistCategory) {
        setMessage(
          "Please select a ticket category"
        );
        return;
      }

      await api.post("/waitlist", {
        eventId: selected,
        category: waitlistCategory,
      });

      setMessage(
        `Joined ${waitlistCategory} waitlist successfully`
      );

      await loadWaitlists();
    } catch (e) {
      setMessage(
        e.response?.data?.message ||
          "Could not join waitlist"
      );
    }
  }

  // ================================
  // CANCEL WAITLIST
  // ================================
  async function cancelWaitlist(id) {
    try {
      await api.post(
        `/waitlist/${id}/cancel`
      );

      setMessage("Waitlist entry cancelled");

      await loadWaitlists();
    } catch (e) {
      setMessage(
        e.response?.data?.message ||
          "Could not cancel waitlist"
      );
    }
  }

  // ================================
  // ACCEPT WAITLIST OFFER
  // ================================
  async function acceptOffer(waitlist) {
    try {
      if (!waitlist.offerToken) {
        setMessage(
          "Offer token is missing"
        );
        return;
      }

      const r = await api.post(
        `/waitlist/${waitlist._id}/offer-book`,
        {
          token: waitlist.offerToken,
        }
      );

      setMessage(
        `Waitlist booking confirmed: ${
          r.data.reference || "Success"
        }`
      );

      await loadBookings();
      await loadWaitlists();

      if (selected) {
        const seatResponse = await api.get(
          `/events/${selected}/seats`
        );

        setSeats(
          seatResponse.data.map((seat) => ({
            ...seat,
            pick: false,
          }))
        );
      }
    } catch (e) {
      setMessage(
        e.response?.data?.message ||
          "Could not accept waitlist offer"
      );
    }
  }

  // ================================
  // LOGOUT
  // ================================
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setBookings([]);
    setWaitlists([]);
    setSelected(null);
    setSeats([]);
    setMessage("Logged out");
  }

  // ================================
  // DERIVED SEAT INFORMATION
  // ================================

  const availableSeats = seats.filter(
    (seat) => seat.status === "available"
  );

  const categories = [
    ...new Set(
      seats.map((seat) => seat.category)
    ),
  ];

  // IMPORTANT:
  // A held seat selected by the current user
  // should NOT make the event appear sold out.
  const heldSelectedSeats = seats.filter(
    (seat) =>
      seat.status === "held" &&
      seat.pick === true
  );

  const hasHeldSelection =
    heldSelectedSeats.length > 0;

  const isSoldOut =
    seats.length > 0 &&
    availableSeats.length === 0 &&
    !hasHeldSelection;

  const selectedEvent = events.find(
    (event) => event._id === selected
  );

  // ================================
  // UI
  // ================================
  return (
    <div className="app">

      {/* ================= HEADER ================= */}
      <header>
        <h1>🎟️ Ticket Booking System</h1>

        <div>
          {user ? (
            <>
              <b>{user.name}</b>{" "}
              ({user.role}){" "}

              <button onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <form
              onSubmit={login}
              className="login"
            >
              <input
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="email"
              />

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="password"
              />

              <button type="submit">
                Login
              </button>
            </form>
          )}
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main>

        {/* ================= EVENTS ================= */}
        <section>
          <h2>Events</h2>

          <div className="events">
            {events.length === 0 ? (
              <p>No events available.</p>
            ) : (
              events.map((event) => (
                <article
                  key={event._id}
                  onClick={() =>
                    openEvent(event._id)
                  }
                >
                  <h3>{event.title}</h3>

                  <p>
                    {event.type} •{" "}
                    {new Date(
                      event.startAt
                    ).toLocaleString()}
                  </p>

                  <p>
                    {event.venue?.name}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>

        {/* ================= SEAT MAP ================= */}
        {selected && (
          <section className="seat-panel">

            <h2>Seat Map</h2>

            {selectedEvent && (
              <p>
                <strong>
                  {selectedEvent.title}
                </strong>
              </p>
            )}

            <p>
              Green = available • Yellow = held •
              Gray = booked
            </p>

            {/* LEGEND */}
            <div className="legend">
              <span className="available">
                Available
              </span>

              <span className="held">
                Held
              </span>

              <span className="booked">
                Booked
              </span>
            </div>

            {/* SEATS */}
            <div className="seats">
              {seats.map((seat) => (
                <button
                  key={seat._id}
                  disabled={
                    seat.status !== "available"
                  }
                  className={
                    seat.pick
                      ? "picked"
                      : seat.status
                  }
                  onClick={() =>
                    toggle(seat._id)
                  }
                  title={`${seat.row}${seat.number} - ${seat.category}`}
                >
                  {seat.row}
                  {seat.number}
                </button>
              ))}
            </div>

            {/* ================================
                HOLD / CONFIRM BOOKING
               ================================ */}

            {(!isSoldOut || hasHeldSelection) && (
              <div className="actions">

                {/* Show Hold only when no seat
                    is currently held */}
                {!hasHeldSelection && (
                  <button
                    onClick={hold}
                    disabled={
                      !token ||
                      seats.filter(
                        (seat) =>
                          seat.pick &&
                          seat.status === "available"
                      ).length === 0
                    }
                  >
                    Hold Selected
                  </button>
                )}

                {/* Show Confirm only after
                    successful hold */}
                {hasHeldSelection && (
                  <>
                    <p>
                      <strong>
                        Seats held until{" "}
                        {heldSelectedSeats[0]
                          .holdExpiresAt
                          ? new Date(
                              heldSelectedSeats[0]
                                .holdExpiresAt
                            ).toLocaleTimeString()
                          : "expiration"}
                      </strong>
                    </p>

                    <button
                      onClick={book}
                      disabled={!token}
                    >
                      Confirm Booking
                    </button>
                  </>
                )}

              </div>
            )}

            {/* ================================
                WAITLIST
               ================================ */}
            {isSoldOut && (
              <div
                className="waitlist-box"
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                <h3>Event Sold Out</h3>

                <p>
                  All seats are currently unavailable.
                  Join the waitlist and we'll offer you
                  a seat if one becomes available.
                </p>

                {!token ? (
                  <p>
                    Please login to join the waitlist.
                  </p>
                ) : (
                  <>
                    <label>
                      Ticket Category:
                    </label>

                    <select
                      value={waitlistCategory}
                      onChange={(e) =>
                        setWaitlistCategory(
                          e.target.value
                        )
                      }
                    >
                      {categories.map(
                        (category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        )
                      )}
                    </select>

                    <button
                      onClick={joinWaitlist}
                      style={{
                        marginLeft: "10px",
                      }}
                    >
                      Join Waitlist
                    </button>
                  </>
                )}
              </div>
            )}

          </section>
        )}

        {/* ================= WAITLIST HISTORY ================= */}
        {user && token && (
          <section className="waitlist-history">

            <h2>My Waitlist</h2>

            {waitlists.length === 0 ? (
              <p>
                You are not currently on any
                waitlists.
              </p>
            ) : (
              <div className="waitlists">

                {waitlists.map((w) => (
                  <article
                    className="waitlist-card"
                    key={w._id}
                    style={{
                      border: "1px solid #ccc",
                      padding: "15px",
                      marginBottom: "10px",
                      borderRadius: "8px",
                    }}
                  >

                    <h3>
                      {w.event?.title ||
                        "Event"}
                    </h3>

                    <p>
                      <strong>
                        Category:
                      </strong>{" "}
                      {w.category}
                    </p>

                    <p>
                      <strong>
                        Status:
                      </strong>{" "}
                      {w.status}
                    </p>

                    {w.offeredSeat && (
                      <p>
                        <strong>
                          Offered Seat:
                        </strong>{" "}
                        {typeof w.offeredSeat ===
                        "object"
                          ? `${w.offeredSeat.row || ""}${
                              w.offeredSeat.number || ""
                            }`
                          : w.offeredSeat}
                      </p>
                    )}

                    {w.status === "offered" && (
                      <>
                        <p>
                          A seat is available for
                          you!
                        </p>

                        {w.offerExpiresAt && (
                          <p>
                            <strong>
                              Offer expires:
                            </strong>{" "}
                            {new Date(
                              w.offerExpiresAt
                            ).toLocaleString()}
                          </p>
                        )}

                        <button
                          onClick={() =>
                            acceptOffer(w)
                          }
                        >
                          Accept Offer & Book
                        </button>
                      </>
                    )}

                    {w.status === "waiting" && (
                      <button
                        onClick={() =>
                          cancelWaitlist(w._id)
                        }
                      >
                        Leave Waitlist
                      </button>
                    )}

                  </article>
                ))}

              </div>
            )}

          </section>
        )}

        {/* ================= BOOKING HISTORY ================= */}
        {user && token && (
          <section className="booking-history">

            <h2>My Bookings</h2>

            {bookings.length === 0 ? (
              <p>No bookings yet.</p>
            ) : (
              <div className="bookings">

                {bookings.map((booking) => (
                  <article
                    className="booking-card"
                    key={booking._id}
                  >

                    <h3>
                      {booking.reference ||
                        "Booking"}
                    </h3>

                    <p>
                      <strong>
                        Event:
                      </strong>{" "}
                      {booking.event?.title ||
                        booking.eventTitle ||
                        "Event"}
                    </p>

                    <p>
                      <strong>
                        Status:
                      </strong>{" "}
                      {booking.status ||
                        "confirmed"}
                    </p>

                    <p>
                      <strong>
                        Total:
                      </strong>{" "}
                      ₹
                      {booking.amount ?? 0}
                    </p>

                    <p>
                      <strong>
                        Seats:
                      </strong>{" "}
                      {booking.seats?.length
                        ? booking.seats
                            .map(
                              (seat) =>
                                seat.seatKey ||
                                `${seat.row}${seat.number}`
                            )
                            .join(", ")
                        : booking.seatIds?.join(
                            ", "
                          ) || "N/A"}
                    </p>

                    {booking.createdAt && (
                      <p>
                        <strong>
                          Booked:
                        </strong>{" "}
                        {new Date(
                          booking.createdAt
                        ).toLocaleString()}
                      </p>
                    )}

                    {/* CANCEL BOOKING */}
                    {booking.status ===
                      "confirmed" && (
                      <button
                        onClick={() =>
                          cancelBooking(
                            booking._id
                          )
                        }
                        style={{
                          marginTop: "10px",
                        }}
                      >
                        Cancel Booking
                      </button>
                    )}

                  </article>
                ))}

              </div>
            )}

          </section>
        )}

      </main>

      {/* ================= MESSAGE ================= */}
      <footer>
        {message}
      </footer>

    </div>
  );
}

export default App;