const axios = require('axios');
const { toBase64, decodeSubmissionResponse } = require('../utils/encoding');

// Configure axios instance for Judge0
const judge0Api = axios.create({
  baseURL: process.env.JUDGE0_URL,
  timeout: 30000, // 30 second timeout
});

class Judge0Service {
  // Health check for Judge0 connectivity
  async healthCheck() {
    try {
      const response = await judge0Api.get('/system_info');
      return { 
        status: 'connected', 
        version: response.data?.version || 'unknown',
        url: process.env.JUDGE0_URL 
      };
    } catch (error) {
      console.error('Judge0 health check failed:', error.message);
      throw new Error(`Judge0 not accessible at ${process.env.JUDGE0_URL}: ${error.message}`);
    }
  }

  // Fetch available languages from Judge0
  async getLanguages() {
    try {
      console.log('Fetching languages from:', process.env.JUDGE0_URL);
      const response = await judge0Api.get('/languages');
      console.log('Languages fetched successfully, count:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('Error fetching languages:', error.message);
      console.error('Judge0 URL:', process.env.JUDGE0_URL);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error('Failed to fetch languages from Judge0');
    }
  }

  // Create a submission with wait=true (synchronous)
  async createSyncSubmission(sourceCode, languageId, stdin) {
    try {
      console.log('Creating submission with source code length:', sourceCode.length);
      console.log('Language ID:', languageId);
      
      // First, create the submission
      const response = await judge0Api.post('/submissions', {
        source_code: toBase64(sourceCode),
        language_id: languageId,
        stdin: stdin ? toBase64(stdin) : null,
        wait: false  // Set to false and poll manually for better control
      });
      
      const token = response.data.token;
      console.log('Submission created with token:', token);
      
      // Poll for the result with timeout
      const maxAttempts = 30; // 30 seconds max wait time
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        console.log(`Polling attempt ${attempts + 1}/${maxAttempts} for token: ${token}`);
        
        try {
          const resultResponse = await judge0Api.get(`/submissions/${token}`);
          const submission = resultResponse.data;
          
          console.log('Submission status:', submission.status);
          
          // Check if submission is finished (status id 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit Exceeded, 6 = Compilation Error, etc.)
          if (submission.status && submission.status.id > 2) {
            console.log('Submission completed with status:', submission.status.description);
            return decodeSubmissionResponse(submission);
          }
          
          // Wait 1 second before next poll
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
          
        } catch (pollError) {
          console.error('Error polling submission:', pollError.message);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // If we reach here, submission timed out
      throw new Error('Submission timed out after 30 seconds');
      
    } catch (error) {
      console.error('Error creating sync submission:', error);
      console.error('Error details:', error.response?.data);
      throw new Error('Failed to create submission: ' + error.message);
    }
  }

  // Create a submission with wait=false (asynchronous)
  async createAsyncSubmission(sourceCode, languageId, stdin) {
    try {
      const response = await judge0Api.post('/submissions', {
        source_code: toBase64(sourceCode),
        language_id: languageId,
        stdin: stdin ? toBase64(stdin) : null,
        wait: false
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating async submission:', error);
      throw new Error('Failed to create submission');
    }
  }

  // Get submission details by token
  async getSubmission(token) {
    try {
      const response = await judge0Api.get(`/submissions/${token}`);
      return decodeSubmissionResponse(response.data);
    } catch (error) {
      console.error('Error fetching submission:', error);
      throw new Error('Failed to fetch submission details');
    }
  }

  // Run code against multiple testcases
  async runTestcases(sourceCode, languageId, testcases) {
    try {
      const results = [];
      
      for (const testcase of testcases) {
        const result = await this.createSyncSubmission(sourceCode, languageId, testcase);
        results.push({
          ...result,
          input: testcase,
          passed: result.status.id === 3 && !result.stderr // Status 3 is "Accepted"
        });
      }

      return results;
    } catch (error) {
      console.error('Error running testcases:', error);
      throw new Error('Failed to run testcases');
    }
  }
}

module.exports = new Judge0Service();
