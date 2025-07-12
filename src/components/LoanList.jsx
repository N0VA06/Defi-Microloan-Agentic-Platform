import React from 'react'

function LoanList({ loans, account, userType, onSelectLoan, loading }) {
  const getStatusText = (status) => {
    const statuses = ['Requested', 'Approved', 'Funded', 'Repaid', 'Defaulted']
    return statuses[status] || 'Unknown'
  }

  const getStatusClass = (status) => {
    const classes = ['requested', 'approved', 'funded', 'repaid', 'defaulted']
    return `status-${classes[status] || 'unknown'}`
  }

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'Not set'
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const formatAddress = (addr) => {
    if (addr === '0x0000000000000000000000000000000000000000') return 'None'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const filteredLoans = loans.filter(loan => {
    if (userType === 'borrower') {
      return loan.borrower.toLowerCase() === account.toLowerCase()
    } else {
      // Show all approved loans that need funding or loans where user is lender
      return loan.status === 1 || loan.lender.toLowerCase() === account.toLowerCase()
    }
  })

  if (loading) {
    return (
      <div className="card">
        <h2>{userType === 'borrower' ? 'My Loans' : 'Available & My Funded Loans'}</h2>
        <div className="text-center">
          <span className="loading"></span>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>{userType === 'borrower' ? 'My Loans' : 'Available & My Funded Loans'}</h2>
      
      {filteredLoans.length === 0 ? (
        <div className="empty-state">
          <h3>No loans found</h3>
          <p>
            {userType === 'borrower' 
              ? 'Request a loan to get started!'
              : 'No loans available for funding at the moment.'}
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
                  <span>Amount:</span>
                  <span>{loan.amount} ETH</span>
                </div>
                <div className="loan-detail">
                  <span>Borrower:</span>
                  <span>{formatAddress(loan.borrower)}</span>
                </div>
                <div className="loan-detail">
                  <span>Lender:</span>
                  <span>{formatAddress(loan.lender)}</span>
                </div>
                {loan.status === 2 && (
                  <div className="loan-detail">
                    <span>Due Date:</span>
                    <span>{formatDate(loan.dueDate)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LoanList