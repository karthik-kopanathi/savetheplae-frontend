import { useEffect, useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  FaChartBar, FaFireAlt, FaCheckCircle, FaTruck,
  FaUtensils, FaUsers, FaBox,
} from "react-icons/fa";
import "./OrphanageAnalytics.css";

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
    <div className="oa-tooltip">
      <p className="oa-tooltip__label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="oa-tooltip__value" style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const OrphanageAnalytics = () => {
  const [donations, setDonations] = useState([]);
  const [orphanage, setOrphanage] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, dashRes] = await Promise.all([
          fetch("https://savetheplae-backend.onrender.com/api/dashboard/me",                      { headers: { Authorization: `Bearer ${token}` } }),
          fetch("https://savetheplae-backend.onrender.com/api/dashboard/orphanage-dashboard",     { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const profile = await profileRes.json();
        setOrphanage(profile.user || profile);
        const data = await dashRes.json();
        setDonations(data.myDonations || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const stats = useMemo(() => {
    const received = donations.filter(d => d.orphanageStatus === "received" || d.status === "completed").length;
    const upcoming = donations.filter(d => d.orphanageStatus === "upcoming" || d.status === "accepted").length;
    const serves   = donations
      .filter(d => d.orphanageStatus === "received" || d.status === "completed")
      .reduce((s, d) => {
        if (d.myDonatedItems?.length) {
          return s + d.myDonatedItems.reduce((ss, di) => {
            const item = d.items[di.itemIndex];
            return ss + (Number(item?.serves) || 0);
          }, 0);
        }
        return s + d.items.reduce((ss, i) => ss + (Number(i.serves) || 0), 0);
      }, 0);
    return { total: donations.length, received, upcoming, serves };
  }, [donations]);

  const monthlyData = useMemo(() => {
    const months = getLast6Months();
    const map = {};
    months.forEach(m => { map[m] = { month: m, received: 0, serves: 0 }; });
    donations
      .filter(d => d.orphanageStatus === "received" || d.status === "completed")
      .forEach(d => {
        const key = getMonthKey(d.donationDate);
        if (map[key]) {
          map[key].received++;
          map[key].serves += d.items.reduce((s, i) => s + Number(i.serves || 0), 0);
        }
      });
    return months.map(m => map[m]);
  }, [donations]);

  const statusData = useMemo(() => [
    { name: "Received",  value: stats.received,  color: "#2d5a27" },
    { name: "Upcoming",  value: stats.upcoming,  color: "#e8651a" },
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

  if (loading) return <div className="oa-loader">Loading...</div>;

  const receiveRate = stats.total ? Math.round(stats.received / stats.total * 100) : 0;
  const orphanageName = orphanage?.orphanageName || orphanage?.name || "Orphanage";

  return (
    <div className="oa-page">

      <div className="oa-header">
        <div>
          <h1 className="oa-header__title"><FaChartBar /> Analytics</h1>
          <p className="oa-header__sub">{orphanageName} · Food impact overview</p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="oa-stats-grid">
        <div className="oa-stat oa-stat--blue">
          <div className="oa-stat__icon-wrap oa-stat__icon-wrap--blue"><FaBox /></div>
          <div>
            <span className="oa-stat__label">Total Donations</span>
            <p className="oa-stat__value">{stats.total}</p>
          </div>
        </div>
        <div className="oa-stat oa-stat--green">
          <div className="oa-stat__icon-wrap oa-stat__icon-wrap--green"><FaCheckCircle /></div>
          <div>
            <span className="oa-stat__label">Received</span>
            <p className="oa-stat__value">{stats.received}</p>
          </div>
        </div>
        <div className="oa-stat oa-stat--orange">
          <div className="oa-stat__icon-wrap oa-stat__icon-wrap--orange"><FaTruck /></div>
          <div>
            <span className="oa-stat__label">Upcoming</span>
            <p className="oa-stat__value">{stats.upcoming}</p>
          </div>
        </div>
        <div className="oa-stat oa-stat--purple">
          <div className="oa-stat__icon-wrap oa-stat__icon-wrap--purple"><FaUtensils /></div>
          <div>
            <span className="oa-stat__label">Serves Received</span>
            <p className="oa-stat__value">{stats.serves}</p>
          </div>
        </div>
      </div>

      {/* RECEIVE RATE */}
      <div className="oa-rate-card">
        <div className="oa-rate-card__left">
          <FaFireAlt className="oa-rate-card__fire" />
          <div>
            <p className="oa-rate-card__label">Receive Rate</p>
            <p className="oa-rate-card__value">{receiveRate}%</p>
            <p className="oa-rate-card__sub">{stats.received} of {stats.total} donations fully received</p>
          </div>
        </div>
        <div className="oa-rate-bar-wrap">
          <div className="oa-rate-bar" style={{ width: `${receiveRate}%` }} />
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="oa-charts-row">
        <div className="oa-chart-card oa-chart-card--wide">
          <h3 className="oa-chart-card__title">Donations Over Time</h3>
          <p className="oa-chart-card__sub">Last 6 months</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="oaReceivedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e8651a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#e8651a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="oaServesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2d5a27" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2d5a27" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7a7a6a" }} />
              <YAxis tick={{ fontSize: 11, fill: "#7a7a6a" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="received" name="Received" stroke="#e8651a" strokeWidth={2} fill="url(#oaReceivedGrad)" dot={{ r: 4, fill: "#e8651a" }} />
              <Area type="monotone" dataKey="serves"   name="Serves"   stroke="#2d5a27" strokeWidth={2} fill="url(#oaServesGrad)"   dot={{ r: 4, fill: "#2d5a27" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="oa-chart-card">
          <h3 className="oa-chart-card__title">Status Breakdown</h3>
          <p className="oa-chart-card__sub">All time</p>
          {statusData.length === 0 ? (
            <div className="oa-chart-empty">No data yet</div>
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
        <div className="oa-chart-card oa-chart-card--full">
          <h3 className="oa-chart-card__title">Most Received Food Items</h3>
          <p className="oa-chart-card__sub">By frequency</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topItems} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#7a7a6a" }} />
              <YAxis tick={{ fontSize: 11, fill: "#7a7a6a" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Times Received" radius={[6, 6, 0, 0]}>
                {topItems.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? "#e8651a" : "#2d5a27"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {donations.length === 0 && (
        <div className="oa-empty"><p>No donations yet. Request food from NGOs to start tracking your impact.</p></div>
      )}

    </div>
  );
};

export default OrphanageAnalytics;