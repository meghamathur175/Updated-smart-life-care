// PaymentHistory.js
import React, { useState } from "react";
import "../styles/PaymentHistory.css";

function PaymentHistory() {
  const allPayments = [
    { id: 1, amount: 1200, date: "2025-05-11", commission: 100 },
    { id: 2, amount: 1500, date: "2025-05-12", commission: 150 },
    { id: 3, amount: 1300, date: "2025-04-28", commission: 120 },
  ];

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredPayments = allPayments.filter((p) => {
    const paymentDate = new Date(p.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (
      (!start || paymentDate >= start) &&
      (!end || paymentDate <= end)
    );
  });

  return (
    <div className="payment-history-container">
      <div className="payment-card">
        <h2>💰 Payment History</h2>

        <div className="filter-section">
          <label>
            From:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            To:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>

        <table className="payment-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Amount (₹)</th>
              <th>Commission (₹)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.amount}</td>
                <td>{p.commission}</td>
                <td>{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentHistory;
