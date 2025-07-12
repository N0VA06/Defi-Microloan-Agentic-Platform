import React, { useState } from 'react'

function LoanRequest({ onRequestLoan, loading, reputation, outstandingAmount }) {
  const [amount, setAmount] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (amount && parseFloat(amount) > 0) {
      onRequestLoan(amount)
      setAmount('')
    }
  }

  const calculateMaxLoan = () => {
    const maxBasedOnReputation = (1000) / 100 // 1 ETH per 100 reputation points
    const currentOutstanding = parseFloat(outstandingAmount) || 0
    return Math.max(0, maxBasedOnReputation - currentOutstanding).toFixed(2)
  }

  const estimateTerms = () => {
    if (!amount || parseFloat(amount) <= 0) return null
    
    const loanAmount = parseFloat(amount)
    const isLargeLoan = loanAmount >= 1
    
    // Estimate interest rate based on reputation
    let interestRate = 20 - ((reputation - 50) * 15) / 50
    interestRate = Math.max(5, Math.min(20, interestRate))
    
    // Estimate duration
    let duration = 30
    if (reputation >= 80) duration += 15
    else if (reputation < 60) duration -= 10
    if (isLargeLoan) duration += 30
    duration = Math.max(15, Math.min(90, duration))
    
    // Estimate installments
    const numInstallments = isLargeLoan ? Math.min(6, Math.ceil(loanAmount / 0.5)) : 1
    
    // Calculate total with interest
    const totalAmount = loanAmount + (loanAmount * interestRate) / 100
    
    return {
      interestRate: interestRate.toFixed(1),
      duration,
      numInstallments,
      totalAmount: totalAmount.toFixed(3),
      installmentAmount: (totalAmount / numInstallments).toFixed(3)
    }
  }

  const terms = estimateTerms()

  return (
    <div className="card">
      <h2>Request a Loan</h2>
      
      <div className="loan-info-grid">
        <div className="info-item">
          <span className="info-label">Max Loan Amount:</span>
          <span className="info-value">{calculateMaxLoan()} ETH</span>
        </div>
        <div className="info-item">
          <span className="info-label">Outstanding Loans:</span>
          <span className="info-value">{outstandingAmount} ETH</span>
        </div>
      </div>
      
      {reputation < 50 && (
        <div className="warning-box">
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
            max={calculateMaxLoan()}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in ETH"
            required
          />
        </div>
        
        {terms && (
          <div className="loan-preview">
            <h3>Estimated Loan Terms:</h3>
            <div className="preview-grid">
              <div className="preview-item">
                <span>Interest Rate:</span>
                <span>{terms.interestRate}%</span>
              </div>
              <div className="preview-item">
                <span>Duration:</span>
                <span>{terms.duration} days</span>
              </div>
              <div className="preview-item">
                <span>Installments:</span>
                <span>{terms.numInstallments}</span>
              </div>
              <div className="preview-item">
                <span>Total Amount:</span>
                <span>{terms.totalAmount} ETH</span>
              </div>
              {terms.numInstallments > 1 && (
                <div className="preview-item">
                  <span>Per Installment:</span>
                  <span>~{terms.installmentAmount} ETH</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <button type="submit" className="btn" disabled={loading}>
          {loading ? <span className="loading"></span> : 'Request Loan'}
        </button>
      </form>
    </div>
  )
}

export default LoanRequest