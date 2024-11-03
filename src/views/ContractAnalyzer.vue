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

      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0 mt-1">
            <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold mb-2">Analyzing Options</h3>
            <div class="space-y-4 text-gray-300">
              <div>
                <h4 class="font-medium text-blue-400">Option 1: Import Verified Contract</h4>
                <p class="mt-1 text-sm">
                  Use the contract import feature below to analyze verified contracts on AIA Chain. Simply enter the contract address 
                  and the tool will fetch the verified source code automatically.
                </p>
              </div>
              
              <div>
                <h4 class="font-medium text-blue-400">Option 2: Direct Code Analysis</h4>
                <p class="mt-1 text-sm">
                  For contracts not verified on AIA Chain or contracts under development, you can paste your smart contract code 
                  directly into the text area below for analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Import Contract Section with modified title -->
      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Import Verified Contracts</h2>
          <span class="text-xs text-gray-400 px-2 py-1 bg-gray-700 rounded">Supports AIA Chain Only</span>
        </div>
        
        <div class="flex gap-4 mb-6">
          <input
            type="text"
            v-model="contractAddress"
            placeholder="Enter verified contract address (0x...)"
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
          <div class="space-y-4 mb-3 text-gray-300">
            <div class="mt-4 bg-gray-900/50 rounded-lg p-4">
              <div class="flex items-start space-x-2">
                <div class="flex-shrink-0">
                  <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div class="text-sm text-gray-400">
                  <p>Currently using <span class="text-yellow-500 font-mono">Llama 3.1 8B</span> model for analysis. 
                  More powerful models will be integrated in future updates to enhance analysis capabilities.<br /> <br />
                  <strong>Note:</strong> Analysis results are for reference only and should not be considered as a complete security audit.
                  Always perform thorough testing and professional audits before deploying contracts to production.</p>
                </div>
              </div>
            </div>
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
        <div v-if="isAnalyzing" class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-center space-x-3">
            <svg class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-300">Analyzing contract security...</span>
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
const analysisError = ref('')
const analysisResult = ref(null)
const txHash = ref('')
const txPending = ref(false)
const streamingResult = ref('')

// Get composables
const { isConnected, isCorrectChain } = useWallet()
const { submitReport: submitContractReport } = useContract()
const { analyzeContract: llmAnalyze, error: llmError, analysisStream } = useLLM()

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

// Watch for LLM errors
watch(llmError, (newError) => {
  if (newError) {
    analysisError.value = newError
    isAnalyzing.value = false
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
      let fullCode = contractData.source_code
      
      if (contractData.compiler_version) {
        fullCode = `// Compiler: ${contractData.compiler_version}\n${fullCode}`
      }
      
      if (contractData.additional_sources?.length) {
        fullCode += '\n\n// Additional Source Files:\n'
        contractData.additional_sources.forEach(source => {
          fullCode += `\n// File: ${source.file_path}\n${source.source_code}\n`
        })
      }
      
      contractCode.value = fullCode
      analysisResult.value = null // Clear previous results
      analysisError.value = '' // Clear any previous errors
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
  
  isAnalyzing.value = true
  analysisError.value = ''
  analysisResult.value = null
  
  try {
    const result = await llmAnalyze(contractCode.value)
    analysisResult.value = result
  } catch (error) {
    console.error('Error analyzing contract:', error)
    analysisError.value = error.message
  } finally {
    isAnalyzing.value = false
  }
}

async function performBasicAnalysis() {
  const code = contractCode.value.toLowerCase()
  const issues = []
  let riskScore = 0
  
  // Basic security checks
  if (code.includes('call') && !code.includes('reentrancyguard')) {
    issues.push({
      severity: 'critical',
      title: 'Potential Reentrancy Vulnerability',
      description: 'The contract uses low-level call without ReentrancyGuard protection',
      suggestion: 'Use OpenZeppelin\'s ReentrancyGuard or implement checks-effects-interactions pattern'
    })
    riskScore += 30
  }
  
  if ((code.includes('.transfer(') || code.includes('.send(')) && !code.includes('require')) {
    issues.push({
      severity: 'high',
      title: 'Unchecked Return Values',
      description: 'Transfer/send return values are not checked',
      suggestion: 'Use SafeERC20 or check return values with require statements'
    })
    riskScore += 20
  }

  analysisResult.value = {
    riskScore: Math.min(riskScore, 100),
    issues,
    suggestions: [
      {
        title: 'Fallback Analysis',
        description: 'This is a basic analysis due to AI service unavailability. Consider retrying later for detailed analysis.'
      }
    ]
  }
}

async function handleSubmitReport() {
  if (!analysisResult.value || !isConnected.value || !isCorrectChain.value) return

  isSubmitting.value = true
  txPending.value = true
  
  try {
    const result = await submitContractReport({
      contractAddress: contractAddress.value || ethers.ZeroAddress,
      riskScore: Math.floor(analysisResult.value.riskScore),
      issues: analysisResult.value.issues,
    })
    
    if (result?.hash) {
      txHash.value = result.hash
      await result.wait()
      txPending.value = false
    }
    
  } catch (error) {
    console.error('Error submitting report:', error)
    // Show error to user (you might want to add an error display in the template)
    alert(`Failed to submit report: ${error.message}`)
  } finally {
    isSubmitting.value = false
  }
}

function handleClearAnalysis() {
  contractCode.value = ''
  contractAddress.value = ''
  analysisResult.value = null
  analysisError.value = ''
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