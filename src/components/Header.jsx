import React from 'react'

function Header({ account, reputation, userType, setUserType, onConnect }) {
  const formatAddress = (addr) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''
  }

  return (
    <header className="header">
      <div className="header-content">
        <h1>🏦 Microloan Bank</h1>
        
        <div className="header-info">
          <div className="user-type-selector">
            <button 
              className={`user-type-btn ${userType === 'borrower' ? 'active' : ''}`}
              onClick={() => setUserType('borrower')}
            >
              Borrower
            </button>
            <button 
              className={`user-type-btn ${userType === 'lender' ? 'active' : ''}`}
              onClick={() => setUserType('lender')}
            >
              Lender
            </button>
          </div>

          {account ? (
            <div className="account-info">
              <div>Account: {formatAddress(account)}</div>
              {userType === 'borrower' && (
                <div className="reputation-badge">
                  <span>Reputation:</span>
                  <span className="reputation-value">{reputation}</span>
                </div>
              )}
            </div>
          ) : (
            <button className="connect-btn" onClick={onConnect}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header