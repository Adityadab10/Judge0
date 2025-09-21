const axios = require('axios');
const { toBase64, decodeSubmissionResponse } = require('../utils/encoding');

// Configure axios instance for Judge0
const judge0Api = axios.create({
  baseURL: process.env.JUDGE0_URL,
  timeout: 30000, // 30 second timeout
});

class Judge0Service {
  // Fetch available languages from Judge0
  async getLanguages() {
    try {
      const response = await judge0Api.get('/languages');
      return response.data;
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw new Error('Failed to fetch languages from Judge0');
    }
  }

  // Create a submission with wait=true (synchronous)
  async createSyncSubmission(sourceCode, languageId, stdin) {
    try {
      const response = await judge0Api.post('/submissions', {
        source_code: toBase64(sourceCode),
        language_id: languageId,
        stdin: stdin ? toBase64(stdin) : null,
        wait: true
      });
      
      return decodeSubmissionResponse(response.data);
    } catch (error) {
      console.error('Error creating sync submission:', error);
      throw new Error('Failed to create submission');
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
