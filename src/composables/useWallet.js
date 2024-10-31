// useWallet.js
import { ref, onMounted, onUnmounted } from 'vue'
import { ethers } from 'ethers'

const AIA_TESTNET_CONFIG = {
  chainId: '0x528', // 1320 in hex
  chainName: 'AIA Chain Testnet',
  nativeCurrency: {
    name: 'AIA',
    symbol: 'AIA',
    decimals: 18
  },
  rpcUrls: ['https://aia-dataseed1-testnet.aiachain.org'],
  blockExplorerUrls: ['https://testnet.aiascan.com']
}

export function useWallet() {
  const address = ref('')
  const balance = ref('0')
  const isConnected = ref(false)
  const isCorrectChain = ref(false)
  const error = ref('')
  const isLoading = ref(false)

  // Check if the current chain is AIA Testnet
  async function checkChainId() {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      isCorrectChain.value = chainId === AIA_TESTNET_CONFIG.chainId
      return chainId === AIA_TESTNET_CONFIG.chainId
    } catch (err) {
      console.error('Error checking chain ID:', err)
      return false
    }
  }

  // Switch to AIA Chain or add it if not present
  async function switchToAIAChain() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AIA_TESTNET_CONFIG.chainId }],
      })
      return true
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [AIA_TESTNET_CONFIG],
          })
          return true
        } catch (addError) {
          console.error('Error adding AIA Chain:', addError)
          error.value = 'Failed to add AIA Chain to wallet'
          return false
        }
      }
      console.error('Error switching to AIA Chain:', switchError)
      error.value = 'Failed to switch to AIA Chain'
      return false
    }
  }

  async function updateBalance(addr) {
    if (typeof window.ethereum !== 'undefined' && addr) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const bal = await provider.getBalance(addr)
        balance.value = ethers.formatEther(bal)
      } catch (err) {
        console.error('Error updating balance:', err)
        balance.value = '0'
      }
    }
  }

  async function checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        
        if (accounts.length > 0) {
          // Check if we were previously connected in this session
          const wasConnected = sessionStorage.getItem('walletConnected') === 'true'
          if (wasConnected) {
            const isCorrectNetwork = await checkChainId()
            if (isCorrectNetwork) {
              address.value = accounts[0].address
              await updateBalance(accounts[0].address)
              isConnected.value = true
              isCorrectChain.value = true
            } else {
              // Don't auto-connect if on wrong network
              sessionStorage.removeItem('walletConnected')
            }
          }
        }
      } catch (err) {
        console.error('Failed to check wallet connection:', err)
      }
    }
  }

  async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet()
    } else if (accounts[0] !== address.value) {
      // User switched to a different account
      address.value = accounts[0]
      await updateBalance(accounts[0])
      isConnected.value = true
    }
  }

  async function handleChainChanged(chainId) {
    isCorrectChain.value = chainId === AIA_TESTNET_CONFIG.chainId
    if (!isCorrectChain.value && isConnected.value) {
      error.value = 'Please switch to AIA Testnet'
    } else {
      error.value = ''
    }
    // Reload the page to avoid any state inconsistencies
    window.location.reload()
  }

  async function connect() {
    if (typeof window.ethereum === 'undefined') {
      error.value = 'Please install MetaMask!'
      return
    }

    isLoading.value = true
    error.value = ''

    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })

      // Ensure we're on the correct network
      const isCorrectNetwork = await checkChainId()
      if (!isCorrectNetwork) {
        const switched = await switchToAIAChain()
        if (!switched) {
          throw new Error('Failed to switch to AIA Chain')
        }
      }

      // Get provider and address
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const addr = await signer.getAddress()

      // Update state
      address.value = addr
      await updateBalance(addr)
      isConnected.value = true
      isCorrectChain.value = true
      
      // Save connection state to session storage
      sessionStorage.setItem('walletConnected', 'true')

    } catch (err) {
      console.error('Failed to connect wallet:', err)
      error.value = err.message || 'Failed to connect wallet'
      disconnectWallet()
    } finally {
      isLoading.value = false
    }
  }

  function disconnectWallet() {
    isConnected.value = false
    isCorrectChain.value = false
    address.value = ''
    balance.value = '0'
    error.value = ''
    sessionStorage.removeItem('walletConnected')
  }

  // Setup event listeners
  onMounted(() => {
    checkWalletConnection()
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }
  })

  // Cleanup event listeners
  onUnmounted(() => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  })

  return {
    connect,
    disconnectWallet,
    address,
    balance,
    isConnected,
    isCorrectChain,
    error,
    isLoading
  }
}