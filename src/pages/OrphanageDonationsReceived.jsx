import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHandHoldingHeart, FaUtensils, FaUsers, FaCalendarAlt,
  FaInfoCircle, FaSearch, FaChevronLeft, FaChevronRight,
} from "react-icons/fa";
import "./OrphanageDonationsReceived.css";

const PAGE_SIZE = 10;

const OrphanageDonationsReceived = () => {
  const navigate = useNavigate();

  const [allDonations, setAllDonations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);

  const token = localStorage.getItem("token");

  const fetchDonations = useCallback(async () => {
    try {
      const res  = await fetch("https://savetheplae-backend.onrender.com/api/dashboard/orphanage-dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const received = (data.myDonations || [])
        .filter(d =>
          d.orphanageStatus === "received" ||
          (!d.orphanageStatus && d.status === "completed")
        )
        .sort((a, b) => {
          const ta = new Date(
            a.myDonatedItems?.[0]?.deliveredAt || a.updatedAt || a.donationDate
          );
          const tb = new Date(
            b.myDonatedItems?.[0]?.deliveredAt || b.updatedAt || b.donationDate
          );
          return tb - ta;
        });
      setAllDonations(received);
    } catch (err) {
      console.error("OrphanageDonationsReceived fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  /* ─── helpers ─── */
  const getSource = (d) => {
    if (d.acceptedBy?.ngoName) return d.acceptedBy.ngoName;
    if (d.donor?.name)         return `Donor: ${d.donor.name}`;
    return "—";
  };

  const getFoodNames = (d) => {
    if (d.myDonatedItems?.length) {
      return d.myDonatedItems
        .map(di => di.itemName || d.items[di.itemIndex]?.name)
        .filter(Boolean).join(", ");
    }
    return d.items.map(i => i.name).join(", ");
  };

  const getServes = (d) => {
    if (d.myDonatedItems?.length) {
      return d.myDonatedItems.reduce((s, di) => {
        const item = d.items[di.itemIndex];
        return s + (Number(item?.serves) || 0);
      }, 0);
    }
    return d.items.reduce((s, i) => s + (Number(i.serves) || 0), 0);
  };

  const getReceivedDate = (d) => {
    const raw =
      d.myDonatedItems?.[0]?.deliveredAt ||
      d.updatedAt ||
      d.donationDate;
    return raw
      ? new Date(raw).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        })
      : "—";
  };

  /* ─── filter + paginate ─── */
  const filtered = allDonations.filter(d => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      getFoodNames(d).toLowerCase().includes(q) ||
      getSource(d).toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalServes = allDonations.reduce((s, d) => s + getServes(d), 0);

  if (loading) return <div className="odr-loader">Loading...</div>;

  return (
    <div className="odr-page">

      {/* ── HEADER ── */}
      <div className="odr-header">
        <div className="odr-header__left">
          <button className="odr-back-btn" onClick={() => navigate("/orphanage-dashboard")}>
            <FaChevronLeft /> Dashboard
          </button>
          <div>
            <h1 className="odr-header__title">
              <FaHandHoldingHeart /> Donations Received
            </h1>
            <p className="odr-header__sub">
              {allDonations.length} donation{allDonations.length !== 1 ? "s" : ""} · {totalServes} serves total
            </p>
          </div>
        </div>

        {/* search */}
        <div className="odr-search-wrap">
          <FaSearch className="odr-search-icon" />
          <input
            className="odr-search"
            placeholder="Search by food or source…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div className="odr-card">
        {filtered.length === 0 ? (
          <div className="odr-empty">
            {search ? "No donations match your search." : "No received donations yet."}
          </div>
        ) : (
          <>
            <div className="odr-table">

              {/* head */}
              <div className="odr-table__row odr-table__row--head">
                <span><FaUtensils /> Food Items</span>
                <span><FaUsers /> Serves</span>
                <span>From</span>
                <span><FaCalendarAlt /> Received On</span>
                <span><FaInfoCircle /> Status</span>
              </div>

              {/* rows */}
              {paginated.map(d => (
                <div className="odr-table__row" key={d._id}>
                  <span className="odr-food-name">{getFoodNames(d)}</span>
                  <span className="odr-serves">{getServes(d)}</span>
                  <span className="odr-source">{getSource(d)}</span>
                  <span className="odr-date">{getReceivedDate(d)}</span>
                  <span>
                    <span className="odr-badge odr-badge--received">Received ✓</span>
                  </span>
                </div>
              ))}
            </div>

            {/* pagination */}
            {totalPages > 1 && (
              <div className="odr-pagination">
                <button
                  className="odr-page-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <FaChevronLeft />
                </button>
                <span className="odr-page-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="odr-page-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrphanageDonationsReceived;