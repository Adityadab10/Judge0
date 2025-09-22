const judge0Service = require('../services/judge0.service');

class CodeController {
  // GET /api/health - Health check for Judge0 connectivity
  async healthCheck(req, res) {
    try {
      const judge0Status = await judge0Service.healthCheck();
      res.json({ 
        status: 'healthy', 
        judge0: judge0Status,
        judge0_url: process.env.JUDGE0_URL 
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'unhealthy', 
        error: error.message,
        judge0_url: process.env.JUDGE0_URL 
      });
    }
  }

  // GET /api/languages
  async getLanguages(req, res) {
    try {
      const languages = await judge0Service.getLanguages();
      res.json(languages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/run-sync
  async runSync(req, res) {
    try {
      const { source_code, language_id, stdin } = req.body;
      
      console.log('Received run request:', {
        source_code_length: source_code?.length || 0,
        language_id,
        has_stdin: !!stdin
      });
      
      if (!source_code || !language_id) {
        console.log('Missing required fields:', { source_code: !!source_code, language_id: !!language_id });
        return res.status(400).json({ error: 'Missing required fields' });
      }

      console.log('Calling Judge0 service...');
      const result = await judge0Service.createSyncSubmission(source_code, language_id, stdin);
      
      console.log('Judge0 response received:', {
        status: result.status?.description,
        has_stdout: !!result.stdout,
        has_stderr: !!result.stderr,
        has_compile_output: !!result.compile_output
      });
      
      // Log the actual decoded content for debugging
      if (result.compile_output) {
        console.log('Decoded compile_output:', JSON.stringify(result.compile_output));
      }
      if (result.stdout) {
        console.log('Decoded stdout:', JSON.stringify(result.stdout));
      }
      if (result.stderr) {
        console.log('Decoded stderr:', JSON.stringify(result.stderr));
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error in runSync:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/create-submission
  async createSubmission(req, res) {
    try {
      const { source_code, language_id, stdin } = req.body;
      
      if (!source_code || !language_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await judge0Service.createAsyncSubmission(source_code, language_id, stdin);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/submissions/:token
  async getSubmission(req, res) {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }

      const result = await judge0Service.getSubmission(token);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/run-testcases
  async runTestcases(req, res) {
    try {
      const { source_code, language_id, testcases } = req.body;
      
      if (!source_code || !language_id || !Array.isArray(testcases)) {
        return res.status(400).json({ error: 'Invalid request body' });
      }

      const results = await judge0Service.runTestcases(source_code, language_id, testcases);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CodeController();
