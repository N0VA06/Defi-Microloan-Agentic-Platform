import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Header from './components/Header'
import LoanRequest from './components/LoanRequest'
import LoanList from './components/LoanList'
import LoanActions from './components/LoanActions'
import BorrowerStats from './components/BorrowerStats'
import { connectWallet, getContract } from './utils/contractInteraction'
import './App.css'

function App() {
  const [account, setAccount] = useState('')
  const [contract, setContract] = useState(null)
  const [provider, setProvider] = useState(null)
  const [reputation, setReputation] = useState(70)
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [userType, setUserType] = useState('borrower')
  const [borrowerStats, setBorrowerStats] = useState(null)

  useEffect(() => {
    initializeApp()
  }, [])

  useEffect(() => {
    if (contract && account) {
      loadUserData()
    }
  }, [contract, account])

  const initializeApp = async () => {
    try {
      const { provider: prov, signer, account: acc } = await connectWallet()
      const contractInstance = await getContract(signer)
      
      setProvider(prov)
      setAccount(acc)
      setContract(contractInstance)
    } catch (error) {
      console.error('Failed to initialize:', error)
      alert('Please connect to MetaMask and ensure you are on the correct network')
    }
  }

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Load reputation
      const rep = await contract.borrowerReputation(account)
      setReputation(Number(rep))
      
      // Load borrower stats
      const stats = await contract.getBorrowerStats(account)
      setBorrowerStats({
        reputation: Number(stats.reputation),
        totalBorrowed: ethers.formatEther(stats.totalBorrowed),
        totalRepaid: ethers.formatEther(stats.totalRepaid),
        outstandingAmount: ethers.formatEther(stats.outstandingAmount)
      })
      
      // Load all loans
      const loanCounter = await contract.loanCounter()
      const allLoans = []
      
      for (let i = 1; i <= loanCounter; i++) {
        try {
          const loanDetails = await contract.getLoanDetails(i)
          const installments = await contract.getLoanInstallments(i)
          
          const loan = {
            id: i,
            borrower: loanDetails.borrower,
            lender: loanDetails.lender,
            principalAmount: ethers.formatEther(loanDetails.principalAmount),
            terms: {
              duration: Number(loanDetails.terms.duration) / (24 * 60 * 60), // Convert to days
              interestRate: Number(loanDetails.terms.interestRate) / 100, // Convert basis points to percentage
              totalAmount: ethers.formatEther(loanDetails.terms.totalAmount),
              numInstallments: Number(loanDetails.terms.numInstallments)
            },
            status: Number(loanDetails.status),
            paidInstallments: Number(loanDetails.paidInstallments),
            installments: installments.map(inst => ({
              amount: ethers.formatEther(inst.amount),
              dueDate: Number(inst.dueDate),
              paid: inst.paid
            }))
          }
          allLoans.push(loan)
        } catch (error) {
          console.error(`Failed to load loan ${i}:`, error)
        }
      }
      
      setLoans(allLoans)
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const requestLoan = async (amount) => {
    try {
      setLoading(true)
      const tx = await contract.requestLoan(ethers.parseEther(amount))
      const receipt = await tx.wait()
      
      // Find the LoanRequested event to get the loan terms
      const event = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log)
          return parsed.name === 'LoanRequested'
        } catch {
          return false
        }
      })
      
      if (event) {
        const parsedEvent = contract.interface.parseLog(event)
        const terms = parsedEvent.args.terms
        alert(`Loan requested successfully! 
          Interest Rate: ${Number(terms.interestRate) / 100}%
          Duration: ${Number(terms.duration) / (24 * 60 * 60)} days
          Total Amount: ${ethers.formatEther(terms.totalAmount)} ETH
          Installments: ${Number(terms.numInstallments)}`)
      } else {
        alert('Loan requested successfully!')
      }
      
      await loadUserData()
    } catch (error) {
      console.error('Failed to request loan:', error)
      alert('Failed to request loan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fundLoan = async (loanId, principalAmount) => {
    try {
      setLoading(true)
      
      const loanDetails = await contract.getLoanDetails(loanId)
      const status = Number(loanDetails.status)
      
      if (status !== 1) {
        const statusNames = ['Requested', 'Approved', 'Funded', 'PartiallyRepaid', 'Repaid', 'Defaulted']
        alert(`Cannot fund loan. Current status: ${statusNames[status]}. Loan must be "Approved" to fund.`)
        return
      }
      
      const tx = await contract.fundLoan(loanId, {
        value: ethers.parseEther(principalAmount)
      })
      await tx.wait()
      alert('Loan funded successfully!')
      await loadUserData()
    } catch (error) {
      console.error('Failed to fund loan:', error)
      if (error.message.includes('Cannot fund your own loan')) {
        alert('You cannot fund your own loan. Please use a different account.')
      } else if (error.message.includes('Loan must be approved')) {
        alert('This loan is not approved yet. Only approved loans can be funded.')
      } else if (error.message.includes('Must send exact principal amount')) {
        alert('You must send the exact principal amount.')
      } else {
        alert(`Failed to fund loan: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const repayInstallment = async (loanId, installmentIndex, amount) => {
    try {
      setLoading(true)
      const tx = await contract.repayInstallment(loanId, installmentIndex, {
        value: ethers.parseEther(amount)
      })
      await tx.wait()
      alert('Installment paid successfully!')
      await loadUserData()
    } catch (error) {
      console.error('Failed to repay installment:', error)
      alert('Failed to repay installment: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const checkDefaults = async () => {
    try {
      setLoading(true)
      const tx = await contract.checkAndDefaultLoans()
      await tx.wait()
      alert('Default check completed!')
      await loadUserData()
    } catch (error) {
      console.error('Failed to check defaults:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveLoan = async (loanId) => {
    try {
      setLoading(true)
      const tx = await contract.approveLoan(loanId)
      await tx.wait()
      alert('Loan approved successfully!')
      await loadUserData()
    } catch (error) {
      console.error('Failed to approve loan:', error)
      alert('Only owner can approve loans')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <Header 
        account={account} 
        reputation={reputation}
        userType={userType}
        setUserType={setUserType}
        onConnect={initializeApp}
      />
      
      <main className="main-content">
        {userType === 'borrower' && borrowerStats && (
          <BorrowerStats stats={borrowerStats} />
        )}
        
        {userType === 'borrower' && (
          <LoanRequest 
            onRequestLoan={requestLoan}
            loading={loading}
            reputation={reputation}
            outstandingAmount={borrowerStats?.outstandingAmount || "0"}
          />
        )}
        
        <LoanList 
          loans={loans}
          account={account}
          userType={userType}
          onSelectLoan={setSelectedLoan}
          loading={loading}
          onApproveLoan={approveLoan}
        />
        
        {selectedLoan && (
          <LoanActions
            loan={selectedLoan}
            account={account}
            userType={userType}
            onFund={fundLoan}
            onRepayInstallment={repayInstallment}
            onClose={() => setSelectedLoan(null)}
            loading={loading}
          />
        )}
        
        <button 
          className="check-defaults-btn"
          onClick={checkDefaults}
          disabled={loading}
        >
          Check for Defaulted Loans
        </button>
      </main>
    </div>
  )
}

export default App