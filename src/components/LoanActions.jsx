import React from 'react'

function LoanActions({ loan, account, userType, onFund, onRepay, onClose, loading }) {
  const canFund = userType === 'lender' && loan.status === 1
  const canRepay = userType === 'borrower' && 
                   loan.status === 2 && 
                   loan.borrower.toLowerCase() === account.toLowerCase()

  const getStatusText = (status) => {
    const statuses = ['Requested', 'Approved', 'Funded', 'Repaid', 'Defaulted']
    return statuses[status] || 'Unknown'
  }

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'Not set'
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const isOverdue = loan.dueDate > 0 && Date.now() / 1000 > loan.dueDate

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Loan #{loan.id} Details</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="loan-details">
          <div className="loan-detail">
            <span>Status:</span>
            <span>{getStatusText(loan.status)}</span>
          </div>
          <div className="loan-detail">
            <span>Amount:</span>
            <span>{loan.amount} ETH</span>
          </div>
          <div className="loan-detail">
            <span>Borrower:</span>
            <span>{loan.borrower}</span>
          </div>
          <div className="loan-detail">
            <span>Lender:</span>
            <span>{loan.lender === '0x0000000000000000000000000000000000000000' ? 'None' : loan.lender}</span>
          </div>
          {loan.dueDate > 0 && (
            <div className="loan-detail">
              <span>Due Date:</span>
              <span style={{ color: isOverdue ? '#dc3545' : 'inherit' }}>
                {formatDate(loan.dueDate)} {isOverdue && '(OVERDUE)'}
              </span>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {canFund && (
            <button 
              className="btn btn-success" 
              onClick={() => onFund(loan.id, loan.amount)}
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : `Fund Loan (${loan.amount} ETH)`}
            </button>
          )}
          
          {canRepay && (
            <button 
              className="btn btn-success" 
              onClick={() => onRepay(loan.id, loan.amount)}
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : `Repay Loan (${loan.amount} ETH)`}
            </button>
          )}
          
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoanActions