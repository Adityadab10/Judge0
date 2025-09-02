import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './CodeEditorRunner.css';

const CodeEditorRunner = () => {
  const defaultCode = `// Sample JavaScript code to test
function findSum(numbers) {
    return numbers.reduce((sum, num) => sum + num, 0);
}

// Example usage:
const numbers = [1, 2, 3, 4, 5];
const sum = findSum(numbers);
console.log(\`Sum of numbers: \${sum}\`);`;

  const [code, setCode] = useState(defaultCode);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [stdin, setStdin] = useState('1 2 3 4 5');
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pollInterval, setPollInterval] = useState(null);
  const [testcases, setTestcases] = useState([{ stdin: '', expected: '' }]);

  // Fetch available languages on mount
  useEffect(() => {
    fetchLanguages();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pollInterval]);

  const fetchLanguages = async () => {
    try {
      const response = await axios.get('/api/languages');
      setLanguages(response.data);
      
      // Set default language to JavaScript/Node.js if available
      const jsLang = response.data.find(lang => 
        lang.name.toLowerCase().includes('javascript') || 
        lang.name.toLowerCase().includes('node')
      );
      if (jsLang) setSelectedLanguage(jsLang.id);
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const runCodeSync = async () => {
    try {
      setIsLoading(true);
      setOutput(null);
      
      const response = await axios.post('/api/run-sync', {
        source_code: code,
        language_id: selectedLanguage,
        stdin
      });
      
      setOutput(response.data);
    } catch (error) {
      console.error('Error running code:', error);
      setOutput({ error: error.response?.data?.error || 'Error running code' });
    } finally {
      setIsLoading(false);
    }
  };

  const runCodeAsync = async () => {
    try {
      setIsLoading(true);
      setOutput(null);
      
      // Create submission
      const response = await axios.post('/api/create-submission', {
        source_code: code,
        language_id: selectedLanguage,
        stdin
      });
      
      const token = response.data.token;
      
      // Start polling
      const interval = setInterval(async () => {
        const statusResponse = await axios.get(`/api/submissions/${token}`);
        const submission = statusResponse.data;
        
        if (submission.status.id !== 1 && submission.status.id !== 2) { // Not queued or processing
          clearInterval(interval);
          setPollInterval(null);
          setIsLoading(false);
          setOutput(submission);
        }
      }, 1000);
      
      setPollInterval(interval);
    } catch (error) {
      console.error('Error running code:', error);
      setOutput({ error: error.response?.data?.error || 'Error running code' });
      setIsLoading(false);
    }
  };

  const runTestcases = async () => {
    try {
      setIsLoading(true);
      setOutput(null);
      
      const response = await axios.post('/api/run-testcases', {
        source_code: code,
        language_id: selectedLanguage,
        testcases: testcases.map(t => t.stdin)
      });
      
      // Combine results with expected outputs
      const results = response.data.map((result, index) => ({
        ...result,
        expected: testcases[index].expected
      }));
      
      setOutput({ testcases: results });
    } catch (error) {
      console.error('Error running testcases:', error);
      setOutput({ error: error.response?.data?.error || 'Error running testcases' });
    } finally {
      setIsLoading(false);
    }
  };

  const stopExecution = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
      setIsLoading(false);
    }
  };

  const addTestcase = () => {
    setTestcases([...testcases, { stdin: '', expected: '' }]);
  };

  const updateTestcase = (index, field, value) => {
    const newTestcases = [...testcases];
    newTestcases[index][field] = value;
    setTestcases(newTestcases);
  };

  const removeTestcase = (index) => {
    setTestcases(testcases.filter((_, i) => i !== index));
  };

  return (
    <div className="code-editor-container">
      <div className="editor-header">
        <select 
          value={selectedLanguage || ''} 
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="language-select"
        >
          <option value="">Select Language</option>
          {languages.map(lang => (
            <option key={lang.id} value={lang.id}>{lang.name}</option>
          ))}
        </select>
        
        <div className="button-group">
          <button onClick={runCodeSync} disabled={isLoading || !selectedLanguage}>
            Run (Sync)
          </button>
          <button onClick={runCodeAsync} disabled={isLoading || !selectedLanguage}>
            Run (Async)
          </button>
          <button onClick={stopExecution} disabled={!isLoading}>
            Stop
          </button>
          <button onClick={runTestcases} disabled={isLoading || !selectedLanguage}>
            Run Testcases
          </button>
        </div>
      </div>

      <div className="editor-main">
        <div className="editor-wrapper">
          <Editor
            height="70vh"
            defaultLanguage="javascript"
            value={code}
            onChange={setCode}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        <div className="io-panel">
          <div className="stdin-section">
            <h3>Input</h3>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter input here..."
              disabled={isLoading}
            />
          </div>

          <div className="testcases-section">
            <h3>Testcases</h3>
            <button onClick={addTestcase} className="add-testcase-btn">
              Add Testcase
            </button>
            
            {testcases.map((testcase, index) => (
              <div key={index} className="testcase">
                <div className="testcase-header">
                  <span>Testcase {index + 1}</span>
                  <button onClick={() => removeTestcase(index)}>Remove</button>
                </div>
                <textarea
                  value={testcase.stdin}
                  onChange={(e) => updateTestcase(index, 'stdin', e.target.value)}
                  placeholder="Input"
                  disabled={isLoading}
                />
                <textarea
                  value={testcase.expected}
                  onChange={(e) => updateTestcase(index, 'expected', e.target.value)}
                  placeholder="Expected output"
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>

          <div className="output-section">
            <h3>Output</h3>
            {isLoading && <div className="loading">Running code...</div>}
            {output && (
              <div className="output-content">
                {output.error ? (
                  <pre className="error">{output.error}</pre>
                ) : output.testcases ? (
                  <div className="testcase-results">
                    {output.testcases.map((result, index) => (
                      <div 
                        key={index}
                        className={`testcase-result ${result.passed ? 'passed' : 'failed'}`}
                      >
                        <h4>Testcase {index + 1}</h4>
                        <div>Status: {result.status.description}</div>
                        {result.stdout && <pre>Output: {result.stdout}</pre>}
                        {result.stderr && <pre className="error">Error: {result.stderr}</pre>}
                        {result.compile_output && (
                          <pre className="error">Compile Error: {result.compile_output}</pre>
                        )}
                        <div>Time: {result.time} s</div>
                        <div>Memory: {result.memory} KB</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div>Status: {output.status.description}</div>
                    {output.stdout && <pre>Output: {output.stdout}</pre>}
                    {output.stderr && <pre className="error">Error: {output.stderr}</pre>}
                    {output.compile_output && (
                      <pre className="error">Compile Error: {output.compile_output}</pre>
                    )}
                    <div>Time: {output.time} s</div>
                    <div>Memory: {output.memory} KB</div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorRunner;
