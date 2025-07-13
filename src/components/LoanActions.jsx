import React, { useState, useEffect } from 'react'
import InstallmentSchedule from './InstallmentSchedule'

function LoanActions({ loan, account, userType, onFund, onRepayInstallment, onClose, loading }) {
  const [borrowerAnalysis, setBorrowerAnalysis] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)

  const canFund = userType === 'lender' && loan.status === 1 && 
                  loan.borrower.toLowerCase() !== account.toLowerCase()
  const canRepay = userType === 'borrower' && 
                   (loan.status === 2 || loan.status === 3) && 
                   loan.borrower.toLowerCase() === account.toLowerCase()

  const getStatusText = (status) => {
    const statuses = ['Requested', 'Approved', 'Funded', 'Partially Repaid', 'Repaid', 'Defaulted']
    return statuses[status] || 'Unknown'
  }

  // Fetch borrower analysis when component mounts (for lenders only)
  useEffect(() => {
    if (userType === 'lender' && loan.borrower) {
      fetchBorrowerAnalysis()
    }
  }, [userType, loan.borrower])

  const fetchBorrowerAnalysis = async () => {
    setAnalysisLoading(true)
    setAnalysisError(null)
    
    try {
      const borrowerId = extractBorrowerId(loan.borrower)
      
      const response = await fetch(`http://localhost:5000/borrower/${borrowerId}/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const analysisText = await response.text()
      setBorrowerAnalysis(analysisText)
    } catch (error) {
      console.error('Error fetching borrower analysis:', error)
      setAnalysisError(error.message)
    } finally {
      setAnalysisLoading(false)
    }
  }

  const extractBorrowerId = (borrowerAddress) => {
    const borrowerIdMap = {
      '0x1234567890abcdef': 'fd7358a8-66a2-41c7-ad32-7468a07deb6f',
    }
    
    return borrowerIdMap[borrowerAddress] || 'fd7358a8-66a2-41c7-ad32-7468a07deb6f'
  }

  const formatAnalysisText = (text) => {
    if (!text) return null
    
    const lines = text.split('\n').filter(line => line.trim())
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim()
      
      if (trimmedLine.startsWith('===') || trimmedLine.endsWith('===')) {
        return <h3 key={index} className="analysis-main-header">{trimmedLine.replace(/=/g, '').trim()}</h3>
      }
      else if (trimmedLine.endsWith(':') && /^[A-Z\s:]+$/.test(trimmedLine)) {
        return <h4 key={index} className="analysis-section-header">{trimmedLine}</h4>
      }
      else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
        return <p key={index} className="analysis-bullet-point">{trimmedLine}</p>
      }
      else if (trimmedLine.includes('HIGH RISK') || trimmedLine.includes('OVERDUE')) {
        return <p key={index} className="analysis-line analysis-high-risk">{trimmedLine}</p>
      }
      else if (trimmedLine.includes('MEDIUM RISK')) {
        return <p key={index} className="analysis-line analysis-medium-risk">{trimmedLine}</p>
      }
      else if (trimmedLine.includes('LOW RISK')) {
        return <p key={index} className="analysis-line analysis-low-risk">{trimmedLine}</p>
      }
      else if (trimmedLine) {
        return <p key={index} className="analysis-line">{trimmedLine}</p>
      }
      return null
    }).filter(Boolean)
  }

  const handleRetryAnalysis = () => {
    fetchBorrowerAnalysis()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${userType === 'lender' ? 'modal-extra-large' : 'modal-large'}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Loan #{loan.id} Details</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="loan-details-container">
          {/* Main loan details */}
          <div className="loan-details-main">
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
          </div>

          {/* Borrower Analysis Panel (for lenders only) */}
          {userType === 'lender' && (
            <div className="borrower-analysis-panel">
              <div className="analysis-header-section">
                <h4>Borrower Risk Analysis</h4>
                <div className="analysis-controls">
                  <button 
                    className="btn btn-sm btn-outline refresh-btn" 
                    onClick={handleRetryAnalysis}
                    disabled={analysisLoading}
                    title="Refresh Analysis"
                  >
                    {analysisLoading ? (
                      <span className="loading-spinner"></span>
                    ) : (
                      '⟳'
                    )}
                  </button>
                </div>
                {analysisLoading && (
                  <div className="analysis-loading">
                    <span className="loading-spinner"></span>
                    Loading analysis...
                  </div>
                )}
              </div>

              <div className="analysis-content">
                {analysisError ? (
                  <div className="analysis-error">
                    <div className="error-icon">⚠️</div>
                    <h5>Analysis Unavailable</h5>
                    <p>{analysisError.includes('404') ? 'Borrower data not found' : 'Failed to load analysis'}</p>
                    <button 
                      className="btn btn-sm btn-secondary" 
                      onClick={handleRetryAnalysis}
                      disabled={analysisLoading}
                    >
                      {analysisLoading ? 'Loading...' : 'Retry'}
                    </button>
                  </div>
                ) : borrowerAnalysis ? (
                  <div className="analysis-text">
                    {formatAnalysisText(borrowerAnalysis)}
                  </div>
                ) : !analysisLoading && (
                  <div className="analysis-empty">
                    <div className="empty-icon">📊</div>
                    <p>No analysis available</p>
                    <button 
                      className="btn btn-sm btn-primary" 
                      onClick={handleRetryAnalysis}
                    >
                      Load Analysis
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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