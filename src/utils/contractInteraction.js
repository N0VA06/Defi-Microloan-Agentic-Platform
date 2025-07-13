import { ethers } from 'ethers'
import contractABI from '../contracts/DynamicMicroloanBank.json'

// You'll need to update this with your deployed contract address
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

export const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed!')
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    
    // Create provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const account = await signer.getAddress()
    
    // Check network
    const network = await provider.getNetwork()
    if (network.chainId !== 31337n) {
      alert('Please connect to Hardhat local network (localhost:8545)')
      throw new Error('Wrong network')
    }
    
    return { provider, signer, account }
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw error
  }
}

export const getContract = async (signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer)
}