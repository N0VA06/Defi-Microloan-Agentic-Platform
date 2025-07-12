import React from 'react'

function LoanList({ loans, account, userType, onSelectLoan, loading, onApproveLoan }) {
  const getStatusText = (status) => {
    const statuses = ['Requested', 'Approved', 'Funded', 'Partially Repaid', 'Repaid', 'Defaulted']
    return statuses[status] || 'Unknown'
  }

  const getStatusClass = (status) => {
    const classes = ['requested', 'approved', 'funded', 'partially-repaid', 'repaid', 'defaulted']
    return `status-${classes[status] || 'unknown'}`
  }

  const formatAddress = (addr) => {
    if (addr === '0x0000000000000000000000000000000000000000') return 'None'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const filteredLoans = loans.filter(loan => {
    if (userType === 'borrower') {
      return loan.borrower.toLowerCase() === account.toLowerCase()
    } else if (userType === 'lender') {
      // Show all loans (for debugging) or filter as needed
      return true
    } else if (userType === 'owner') {
      // Show loans that need approval
      return loan.status === 0
    }
    return false
  })

  if (loading) {
    return (
      <div className="card">
        <h2>
          {userType === 'borrower' ? 'My Loans' : 
           userType === 'lender' ? 'All Loans' : 
           'Loans Pending Approval'}
        </h2>
        <div className="text-center">
          <span className="loading"></span>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>
        {userType === 'borrower' ? 'My Loans' : 
         userType === 'lender' ? 'All Loans' : 
         'Loans Pending Approval'}
      </h2>
      
      {filteredLoans.length === 0 ? (
        <div className="empty-state">
          <h3>No loans found</h3>
          <p>
            {userType === 'borrower' 
              ? 'Request a loan to get started!'
              : userType === 'lender'
              ? 'No loans available at the moment.'
              : 'No loans pending approval.'}
          </p>
        </div>
      ) : (
        <div className="loans-grid">
          {filteredLoans.map(loan => (
            <div 
              key={loan.id} 
              className="loan-card"
              onClick={() => onSelectLoan(loan)}
            >
              <div className="loan-header">
                <span className="loan-id">Loan #{loan.id}</span>
                <span className={`loan-status ${getStatusClass(loan.status)}`}>
                  {getStatusText(loan.status)}
                </span>
              </div>
              
              <div className="loan-details">
                <div className="loan-detail">
                  <span>Principal:</span>
                  <span>{loan.principalAmount} ETH</span>
                </div>
                <div className="loan-detail">
                  <span>Total Amount:</span>
                  <span>{loan.terms.totalAmount} ETH</span>
                </div>
                <div className="loan-detail">
                  <span>Interest Rate:</span>
                  <span>{loan.terms.interestRate}%</span>
                </div>
                <div className="loan-detail">
                  <span>Borrower:</span>
                  <span>{formatAddress(loan.borrower)}</span>
                </div>
                <div className="loan-detail">
                  <span>Lender:</span>
                  <span>{formatAddress(loan.lender)}</span>
                </div>
                <div className="loan-detail">
                  <span>Installments:</span>
                  <span>{loan.paidInstallments}/{loan.terms.numInstallments}</span>
                </div>
              </div>
              
              {userType === 'owner' && loan.status === 0 && (
                <button 
                  className="btn btn-approve"
                  onClick={(e) => {
                    e.stopPropagation()
                    onApproveLoan(loan.id)
                  }}
                  disabled={loading}
                >
                  Approve Loan
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LoanList