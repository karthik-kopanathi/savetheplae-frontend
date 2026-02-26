import { useEffect, useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  FaChartBar, FaFireAlt, FaCheckCircle, FaClock, FaLeaf,
} from "react-icons/fa";
import "./DonorAnalytics.css";

/* ─── HELPERS ─── */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const getMonthKey = (dateStr) => {
  const d = new Date(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const getLast6Months = () => {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(`${MONTHS[d.getMonth()]} ${d.getFullYear()}`);
  }
  return result;
};

/* ─── CUSTOM TOOLTIP ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="da-tooltip">
      <p className="da-tooltip__label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="da-tooltip__value" style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

/* ─── MAIN COMPONENT ─── */
const DonorAnalytics = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/donations/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDonations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  /* ─── DERIVED DATA ─── */
  const stats = useMemo(() => {
    const total     = donations.length;
    const accepted  = donations.filter(d => d.status === "accepted").length;
    const completed = donations.filter(d => d.status === "completed").length;
    const pending   = donations.filter(d => d.status === "pending").length;
    const serves    = donations.reduce(
      (sum, d) => sum + d.items.reduce((s, i) => s + Number(i.serves || 0), 0), 0
    );
    const acceptRate = total ? Math.round((accepted + completed) / total * 100) : 0;
    return { total, accepted, completed, pending, serves, acceptRate };
  }, [donations]);

  // Donations per month (last 6 months)
  const monthlyData = useMemo(() => {
    const months = getLast6Months();
    const map = {};
    months.forEach(m => { map[m] = { month: m, donations: 0, serves: 0 }; });
    donations.forEach(d => {
      const key = getMonthKey(d.donationDate);
      if (map[key]) {
        map[key].donations++;
        map[key].serves += d.items.reduce((s, i) => s + Number(i.serves || 0), 0);
      }
    });
    return months.map(m => map[m]);
  }, [donations]);

  // Status breakdown for pie
  const statusData = useMemo(() => [
    { name: "Completed", value: stats.completed, color: "#2d5a27" },
    { name: "Accepted",  value: stats.accepted,  color: "#e8651a" },
    { name: "Pending",   value: stats.pending,   color: "#c9a84c" },
  ].filter(d => d.value > 0), [stats]);

  // Top food items donated
  const topItems = useMemo(() => {
    const map = {};
    donations.forEach(d => {
      d.items.forEach(item => {
        const key = item.name.toLowerCase();
        map[key] = (map[key] || 0) + 1;
      });
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [donations]);

  if (loading) return <div className="da-loader">Loading...</div>;

  return (
    <div className="da-page">

      {/* HEADER */}
      <div className="da-header">
        <div>
          <h1 className="da-header__title"><FaChartBar /> Analytics</h1>
          <p className="da-header__sub">Your donation impact at a glance</p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="da-stats-grid">
        <div className="da-stat da-stat--blue">
          <div className="da-stat__icon-wrap da-stat__icon-wrap--blue">
            <FaChartBar />
          </div>
          <div>
            <span className="da-stat__label">Total Donations</span>
            <p className="da-stat__value">{stats.total}</p>
          </div>
        </div>
        <div className="da-stat da-stat--green">
          <div className="da-stat__icon-wrap da-stat__icon-wrap--green">
            <FaCheckCircle />
          </div>
          <div>
            <span className="da-stat__label">Completed</span>
            <p className="da-stat__value">{stats.completed}</p>
          </div>
        </div>
        <div className="da-stat da-stat--orange">
          <div className="da-stat__icon-wrap da-stat__icon-wrap--orange">
            <FaClock />
          </div>
          <div>
            <span className="da-stat__label">Pending</span>
            <p className="da-stat__value">{stats.pending}</p>
          </div>
        </div>
        <div className="da-stat da-stat--purple">
          <div className="da-stat__icon-wrap da-stat__icon-wrap--purple">
            <FaLeaf />
          </div>
          <div>
            <span className="da-stat__label">Serves Helped</span>
            <p className="da-stat__value">{stats.serves}</p>
          </div>
        </div>
      </div>

      {/* ACCEPTANCE RATE */}
      <div className="da-rate-card">
        <div className="da-rate-card__left">
          <FaFireAlt className="da-rate-card__fire" />
          <div>
            <p className="da-rate-card__label">Acceptance Rate</p>
            <p className="da-rate-card__value">{stats.acceptRate}%</p>
            <p className="da-rate-card__sub">
              {stats.accepted + stats.completed} of {stats.total} donations picked up
            </p>
          </div>
        </div>
        <div className="da-rate-bar-wrap">
          <div className="da-rate-bar" style={{ width: `${stats.acceptRate}%` }} />
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="da-charts-row">

        {/* Monthly Donations — Area Chart */}
        <div className="da-chart-card da-chart-card--wide">
          <h3 className="da-chart-card__title">Donations Over Time</h3>
          <p className="da-chart-card__sub">Last 6 months</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="donationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e8651a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#e8651a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="servesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2d5a27" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2d5a27" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7a7a6a" }} />
              <YAxis tick={{ fontSize: 11, fill: "#7a7a6a" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="donations" name="Donations" stroke="#e8651a" strokeWidth={2} fill="url(#donationGrad)" dot={{ r: 4, fill: "#e8651a" }} />
              <Area type="monotone" dataKey="serves"    name="Serves"    stroke="#2d5a27" strokeWidth={2} fill="url(#servesGrad)"    dot={{ r: 4, fill: "#2d5a27" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown — Pie Chart */}
        <div className="da-chart-card">
          <h3 className="da-chart-card__title">Status Breakdown</h3>
          <p className="da-chart-card__sub">All time</p>
          {statusData.length === 0 ? (
            <div className="da-chart-empty">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* Top Food Items — Bar Chart */}
      {topItems.length > 0 && (
        <div className="da-chart-card da-chart-card--full">
          <h3 className="da-chart-card__title">Most Donated Food Items</h3>
          <p className="da-chart-card__sub">By frequency</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topItems} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#7a7a6a" }} />
              <YAxis tick={{ fontSize: 11, fill: "#7a7a6a" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Times Donated" radius={[6, 6, 0, 0]}>
                {topItems.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? "#e8651a" : "#2d5a27"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* No data fallback */}
      {donations.length === 0 && (
        <div className="da-empty">
          <p>No donations yet. Start donating to see your analytics here.</p>
        </div>
      )}

    </div>
  );
};

export default DonorAnalytics;