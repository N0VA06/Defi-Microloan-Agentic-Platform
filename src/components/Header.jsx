import React from 'react'
import logo from '../assets/LOGO.png'

function Header({ account, reputation, userType, setUserType, onConnect }) {
  const formatAddress = (addr) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''
  }

  const getReputationColor = (rep) => {
    if (rep >= 80) return '#059669'
    if (rep >= 60) return '#D97706'
    return '#DC2626'
  }

  const getReputationBg = (rep) => {
    if (rep >= 80) return '#F0FDF4'
    if (rep >= 60) return '#FFFBEB'
    return '#FEF2F2'
  }

  const getReputationLabel = (rep) => {
    if (rep >= 80) return 'Excellent'
    if (rep >= 60) return 'Good'
    return 'Fair'
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="brand-section">
          <img 
            src={logo} 
            alt="MinCent Logo" 
            className="logo"
          />
          <div className="brand-info">
            <h1 className="brand-title">MinCent</h1>
            <span className="brand-subtitle">Trusted Microloan Agent Platform</span>
          </div>
        </div>
        
        <div className="header-actions">
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
            <button 
              className={`user-type-btn ${userType === 'owner' ? 'active' : ''}`}
              onClick={() => setUserType('owner')}
            >
              Owner
            </button>
          </div>

          {account ? (
            <div className="account-section">
              <div className="account-info">
                <div className="account-label">Account</div>
                <div className="account-address">{formatAddress(account)}</div>
              </div>
              {(userType === 'borrower' || userType === 'owner') && (
                <div className="reputation-section">
                  <div className="reputation-label">Reputation</div>
                  <div 
                    className="reputation-badge"
                    style={{ 
                      backgroundColor: getReputationBg(reputation),
                      borderColor: getReputationColor(reputation)
                    }}
                  >
                    <span 
                      className="reputation-score"
                      style={{ color: getReputationColor(reputation) }}
                    >
                      {reputation}
                    </span>
                    <span 
                      className="reputation-status"
                      style={{ color: getReputationColor(reputation) }}
                    >
                      {getReputationLabel(reputation)}
                    </span>
                  </div>
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

      <style jsx>{`
        .header {
          background: #ffffff;
          color: #1f2937;
          padding: 1.5rem 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid #e5e7eb;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo {
          height: 80px;
          width: 80px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .brand-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .brand-title {
          font-size: 2.25rem;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: #111827;
          margin: 0;
        }

        .brand-subtitle {
          font-size: 1rem;
          color: #6b7280;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .user-type-selector {
          display: flex;
          background: #f9fafb;
          border-radius: 8px;
          padding: 0.25rem;
          gap: 0.25rem;
          border: 1px solid #e5e7eb;
        }

        .user-type-btn {
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #6b7280;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .user-type-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .user-type-btn.active {
          background: #ffffff;
          color: #111827;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          font-weight: 600;
        }

        .account-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .account-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .account-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .account-address {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          color: #111827;
          font-weight: 600;
          background: #f9fafb;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .reputation-section {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .reputation-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .reputation-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.875rem;
          border: 1px solid;
        }

        .reputation-score {
          font-size: 1rem;
          font-weight: 700;
        }

        .reputation-status {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.8;
        }

        .connect-btn {
          padding: 0.75rem 1.5rem;
          background: #111827;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .connect-btn:hover {
          background: #374151;
        }

        @media (max-width: 768px) {
          .header {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1.5rem;
          }

          .brand-title {
            font-size: 2rem;
          }

          .header-actions {
            flex-direction: column;
            gap: 1rem;
          }

          .account-section {
            flex-direction: column;
            gap: 1rem;
          }

          .user-type-selector {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </header>
  )
}

export default Header