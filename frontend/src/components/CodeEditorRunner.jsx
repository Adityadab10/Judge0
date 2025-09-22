import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const CodeEditorRunner = () => {
  // Internal CSS styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100vh',
      minHeight: '100vh',
      padding: '16px',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      padding: '16px',
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid #334155'
    },
    select: {
      padding: '12px 16px',
      fontSize: '16px',
      backgroundColor: '#374151',
      color: '#ffffff',
      border: '2px solid #4b5563',
      borderRadius: '8px',
      minWidth: '220px',
      outline: 'none',
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer'
    },
    selectFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    button: {
      padding: '12px 24px',
      fontSize: '16px',
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.2s ease-in-out',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      textTransform: 'uppercase',
      letterSpacing: '0.025em'
    },
    buttonHover: {
      backgroundColor: '#2563eb',
      transform: 'translateY(-1px)',
      boxShadow: '0 8px 12px -2px rgba(0, 0, 0, 0.2)'
    },
    buttonDisabled: {
      backgroundColor: '#4b5563',
      cursor: 'not-allowed',
      opacity: '0.7',
      transform: 'none'
    },
    mainContent: {
      display: 'flex',
      gap: '16px',
      flex: '1',
      minHeight: '0'
    },
    editorSection: {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      minWidth: '0'
    },
    sectionTitle: {
      marginBottom: '8px',
      color: '#f1f5f9',
      fontSize: '18px',
      fontWeight: '600',
      letterSpacing: '0.025em'
    },
    editorContainer: {
      flex: '1',
      border: '2px solid #475569',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'border-color 0.2s ease-in-out'
    },
    editorContainerFocus: {
      borderColor: '#3b82f6'
    },
    inputOutputPanel: {
      width: '400px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    inputOutputSection: {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '0'
    },
    textarea: {
      flex: '1',
      minHeight: '140px',
      padding: '12px',
      backgroundColor: '#1e293b',
      color: '#ffffff',
      border: '2px solid #475569',
      borderRadius: '8px',
      fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
      fontSize: '14px',
      resize: 'vertical',
      outline: 'none',
      transition: 'all 0.2s ease-in-out'
    },
    textareaFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    output: {
      flex: '1',
      minHeight: '180px',
      padding: '12px',
      backgroundColor: '#020617',
      color: '#e2e8f0',
      border: '2px solid #475569',
      borderRadius: '8px',
      fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
      fontSize: '14px',
      whiteSpace: 'pre-wrap',
      overflowY: 'auto',
      lineHeight: '1.5',
      scrollbarWidth: 'thin',
      scrollbarColor: '#475569 #1e293b'
    },
    placeholder: {
      color: '#64748b',
      fontStyle: 'italic'
    }
  };

  const defaultCode = `' FreeBasic Hello World Program
Print "Hello, World from FreeBasic!"
Print "This is a simple FreeBasic program"
Print "Current version: FBC 1.07.1"

' Simple calculations
Dim a As Integer = 10
Dim b As Integer = 20
Dim sum As Integer = a + b

Print "Addition: " & a & " + " & b & " = " & sum

' Loop example
Print "Counting from 1 to 5:"
For i As Integer = 1 To 5
    Print "Count: " & i
Next i

Print "Program completed successfully!"`;

  const [code, setCode] = useState(defaultCode);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available languages on mount
  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      console.log('Fetching languages from /api/languages...');
      const response = await axios.get('/api/languages');
      console.log('Languages response:', response.data);
      setLanguages(response.data);
      
      // Set default language to FreeBasic (FBC 1.07.1) if available
      const fbLang = response.data.find(lang => 
        lang.name.toLowerCase().includes('basic') && 
        lang.name.toLowerCase().includes('fbc')
      );
      if (fbLang) {
        console.log('Setting default language to:', fbLang.name);
        setSelectedLanguage(fbLang.id);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setOutput(`Error: Could not fetch languages. ${error.response?.data?.error || error.message || 'Make sure the backend server is running.'}`);
    }
  };

  const runCode = async () => {
    if (!selectedLanguage) {
      setOutput('Error: Please select a language first.');
      return;
    }

    try {
      setIsLoading(true);
      setOutput('Running code...');
      
      console.log('Sending code to Judge0:', {
        source_code: code,
        language_id: selectedLanguage,
        stdin: input
      });
      
      const response = await axios.post('/api/run', {
        source_code: code,
        language_id: selectedLanguage,
        stdin: input
      });
      
      const result = response.data;
      
      // Log the complete response from Judge0
      console.log('Judge0 Response:', result);
      console.log('=== EXECUTION DETAILS ===');
      console.log('Status:', result.status);
      console.log('Execution Time:', result.time, 'seconds');
      console.log('Memory Used:', result.memory, 'KB');
      console.log('=== OUTPUT ===');
      console.log('STDOUT:', result.stdout);
      console.log('STDERR:', result.stderr);
      console.log('COMPILE_OUTPUT:', result.compile_output);
      console.log('MESSAGE:', result.message);
      console.log('========================');
      
      // Format output for display
      let outputText = '';
      
      // Show compilation output if any
      if (result.compile_output) {
        outputText += `Compilation Output:\n${result.compile_output}\n\n`;
      }
      
      // Show standard output (main program output)
      if (result.stdout) {
        outputText += `Program Output:\n${result.stdout}\n`;
      }
      
      // Show error output if any
      if (result.stderr) {
        outputText += `Error Output:\n${result.stderr}\n`;
      }
      
      // Show any additional messages
      if (result.message) {
        outputText += `System Message:\n${result.message}\n`;
      }
      
      // Show execution details
      if (result.status) {
        outputText += `\n--- Execution Details ---\n`;
        outputText += `Status: ${result.status.description}\n`;
        outputText += `Exit Code: ${result.exit_code || 'N/A'}\n`;
        outputText += `Execution Time: ${result.time || 'N/A'}s\n`;
        outputText += `Memory Used: ${result.memory || 'N/A'}KB\n`;
      }
      
      // If there's a token, show it for debugging
      if (result.token) {
        outputText += `\nSubmission Token: ${result.token}`;
      }
      
      setOutput(outputText || 'Code executed but no output was generated.');
      
    } catch (error) {
      console.error('Error running code:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setOutput(`Error: ${error.response?.data?.error || error.message || 'Failed to run code'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <select 
          value={selectedLanguage || ''} 
          onChange={(e) => setSelectedLanguage(e.target.value)}
          style={styles.select}
          onFocus={(e) => Object.assign(e.target.style, styles.selectFocus)}
          onBlur={(e) => Object.assign(e.target.style, styles.select)}
        >
          <option value="">Select Language</option>
          {languages.map(lang => (
            <option key={lang.id} value={lang.id}>{lang.name}</option>
          ))}
        </select>
        
        <button 
          onClick={runCode} 
          disabled={isLoading || !selectedLanguage}
          style={{
            ...styles.button,
            ...(isLoading || !selectedLanguage ? styles.buttonDisabled : {})
          }}
          onMouseEnter={(e) => {
            if (!isLoading && selectedLanguage) {
              Object.assign(e.target.style, { ...styles.button, ...styles.buttonHover });
            }
          }}
          onMouseLeave={(e) => {
            Object.assign(e.target.style, styles.button);
          }}
        >
          {isLoading ? 'Running...' : 'Run Code'}
        </button>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        {/* Code Editor Section */}
        <div style={styles.editorSection}>
          <h3 style={styles.sectionTitle}>Code Editor</h3>
          <div 
            style={styles.editorContainer}
            onFocus={(e) => Object.assign(e.target.style, { ...styles.editorContainer, ...styles.editorContainerFocus })}
            onBlur={(e) => Object.assign(e.target.style, styles.editorContainer)}
          >
            <Editor
              height="100%"
              defaultLanguage="vb"
              value={code}
              onChange={setCode}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Input/Output Panel */}
        <div style={styles.inputOutputPanel}>
          {/* Input Section */}
          <div style={styles.inputOutputSection}>
            <h3 style={styles.sectionTitle}>Input</h3>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input here (optional)..."
              disabled={isLoading}
              rows="6"
              style={styles.textarea}
              onFocus={(e) => Object.assign(e.target.style, { ...styles.textarea, ...styles.textareaFocus })}
              onBlur={(e) => Object.assign(e.target.style, styles.textarea)}
            />
          </div>

          {/* Output Section */}
          <div style={styles.inputOutputSection}>
            <h3 style={styles.sectionTitle}>Output</h3>
            <pre style={styles.output}>
              {output || <span style={styles.placeholder}>Click "Run Code" to see output here...</span>}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorRunner;
