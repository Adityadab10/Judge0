const judge0Service = require('../services/judge0.service');

class CodeController {
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
      
      if (!source_code || !language_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await judge0Service.createSyncSubmission(source_code, language_id, stdin);
      res.json(result);
    } catch (error) {
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
