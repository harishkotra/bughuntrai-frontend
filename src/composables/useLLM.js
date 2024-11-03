import { ref } from 'vue'
import axios from 'axios'

export function useLLM() {
  const isLoading = ref(false)
  const error = ref(null)

  const API_URL = 'https://llama.us.gaianet.network/v1/chat/completions'

  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    withCredentials: false  // Important for CORS
  })

  // Helper to extract key points from analysis
  function extractKeyPoints(text) {
    console.log('Raw LLM Response:', text)
    
    const lines = text.split(/[\n•-]/).filter(line => line.trim())
    const issues = []
    const suggestions = []
    let maxSeverityScore = 0
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Look for severity scores (e.g., "Severity: 80/100")
      const severityMatch = trimmed.match(/severity:?\s*(\d+)(?:\s*\/\s*100)?/i)
      if (severityMatch) {
        const score = parseInt(severityMatch[1])
        if (!isNaN(score) && score > maxSeverityScore) {
          maxSeverityScore = score
        }
      }
      
      // Determine severity level from explicit mentions
      let severity = 'medium'
      if (trimmed.toLowerCase().includes('severity: critical')) severity = 'critical'
      else if (trimmed.toLowerCase().includes('severity: high')) severity = 'high'
      else if (trimmed.toLowerCase().includes('severity: low')) severity = 'low'
      
      // Check if line describes an issue
      if (trimmed.toLowerCase().includes('vulnerable') || 
          trimmed.toLowerCase().includes('risk') ||
          trimmed.toLowerCase().includes('issue') ||
          trimmed.toLowerCase().includes('problem') ||
          trimmed.toLowerCase().includes('severity')) {
        issues.push({
          severity,
          title: trimmed.split('.')[0],
          description: trimmed
        })
      }
      // Check if line is a suggestion
      else if (trimmed.toLowerCase().includes('recommend') ||
               trimmed.toLowerCase().includes('should') ||
               trimmed.toLowerCase().includes('consider') ||
               trimmed.toLowerCase().includes('improvement')) {
        suggestions.push({
          title: 'Improvement Suggestion',
          description: trimmed
        })
      }
    }

    // If no issues found but text mentions it explicitly
    if (issues.length === 0 && text.toLowerCase().includes('no security issues found')) {
      return {
        issues: [{
          severity: 'low',
          title: 'No Security Issues',
          description: 'Code analysis found no significant security vulnerabilities.'
        }],
        suggestions: suggestions.length ? suggestions : [{
          title: 'General Recommendation',
          description: 'While no issues were found, consider regular security reviews and testing.'
        }],
        riskScore: 10 // Low risk score for no issues
      }
    }

    return { 
      issues, 
      suggestions,
      riskScore: maxSeverityScore || (issues.some(i => i.severity === 'critical') ? 90 :
                                     issues.some(i => i.severity === 'high') ? 70 :
                                     issues.some(i => i.severity === 'medium') ? 50 : 30)
    }
  }

  async function analyzeContract(code) {
    if (!code?.trim()) {
      throw new Error('No code provided')
    }
  
    isLoading.value = true
    error.value = null
  
    try {
      const response = await axiosInstance.post('', {
        model: 'llama',
        messages: [
          {
            role: "system",
            content: `You are a smart contract security auditor. **Analyze the submitted contract and strictly identify all security vulnerabilities directly, without explaining the contract's general functionality.** For each issue found, follow this exact structure:

- **Severity Level:** Label the severity as Critical, High, Medium, or Low.
- **Severity Score (0-100):** Assign a severity score based on the risk level.
- **Issue Summary:** Describe the issue in one sentence, focusing on what's wrong or risky.
- **Recommended Fix:** Provide a clear, actionable recommendation in one sentence.

If no issues are found, state 'No security issues found' and provide an overall security score based on code quality, best practices, and potential vulnerabilities (0-100). Avoid any general descriptions of the contract and focus solely on **security issues** and **actionable insights**.

If you cannot analyze the provided input, explain why and what you need instead.

**Do not elaborate on contract functionality or unrelated aspects.** Stick to the above format and avoid any additional commentary or explanation.`
          },
          {
            role: "user",
            content: code
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
  
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response')
      }
  
      const analysisText = response.data.choices[0].message.content
      console.log('Raw LLM Response:', analysisText)
  
      // Check if response indicates inability to analyze
      if (analysisText.toLowerCase().includes('unable to analyze') ||
          analysisText.toLowerCase().includes("can't analyze") ||
          analysisText.toLowerCase().includes('cannot analyze') ||
          analysisText.toLowerCase().includes('please provide')) {
        return {
          rawResponse: analysisText.trim(),
          isError: true
        }
      }
  
      // Normal analysis processing
      const { issues, suggestions, riskScore } = extractKeyPoints(analysisText)
      return {
        issues,
        suggestions,
        riskScore,
        rawResponse: analysisText
      }
  
    } catch (err) {
      console.error('Full API Error:', err)
      error.value = err.message
      throw new Error('Analysis failed: ' + (err.response?.data?.error || err.message))
    } finally {
      isLoading.value = false
    }
  }

  return {
    analyzeContract,
    isLoading,
    error
  }
}