<template>
    <div class="w-full max-w-7xl mx-auto space-y-8 p-4">
      <!-- Instructions -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Smart Contract Security Analyzer</h2>
        <div class="prose prose-invert max-w-none">
          <p class="text-gray-300">
            This tool helps you analyze smart contracts for potential security vulnerabilities and optimization opportunities. Follow these steps:
          </p>
          <ol class="text-gray-300 list-decimal list-inside space-y-2 mt-4">
            <li>Paste your smart contract's Solidity code in the input box below</li>
            <li>Click "Analyze Contract" to start the security scan</li>
            <li>Review the findings in the analysis report</li>
            <li>Optionally submit the report on-chain for permanent record</li>
          </ol>
        </div>
      </div>

      <!-- Contract Import Section -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Import Contract</h2>
        <div class="flex gap-4 mb-6">
          <input
            type="text"
            v-model="contractAddress"
            placeholder="Enter contract address (0x...)"
            class="flex-1 p-2 bg-gray-900 rounded-lg border border-gray-700 text-white font-mono"
          />
          <button
            @click="handleImportContract"
            :disabled="isImporting || !isValidAddress"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg flex items-center"
          >
            <span v-if="isImporting" class="mr-2">
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </span>
            {{ isImporting ? 'Importing...' : 'Import Contract' }}
          </button>
        </div>
        
        <!-- Import Error Alert -->
        <div v-if="importError" class="mt-4 p-4 bg-red-900/30 rounded-lg text-red-300">
          {{ importError }}
        </div>
      </div>

      <!-- Analysis Input Section -->
      <div class="grid grid-cols-1 gap-8">
        <!-- Code Input -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Contract Code</h2>
          <div class="mb-4">
            <textarea
              v-model="contractCode"
              placeholder="// Paste your Solidity smart contract code here...
              
  contract Example {
      // Your contract code
  }"
              class="w-full h-64 p-4 bg-gray-900 rounded-lg border border-gray-700 text-white font-mono"
            ></textarea>
          </div>
          <div class="flex space-x-4">
            <button
              @click="handleAnalyzeContract"
              :disabled="isAnalyzing || !contractCode"
              class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg"
            >
              <span v-if="isAnalyzing" class="mr-2">
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              </span>
              {{ isAnalyzing ? 'Analyzing...' : 'Analyze Contract' }}
            </button>
            <button
              @click="handleClearAnalysis"
              :disabled="!analysisResult"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg"
            >
              Clear
            </button>
          </div>
        </div>
  
        <!-- Streaming Response (Debug) -->
        <div v-if="streamingResult && isAnalyzing" class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Analysis in Progress</h3>
            <span class="text-sm text-gray-400">AI is analyzing your contract...</span>
          </div>
          <pre class="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap text-gray-300">{{ streamingResult }}</pre>
        </div>
  
        <!-- Quick Stats -->
        <div v-if="analysisResult" class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-6">Analysis Summary</h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-700 rounded-lg p-4">
              <h3 class="text-sm text-gray-400 mb-1">Risk Score</h3>
              <div class="text-3xl font-bold" :class="{
                'text-red-400': analysisResult.riskScore >= 70,
                'text-yellow-400': analysisResult.riskScore >= 30 && analysisResult.riskScore < 70,
                'text-green-400': analysisResult.riskScore < 30
              }">
                {{ analysisResult.riskScore }}%
              </div>
            </div>
            <div class="bg-gray-700 rounded-lg p-4">
              <h3 class="text-sm text-gray-400 mb-1">Issues Found</h3>
              <div class="text-3xl font-bold">
                {{ analysisResult.issues.length }}
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Analysis Results -->
      <div v-if="analysisResult" class="space-y-6">
        <!-- Risk Score Progress -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Risk Assessment</h3>
          <div class="flex items-center mb-4">
            <div class="w-full bg-gray-700 rounded-full h-4">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="riskScoreColor"
                :style="{ width: `${analysisResult.riskScore}%` }"
              ></div>
            </div>
            <span class="ml-4 font-mono">{{ analysisResult.riskScore }}%</span>
          </div>
        </div>
  
        <!-- Issues Found -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Detected Issues</h3>
          <div v-if="analysisResult.issues.length" class="space-y-4">
            <div
              v-for="(issue, index) in analysisResult.issues"
              :key="index"
              class="p-4 rounded-lg"
              :class="getIssueBgColor(issue.severity)"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <span class="text-2xl" :class="getIssueSeverityColor(issue.severity)">●</span>
                </div>
                <div class="ml-3">
                  <h4 class="font-medium">{{ issue.title }}</h4>
                  <p class="text-gray-400 mt-1">{{ issue.description }}</p>
                  <div v-if="issue.codeSnippet" class="mt-2">
                    <pre class="bg-gray-900 p-3 rounded-lg overflow-x-auto text-sm">{{ issue.codeSnippet }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-400 text-center py-4">
            No issues detected
          </div>
        </div>
  
        <!-- Optimization Suggestions -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Optimization Suggestions</h3>
          <div class="space-y-4">
            <div
              v-for="(suggestion, index) in analysisResult.suggestions"
              :key="index"
              class="p-4 bg-gray-700 rounded-lg"
            >
              <h4 class="font-medium text-blue-400">{{ suggestion.title }}</h4>
              <p class="text-gray-300 mt-1">{{ suggestion.description }}</p>
            </div>
          </div>
        </div>
  
        <!-- Submit Report Section -->
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold">Submit Report On-Chain</h3>
              <p class="text-gray-400">
                Submit this analysis report to the blockchain for permanent record and verification.
              </p>
            </div>
            <button
              @click="handleSubmitReport"
              :disabled="isSubmitting || !isConnected || !isCorrectChain"
              class="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg"
            >
              <span v-if="isSubmitting" class="mr-2">
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              </span>
              {{ getSubmitButtonText }}
            </button>
          </div>
          
          <!-- Transaction Status -->
          <div v-if="txHash" class="mt-4 bg-gray-700 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-sm text-gray-400 mr-2">Transaction:</span>
                <a 
                  :href="`https://testnet.aiascan.com/tx/${txHash}`"
                  target="_blank"
                  class="text-blue-400 hover:text-blue-300 font-mono text-sm"
                >
                  {{ shortenHash(txHash) }}
                </a>
              </div>
              <div class="flex items-center">
                <span 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="{'bg-yellow-900 text-yellow-200': txPending, 'bg-green-900 text-green-200': !txPending}"
                >
                  {{ txPending ? 'Pending' : 'Confirmed' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useContract } from '../composables/useContract'
import { useWallet } from '../composables/useWallet'
import { useLLM } from '../composables/useLLM'
import axios from 'axios'
import { ethers } from 'ethers'

// Component state
const contractCode = ref('')
const contractAddress = ref('')
const isAnalyzing = ref(false)
const isSubmitting = ref(false)
const isImporting = ref(false)
const importError = ref('')
const analysisResult = ref(null)
const txHash = ref('')
const txPending = ref(false)
const streamingResult = ref('')
const serviceAvailable = ref(true)

// Get composables
const { isConnected, isCorrectChain } = useWallet()
const { submitReport: submitContractReport } = useContract()
const { analyzeContract: llmAnalyze, error: llmError, analysisStream, checkAvailability } = useLLM()

// Computed properties
const isValidAddress = computed(() => {
  try {
    return ethers.isAddress(contractAddress.value)
  } catch {
    return false
  }
})

const riskScoreColor = computed(() => {
  const score = analysisResult.value?.riskScore || 0
  if (score < 30) return 'bg-green-500'
  if (score < 70) return 'bg-yellow-500'
  return 'bg-red-500'
})

const getSubmitButtonText = computed(() => {
  if (!isConnected.value) return 'Connect Wallet to Submit'
  if (!isCorrectChain.value) return 'Switch to AIA Testnet'
  if (isSubmitting.value) return 'Submitting...'
  return 'Submit Report'
})

// Check service availability on mount
onMounted(async () => {
  serviceAvailable.value = await checkAvailability()
})
// Watch the streaming response
watch(analysisStream, (newValue) => {
  streamingResult.value = newValue
  try {
    // Try to parse the streaming response as it comes in
    const parsed = JSON.parse(newValue)
    if (parsed.riskScore !== undefined && Array.isArray(parsed.issues) && Array.isArray(parsed.suggestions)) {
      analysisResult.value = parsed
    }
  } catch (e) {
    // Ignore parsing errors during streaming
  }
})

// Methods
async function handleImportContract() {
  if (!isValidAddress.value) return
  
  isImporting.value = true
  importError.value = ''
  
  try {
    const response = await axios.get(`https://testnet.aiascan.com/api/v2/smart-contracts/${contractAddress.value}`, {
      headers: {
        'accept': 'application/json'
      }
    })
    
    const contractData = response.data
    
    if (contractData.source_code) {
      // Start with the main source code
      let fullCode = contractData.source_code
      
      // Add compiler version if available
      if (contractData.compiler_version) {
        fullCode = `// Compiler: ${contractData.compiler_version}\n${fullCode}`
      }
      
      // Add additional sources if they exist
      if (contractData.additional_sources?.length) {
        fullCode += '\n\n// Additional Source Files:\n'
        contractData.additional_sources.forEach(source => {
          fullCode += `\n// File: ${source.file_path}\n${source.source_code}\n`
        })
      }
      
      contractCode.value = fullCode
    } else {
      throw new Error('Contract source code not available. The contract may not be verified.')
    }
  } catch (error) {
    console.error('Error importing contract:', error)
    importError.value = error.response?.data?.message || error.message || 'Failed to import contract'
  } finally {
    isImporting.value = false
  }
}

async function handleAnalyzeContract() {
  if (!contractCode.value.trim()) return
  if (!serviceAvailable.value) {
    console.error('LLM service is not available')
    await performBasicAnalysis()
    return
  }
  
  isAnalyzing.value = true
  streamingResult.value = ''
  analysisResult.value = null
  
  try {
    const result = await llmAnalyze(contractCode.value)
    analysisResult.value = result
  } catch (error) {
    console.error('Error analyzing contract:', error)
    await performBasicAnalysis()
  } finally {
    isAnalyzing.value = false
  }
}

// Fallback analysis in case LLM fails
async function performBasicAnalysis() {
  const code = contractCode.value.toLowerCase()
  const issues = []
  let riskScore = 0
  
  // Basic checks
  if (code.includes('call') && !code.includes('reentrancyguard')) {
    issues.push({
      severity: 'critical',
      title: 'Potential Reentrancy Vulnerability',
      description: 'The contract uses low-level call without ReentrancyGuard protection',
      codeSnippet: 'Use OpenZeppelin\'s ReentrancyGuard or implement checks-effects-interactions pattern'
    })
    riskScore += 30
  }
  
  if ((code.includes('.transfer(') || code.includes('.send(')) && !code.includes('require')) {
    issues.push({
      severity: 'high',
      title: 'Unchecked Return Values',
      description: 'Transfer/send return values are not checked. Failed transfers could go unnoticed.',
      codeSnippet: 'Use SafeERC20 or check return values with require statements'
    })
    riskScore += 20
  }

  analysisResult.value = {
    riskScore: Math.min(riskScore, 100),
    issues,
    suggestions: [
      {
        title: 'Use OpenZeppelin Contracts',
        description: 'Consider using battle-tested OpenZeppelin contracts for common functionality.'
      },
      {
        title: 'Implement Access Control',
        description: 'Use Role-Based Access Control (RBAC) for better permission management.'
      }
    ]
  }
}

async function handleSubmitReport() {
  if (!analysisResult.value) return

  isSubmitting.value = true
  txPending.value = true
  try {
    const result = await submitContractReport({
      contractAddress: ethers.ZeroAddress,
      riskScore: analysisResult.value.riskScore,
      issues: analysisResult.value.issues,
      suggestions: analysisResult.value.suggestions
    })
    
    txHash.value = result.hash
    await result.wait()
    txPending.value = false
    
  } catch (error) {
    console.error('Error submitting report:', error)
  } finally {
    isSubmitting.value = false
  }
}

function handleClearAnalysis() {
  contractCode.value = ''
  contractAddress.value = ''
  analysisResult.value = null
  txHash.value = ''
  txPending.value = false
  streamingResult.value = ''
  importError.value = ''
}

function getIssueSeverityColor(severity) {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'text-red-500'
    case 'high':
      return 'text-orange-500'
    case 'medium':
      return 'text-yellow-500'
    default:
      return 'text-green-500'
  }
}

function getIssueBgColor(severity) {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'bg-red-900/30'
    case 'high':
      return 'bg-orange-900/30'
    case 'medium':
      return 'bg-yellow-900/30'
    default:
      return 'bg-green-900/30'
  }
}

function shortenHash(hash) {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}


</script>