import './ProgressBar.css';

export default function ProgressBar({ label, percentage }) {
  return (
    <div className="progress-bar-container">
      <div className="progress-label">{label}</div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
