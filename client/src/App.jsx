import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "./index.css";

function App() {
  const [bookings, setBookings] = useState([]);
  const [customer, setCustomer] = useState("");
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("");
  const [editId, setEditId] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [notification, setNotification] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  // Fetch data
  const fetchBookings = async () => {
    const res = await axios.get("http://localhost:5000/bookings");
    setBookings(res.data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Notification
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Animated counter
  const useCounter = (value) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const duration = 800;
      const increment = value / (duration / 10);

      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          start = value;
          clearInterval(timer);
        }
        setCount(Math.floor(start));
      }, 10);

      return () => clearInterval(timer);
    }, [value]);

    return count;
  };

  const totalRevenue = bookings.reduce(
    (sum, b) => sum + Number(b.amount),
    0
  );

  const animatedBookings = useCounter(bookings.length);
  const animatedRevenue = useCounter(totalRevenue);
  const animatedServices = useCounter(
    new Set(bookings.map(b => b.service)).size
  );

  const handleSubmit = async () => {
    if (!customer || !service || !amount) return;

    const data = { customer, service, amount };

    if (editId) {
      await axios.put(`http://localhost:5000/bookings/${editId}`, data);
      showNotification("Booking Updated!");
    } else {
      await axios.post("http://localhost:5000/bookings", data);
      showNotification("Booking Added!");
    }

    setCustomer("");
    setService("");
    setAmount("");
    setEditId(null);
    fetchBookings();
  };

  const deleteBooking = async (id) => {
    await axios.delete(`http://localhost:5000/bookings/${id}`);
    showNotification("Booking Deleted!");
    fetchBookings();
  };

  if (!loggedIn) {
    return (
      <div className="login fade-in">
        <div className="glass login-box">
          <h2>Admin Login</h2>
          <input placeholder="Username" />
          <input type="password" placeholder="Password" />
          <button className="btn-primary" onClick={() => setLoggedIn(true)}>
            Login
          </button>
        </div>
      </div>
    );
  }

  const chartData = bookings.map(b => ({
    name: b.customer,
    amount: b.amount
  }));

  return (
    <div className={`app ${theme}`}>
      {notification && (
        <div className="notification fade-in">{notification}</div>
      )}

      <div className="background">
        <span></span><span></span><span></span><span></span><span></span>
      </div>

      <div className="layout">
        <div className="sidebar">
          <h2>Admin</h2>
          <button>Dashboard</button>
          <button>Bookings</button>
          <button>Analytics</button>
          <button onClick={() =>
            setTheme(theme === "dark" ? "light" : "dark")
          }>
            Toggle Theme
          </button>
        </div>

        <div className="main container">
          <h1 className="title">Admin Dashboard</h1>

          <div className="cards fade-in">
            <div className="glass card">
              <h2>Total Bookings</h2>
              <p>{animatedBookings}</p>
            </div>

            <div className="glass card">
              <h2>Total Revenue</h2>
              <p>₹ {animatedRevenue}</p>
            </div>

            <div className="glass card">
              <h2>Unique Services</h2>
              <p>{animatedServices}</p>
            </div>
          </div>

          <div className="glass form-section fade-in">
            <h2>{editId ? "Edit Booking" : "Add Booking"}</h2>
            <div className="form-row">
              <input
                placeholder="Customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
              />
              <input
                placeholder="Service"
                value={service}
                onChange={(e) => setService(e.target.value)}
              />
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button className="btn-primary" onClick={handleSubmit}>
                {editId ? "Update" : "Add"}
              </button>
            </div>
          </div>

          <div className="glass table-section fade-in">
            <h2>Bookings</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, index) => (
                  <tr key={b._id}>
                    <td>{index + 1}</td>
                    <td>{b.customer}</td>
                    <td>{b.service}</td>
                    <td>₹ {b.amount}</td>
                    <td>
                      <button
                        className="btn-warning"
                        onClick={() => {
                          setCustomer(b.customer);
                          setService(b.service);
                          setAmount(b.amount);
                          setEditId(b._id);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => deleteBooking(b._id)}
                        style={{ marginLeft: "10px" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass fade-in">
            <h2>Revenue Chart</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="amount"
                  fill="#38bdf8"
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
