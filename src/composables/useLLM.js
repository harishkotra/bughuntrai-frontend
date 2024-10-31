import { ref } from 'vue'
import axios from 'axios'

export function useLLM() {
  const isLoading = ref(false)
  const error = ref(null)
  const analysisStream = ref('')

  const API_URL = 'https://llama.us.gaianet.ai/v1/chat/completions'
  const API_KEY = ''

  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    }
  })

  async function analyzeContract(code) {
    isLoading.value = true
    error.value = null
    analysisStream.value = ''

    try {
      const response = await axiosInstance({
        method: 'post',
        url: '',
        data: {
          model: 'YOUR_MODEL_NAME', // e.g., gpt-4
          messages: [
            {
              role: "system",
              content: `You are an expert smart contract auditor. Analyze the following smart contract code and provide a detailed security analysis in the following JSON format:
{
  "riskScore": <number between 0-100>,
  "issues": [
    {
      "severity": "<critical|high|medium|low>",
      "title": "<issue title>",
      "description": "<detailed description>",
      "codeSnippet": "<relevant code or fix suggestion>"
    }
  ],
  "suggestions": [
    {
      "title": "<suggestion title>",
      "description": "<detailed suggestion>"
    }
  ]
}
Focus on:
1. Security vulnerabilities
2. Gas optimization
3. Code quality and best practices
4. Potential attack vectors
Ensure the response is valid JSON.`
            },
            {
              role: "user",
              content: code
            }
          ],
          temperature: 0.3,
          stream: true
        },
        responseType: 'stream',
        onDownloadProgress: (progressEvent) => {
          try {
            const lines = progressEvent.event.target.response.split('\n')
            let jsonResponse = ''
            
            for (const line of lines) {
              if (line.trim() === '') continue
              if (line.includes('[DONE]')) break

              const message = line.replace(/^data: /, '').trim()
              if (message === '') continue

              try {
                const parsed = JSON.parse(message)
                if (parsed.choices[0].delta.content) {
                  jsonResponse += parsed.choices[0].delta.content
                  analysisStream.value = jsonResponse
                }
              } catch (e) {
                console.warn('Error parsing streaming message:', e)
              }
            }
          } catch (err) {
            console.error('Error processing stream:', err)
          }
        }
      })

      // Process the complete response
      const finalResult = JSON.parse(analysisStream.value)
      
      // Validate and format the response
      return {
        riskScore: Number(finalResult.riskScore) || 50,
        issues: finalResult.issues?.map(issue => ({
          severity: issue.severity?.toLowerCase() || 'medium',
          title: issue.title || 'Unknown Issue',
          description: issue.description || '',
          codeSnippet: issue.codeSnippet || ''
        })) || [],
        suggestions: finalResult.suggestions?.map(suggestion => ({
          title: suggestion.title || 'Unknown Suggestion',
          description: suggestion.description || ''
        })) || []
      }

    } catch (err) {
      error.value = err
      console.error('Error in LLM analysis:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    analyzeContract,
    isLoading,
    error,
    analysisStream
  }
}