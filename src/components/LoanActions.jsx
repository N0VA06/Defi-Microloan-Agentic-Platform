import React from 'react'
import InstallmentSchedule from './InstallmentSchedule'

function LoanActions({ loan, account, userType, onFund, onRepayInstallment, onClose, loading }) {
  const canFund = userType === 'lender' && loan.status === 1 && 
                  loan.borrower.toLowerCase() !== account.toLowerCase()
  const canRepay = userType === 'borrower' && 
                   (loan.status === 2 || loan.status === 3) && 
                   loan.borrower.toLowerCase() === account.toLowerCase()

  const getStatusText = (status) => {
    const statuses = ['Requested', 'Approved', 'Funded', 'Partially Repaid', 'Repaid', 'Defaulted']
    return statuses[status] || 'Unknown'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Loan #{loan.id} Details</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="loan-details-grid">
          <div className="detail-section">
            <h4>Loan Information</h4>
            <div className="loan-detail">
              <span>Status:</span>
              <span className={`status-badge status-${getStatusText(loan.status).toLowerCase().replace(' ', '-')}`}>
                {getStatusText(loan.status)}
              </span>
            </div>
            <div className="loan-detail">
              <span>Principal Amount:</span>
              <span>{loan.principalAmount} ETH</span>
            </div>
            <div className="loan-detail">
              <span>Total Amount (with interest):</span>
              <span>{loan.terms.totalAmount} ETH</span>
            </div>
            <div className="loan-detail">
              <span>Interest Rate:</span>
              <span>{loan.terms.interestRate}%</span>
            </div>
            <div className="loan-detail">
              <span>Duration:</span>
              <span>{loan.terms.duration} days</span>
            </div>
          </div>

          <div className="detail-section">
            <h4>Participants</h4>
            <div className="loan-detail">
              <span>Borrower:</span>
              <span className="address">{loan.borrower}</span>
            </div>
            <div className="loan-detail">
              <span>Lender:</span>
              <span className="address">
                {loan.lender === '0x0000000000000000000000000000000000000000' 
                  ? 'Not funded yet' 
                  : loan.lender}
              </span>
            </div>
          </div>
        </div>

        {loan.installments && loan.installments.length > 0 && (
          <InstallmentSchedule 
            installments={loan.installments}
            canRepay={canRepay}
            onRepayInstallment={(index, amount) => onRepayInstallment(loan.id, index, amount)}
            loading={loading}
          />
        )}

        <div className="modal-actions">
          {canFund && (
            <button 
              className="btn btn-success" 
              onClick={() => onFund(loan.id, loan.principalAmount)}
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : `Fund Loan (${loan.principalAmount} ETH)`}
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