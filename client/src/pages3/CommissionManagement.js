import React, { useState } from "react";
import "../styles/CommissionManagement.css";

const initialPartners = [
  { id: 1, name: "Partner A", commission: 3.5 },
  { id: 2, name: "Partner B", commission: 4.0 },
  { id: 3, name: "Partner C", commission: 5.0 },
];

const CommissionManager = () => {
  const [partners, setPartners] = useState(initialPartners);

  const handleCommissionChange = (id, value) => {
    const commission = parseFloat(value);
    if (commission >= 3 && commission <= 5) {
      setPartners((prev) =>
        prev.map((p) => (p.id === id ? { ...p, commission } : p))
      );
    }
  };

  return (
    <div className="commission-wrapper">
      <div className="commission-card">
        <h2>Commission Management</h2>
        <div className="partner-list">
          {partners.map((partner) => (
            <div className="partner-item" key={partner.id}>
              <div className="partner-info">
                <span className="partner-name">{partner.name}</span>
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="5"
                  value={partner.commission}
                  onChange={(e) =>
                    handleCommissionChange(partner.id, e.target.value)
                  }
                />
                <span className="percent-label">%</span>
              </div>
            </div>
          ))}
        </div>
        <p className="note">* Commission rate must be between 3% and 5%</p>
      </div>
    </div>
  );
};

export default CommissionManager;