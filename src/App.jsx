import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Header from './components/Header'
import LoanRequest from './components/LoanRequest'
import LoanList from './components/LoanList'
import LoanActions from './components/LoanActions'
import { connectWallet, getContract } from './utils/contractInteraction'
import './App.css'

function App() {
  const [account, setAccount] = useState('')
  const [contract, setContract] = useState(null)
  const [provider, setProvider] = useState(null)
  const [reputation, setReputation] = useState(100)
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [userType, setUserType] = useState('borrower')

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
      
      // Load all loans
      const loanCounter = await contract.loanCounter()
      const allLoans = []
      
      for (let i = 1; i <= loanCounter; i++) {
        const loanDetails = await contract.getLoanDetails(i)
        const loan = {
          id: i,
          borrower: loanDetails[0],
          lender: loanDetails[1],
          amount: ethers.formatEther(loanDetails[2]),
          dueDate: Number(loanDetails[3]),
          status: Number(loanDetails[4])
        }
        allLoans.push(loan)
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
      await tx.wait()
      alert('Loan requested successfully!')
      await loadUserData()
    } catch (error) {
      console.error('Failed to request loan:', error)
      alert('Failed to request loan')
    } finally {
      setLoading(false)
    }
  }

  const fundLoan = async (loanId, amount) => {
    try {
      setLoading(true)
      const tx = await contract.fundLoan(loanId, {
        value: ethers.parseEther(amount)
      })
      await tx.wait()
      alert('Loan funded successfully!')
      await loadUserData()
    } catch (error) {
      console.error('Failed to fund loan:', error)
      alert('Failed to fund loan')
    } finally {
      setLoading(false)
    }
  }

  const repayLoan = async (loanId, amount) => {
    try {
      setLoading(true)
      const tx = await contract.repayLoan(loanId, {
        value: ethers.parseEther(amount)
      })
      await tx.wait()
      alert('Loan repaid successfully!')
      await loadUserData()
    } catch (error) {
      console.error('Failed to repay loan:', error)
      alert('Failed to repay loan')
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
        {userType === 'borrower' && (
          <LoanRequest 
            onRequestLoan={requestLoan}
            loading={loading}
            reputation={reputation}
          />
        )}
        
        <LoanList 
          loans={loans}
          account={account}
          userType={userType}
          onSelectLoan={setSelectedLoan}
          loading={loading}
        />
        
        {selectedLoan && (
          <LoanActions
            loan={selectedLoan}
            account={account}
            userType={userType}
            onFund={fundLoan}
            onRepay={repayLoan}
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