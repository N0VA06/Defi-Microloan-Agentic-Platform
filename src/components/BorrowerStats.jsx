import React from 'react'

function BorrowerStats({ stats }) {
  const getReputationColor = (rep) => {
    if (rep >= 80) return '#28a745'
    if (rep >= 60) return '#ffc107'
    return '#dc3545'
  }

  return (
    <div className="card stats-card">
      <h2>Your Borrowing Statistics</h2>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Reputation Score</span>
          <span 
            className="stat-value large" 
            style={{ color: getReputationColor(stats.reputation) }}
          >
            {stats.reputation}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Borrowed</span>
          <span className="stat-value">{stats.totalBorrowed} ETH</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Repaid</span>
          <span className="stat-value">{stats.totalRepaid} ETH</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Outstanding</span>
          <span className="stat-value" style={{ color: parseFloat(stats.outstandingAmount) > 0 ? '#dc3545' : '#28a745' }}>
            {stats.outstandingAmount} ETH
          </span>
        </div>
      </div>
    </div>
  )
}

export default BorrowerStats