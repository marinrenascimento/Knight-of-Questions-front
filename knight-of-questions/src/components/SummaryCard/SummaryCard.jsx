import React from 'react';
import './SummaryCard.css';

export default function SummaryCard({ icon, value, label }) {
  return (
    <div className="summary-card">
      <div className="summary-icon">{icon}</div>
      <div className="summary-value pixel-text">{value}</div>
      <div className="summary-label">{label}</div>
    </div>
  );
}
