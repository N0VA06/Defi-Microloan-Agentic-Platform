import React, { useState } from 'react'

function LoanRequest({ onRequestLoan, loading, reputation }) {
  const [amount, setAmount] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (amount && parseFloat(amount) > 0) {
      onRequestLoan(amount)
      setAmount('')
    }
  }

  return (
    <div className="card">
      <h2>Request a Loan</h2>
      
      {reputation < 50 && (
        <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffeaa7',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          ⚠️ Your reputation is below 50. Loans will require manual approval.
        </div>
      )}
      
      <form className="loan-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="amount">Loan Amount (ETH)</label>
          <input
            type="number"
            id="amount"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in ETH"
            required
          />
        </div>
        
        <button type="submit" className="btn" disabled={loading}>
          {loading ? <span className="loading"></span> : 'Request Loan'}
        </button>
      </form>
    </div>
  )
}

export default LoanRequest