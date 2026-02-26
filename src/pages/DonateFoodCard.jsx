import { useState } from "react";
import "./DonateFoodCard.css";

const DonateFoodCard = ({ onClose, refresh }) => {
  const [items, setItems] = useState([{ name: "", serves: "" }]);
  const [bestBefore, setBestBefore] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [instructions, setInstructions] = useState("");
  const token = localStorage.getItem("token");

  const handleChange = (i, field, value) => {
    const copy = [...items];
    copy[i][field] = value;
    setItems(copy);
  };

  const addItem = () => setItems([...items, { name: "", serves: "" }]);
  const removeItem = (i) => setItems(items.filter((_, index) => index !== i));

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          bestBefore: `${bestBefore} hours`,   // e.g. "12 hours"
          location,
          city,
          instructions,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create donation");
      }

      await res.json();
      refresh();
      onClose();
    } catch (err) {
      console.error("Error submitting donation:", err);
      alert(err.message);
    }
  };

  return (
    <div className="donate-overlay">
      <div className="donate-card">
        <button className="donate-close" onClick={onClose}>✕</button>
        <h2>🍽 Donate Food</h2>

        <form onSubmit={submitHandler} className="donate-form">
          {items.map((item, i) => (
            <div className="donate-item-row" key={i}>
              <span>🍲</span>
              <input
                type="text"
                placeholder="Food Item"
                value={item.name}
                required
                onChange={(e) => handleChange(i, "name", e.target.value)}
              />
              <span>🥣</span>
              <input
                type="number"
                placeholder="Serves"
                value={item.serves}
                required
                onChange={(e) => handleChange(i, "serves", e.target.value)}
              />
              {items.length > 1 && (
                <button type="button" className="donate-remove-btn" onClick={() => removeItem(i)}>✕</button>
              )}
            </div>
          ))}

          <button type="button" className="donate-add-btn" onClick={addItem}>+ Add Item</button>

          {/* ── BEST BEFORE (hours) ── */}
          <div className="donate-extra-row">
            <span>⏰</span>
            <div className="donate-hours-wrap">
              <input
                type="number"
                className="donate-hours-input"
                placeholder="e.g. 12"
                min="1"
                max="72"
                value={bestBefore}
                required
                onChange={(e) => setBestBefore(e.target.value)}
              />
              <span className="donate-hours-unit">hours</span>
            </div>
          </div>

          <div className="donate-extra-row">
            <span>🏙️</span>
            <input
              type="text"
              placeholder="City"
              value={city}
              required
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="donate-extra-row">
            <span>📍</span>
            <input
              type="text"
              placeholder="Pickup Location"
              value={location}
              required
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="donate-extra-row">
            <span>📝</span>
            <textarea
              placeholder="Special Instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <button type="submit" className="donate-submit-btn">Submit Donation</button>
        </form>
      </div>
    </div>
  );
};

export default DonateFoodCard;