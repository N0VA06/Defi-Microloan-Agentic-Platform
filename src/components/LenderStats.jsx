import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import LenderStats from './components/LenderStats'

const App = ({ loans, account, userType }) => {
  // Filter loans funded by the lender
  const fundedLoans = loans.filter(loan => loan.lender === account)

  // Aggregate capital per project (assuming each loan is a project)
  const data = fundedLoans.map(loan => ({
    name: `Project ${loan.id}`,
    capital: Number(loan.principalAmount)
  }))

  return (
    <div>
      <main className="main-content">
        {userType === 'lender' && (
          <LenderStats loans={loans} account={account} />
        )}
        <div style={{ width: '100%', height: 300 }}>
          <h3>Your Funded Projects & Capital</h3>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Capital (ETH)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="capital" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  )
}

export default App