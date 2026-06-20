import React from 'react';
import './BarChart.css';

export default function BarChart({ data, direction = 'horizontal' }) {

  if (direction === 'horizontal') {
    return (
      <div className="bar-chart horizontal">
        {data.map((item, index) => (
          <div key={index} className="bar-item-horizontal">
            <div className="bar-label">{item.label}</div>
            <div className="bar-track-wrapper">
              <div
                className="bar-fill"
                style={{ width: `${item.percentage}%` }}
              ></div>
              <span className="bar-value">{item.formattedValue}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bar-chart vertical">
      {data.map((item, index) => (
        <div key={index} className="bar-item-vertical">
          <span className="bar-value">{item.formattedValue}</span>
          <div className="bar-track-wrapper-vertical">
            <div
              className="bar-fill-vertical"
              style={{ height: `${item.percentage}%` }}
            ></div>
          </div>
          <div className="bar-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
