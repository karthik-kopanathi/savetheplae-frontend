import { useEffect, useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  FaChartBar, FaFireAlt, FaCheckCircle, FaWarehouse,
  FaTruck, FaUsers, FaHandHoldingHeart,
} from "react-icons/fa";
import "./NgoAnalytics.css";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const getMonthKey = (d) => { const dt = new Date(d); return `${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`; };
const getLast6Months = () => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="nga-tooltip">
      <p className="nga-tooltip__label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="nga-tooltip__value" style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const NgoAnalytics = () => {
  const [donations, setDonations] = useState([]);
  const [ngo,       setNgo]       = useState(null);
  const [loading,   setLoading]   = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, donRes] = await Promise.all([
          fetch("http://localhost:5000/api/dashboard/me",           { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/dashboard/ngo-dashboard", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const profile = await profileRes.json();
        setNgo(profile);
        const data = await donRes.json();
        setDonations(data.myDonations || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const stats = useMemo(() => {
    const total     = donations.length;
    const completed = donations.filter(d => d.status === "completed").length;
    const pending   = donations.filter(d => d.status === "accepted").length;
    const serves    = donations.reduce((s, d) => s + d.items.reduce((ss, i) => ss + Number(i.serves || 0), 0), 0);

    // food stock items = completed donations' items minus donated ones
    const stockItems = donations
      .filter(d => d.status === "completed")
      .flatMap(d => {
        const di = new Set((d.donatedItems || []).map(x => x.itemIndex));
        return d.items.filter((_, idx) => !di.has(idx));
      }).length;

    const deliveries = donations.filter(d =>
      (d.donatedItems || []).some(di => di.status === "delivered")
    ).length;

    return { total, completed, pending, serves, stockItems, deliveries };
  }, [donations]);

  const monthlyData = useMemo(() => {
    const months = getLast6Months();
    const map = {};
    months.forEach(m => { map[m] = { month: m, pickups: 0, serves: 0 }; });
    donations.forEach(d => {
      const key = getMonthKey(d.donationDate);
      if (map[key]) {
        map[key].pickups++;
        map[key].serves += d.items.reduce((s, i) => s + Number(i.serves || 0), 0);
      }
    });
    return months.map(m => map[m]);
  }, [donations]);

  const statusData = useMemo(() => [
    { name: "Completed", value: stats.completed, color: "#2d5a27" },
    { name: "In Progress", value: stats.pending, color: "#e8651a" },
  ].filter(d => d.value > 0), [stats]);

  const topItems = useMemo(() => {
    const map = {};
    donations.forEach(d => d.items.forEach(item => {
      const k = item.name.toLowerCase();
      map[k] = (map[k] || 0) + 1;
    }));
    return Object.entries(map)
      .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))
      .sort((a, b) => b.count - a.count).slice(0, 6);
  }, [donations]);

  if (loading) return <div className="nga-loader">Loading...</div>;

  const completionRate = stats.total ? Math.round(stats.completed / stats.total * 100) : 0;

  return (
    <div className="nga-page">

      <div className="nga-header">
        <div>
          <h1 className="nga-header__title"><FaChartBar /> Analytics</h1>
          <p className="nga-header__sub">
            {ngo?.ngoName} · Impact overview
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="nga-stats-grid">
        <div className="nga-stat nga-stat--blue">
          <div className="nga-stat__icon-wrap nga-stat__icon-wrap--blue"><FaHandHoldingHeart /></div>
          <div>
            <span className="nga-stat__label">Total Pickups</span>
            <p className="nga-stat__value">{stats.total}</p>
          </div>
        </div>
        <div className="nga-stat nga-stat--green">
          <div className="nga-stat__icon-wrap nga-stat__icon-wrap--green"><FaCheckCircle /></div>
          <div>
            <span className="nga-stat__label">Completed</span>
            <p className="nga-stat__value">{stats.completed}</p>
          </div>
        </div>
        <div className="nga-stat nga-stat--orange">
          <div className="nga-stat__icon-wrap nga-stat__icon-wrap--orange"><FaWarehouse /></div>
          <div>
            <span className="nga-stat__label">Stock Items</span>
            <p className="nga-stat__value">{stats.stockItems}</p>
          </div>
        </div>
        <div className="nga-stat nga-stat--purple">
          <div className="nga-stat__icon-wrap nga-stat__icon-wrap--purple"><FaUsers /></div>
          <div>
            <span className="nga-stat__label">Serves Saved</span>
            <p className="nga-stat__value">{stats.serves}</p>
          </div>
        </div>
      </div>

      {/* COMPLETION RATE */}
      <div className="nga-rate-card">
        <div className="nga-rate-card__left">
          <FaFireAlt className="nga-rate-card__fire" />
          <div>
            <p className="nga-rate-card__label">Completion Rate</p>
            <p className="nga-rate-card__value">{completionRate}%</p>
            <p className="nga-rate-card__sub">{stats.completed} of {stats.total} donations fully processed</p>
          </div>
        </div>
        <div className="nga-rate-bar-wrap">
          <div className="nga-rate-bar" style={{ width: `${completionRate}%` }} />
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="nga-charts-row">
        <div className="nga-chart-card nga-chart-card--wide">
          <h3 className="nga-chart-card__title">Pickups Over Time</h3>
          <p className="nga-chart-card__sub">Last 6 months</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ngoPickupGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e8651a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#e8651a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ngoServesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2d5a27" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2d5a27" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7a7a6a" }} />
              <YAxis tick={{ fontSize: 11, fill: "#7a7a6a" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="pickups" name="Pickups" stroke="#e8651a" strokeWidth={2} fill="url(#ngoPickupGrad)" dot={{ r: 4, fill: "#e8651a" }} />
              <Area type="monotone" dataKey="serves"  name="Serves"  stroke="#2d5a27" strokeWidth={2} fill="url(#ngoServesGrad)"  dot={{ r: 4, fill: "#2d5a27" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="nga-chart-card">
          <h3 className="nga-chart-card__title">Status Breakdown</h3>
          <p className="nga-chart-card__sub">All time</p>
          {statusData.length === 0 ? (
            <div className="nga-chart-empty">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {topItems.length > 0 && (
        <div className="nga-chart-card nga-chart-card--full">
          <h3 className="nga-chart-card__title">Most Collected Food Items</h3>
          <p className="nga-chart-card__sub">By frequency</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topItems} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#7a7a6a" }} />
              <YAxis tick={{ fontSize: 11, fill: "#7a7a6a" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Times Collected" radius={[6, 6, 0, 0]}>
                {topItems.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? "#e8651a" : "#2d5a27"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {donations.length === 0 && (
        <div className="nga-empty"><p>No pickups yet. Start accepting donations to see analytics here.</p></div>
      )}

    </div>
  );
};

export default NgoAnalytics;