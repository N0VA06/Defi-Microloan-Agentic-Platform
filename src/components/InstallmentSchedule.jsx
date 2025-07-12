import React from 'react'

function InstallmentSchedule({ installments, canRepay, onRepayInstallment, loading }) {
  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'Not set'
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const isOverdue = (dueDate) => {
    return dueDate > 0 && Date.now() / 1000 > dueDate
  }

  const getNextPayable = () => {
    return installments.findIndex(inst => !inst.paid)
  }

  const nextPayableIndex = getNextPayable()

  return (
    <div className="installment-section">
      <h4>Installment Schedule</h4>
      <div className="installment-grid">
        {installments.map((installment, index) => (
          <div 
            key={index} 
            className={`installment-card ${installment.paid ? 'paid' : ''} ${isOverdue(installment.dueDate) && !installment.paid ? 'overdue' : ''}`}
          >
            <div className="installment-header">
              <span>Installment #{index + 1}</span>
              {installment.paid && <span className="paid-badge">✓ Paid</span>}
              {!installment.paid && isOverdue(installment.dueDate) && 
                <span className="overdue-badge">Overdue</span>
              }
            </div>
            
            <div className="installment-details">
              <div className="installment-detail">
                <span>Amount:</span>
                <span>{installment.amount} ETH</span>
              </div>
              <div className="installment-detail">
                <span>Due Date:</span>
                <span>{formatDate(installment.dueDate)}</span>
              </div>
            </div>
            
            {canRepay && !installment.paid && index === nextPayableIndex && (
              <button 
                className="btn btn-small btn-success"
                onClick={() => onRepayInstallment(index, installment.amount)}
                disabled={loading}
              >
                {loading ? <span className="loading"></span> : 'Pay Now'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default InstallmentSchedule