import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const CodeEditorRunner = () => {
  const defaultCode = `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`;

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
      
      // Set default language to C if available
      const cLang = response.data.find(lang => 
        lang.name.toLowerCase().includes('c') && 
        !lang.name.toLowerCase().includes('++') &&
        !lang.name.toLowerCase().includes('#')
      );
      if (cLang) {
        console.log('Setting default language to:', cLang.name);
        setSelectedLanguage(cLang.id);
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
      
      const response = await axios.post('/api/run', {
        source_code: code,
        language_id: selectedLanguage,
        stdin: input
      });
      
      const result = response.data;
      
      // Format output
      let outputText = '';
      
      if (result.compile_output) {
        outputText += `Compilation Error:\n${result.compile_output}\n`;
      }
      
      if (result.stdout) {
        outputText += `Output:\n${result.stdout}\n`;
      }
      
      if (result.stderr) {
        outputText += `Error:\n${result.stderr}\n`;
      }
      
      if (result.status) {
        outputText += `\nStatus: ${result.status.description}`;
        outputText += `\nTime: ${result.time}s`;
        outputText += `\nMemory: ${result.memory}KB`;
      }
      
      setOutput(outputText || 'No output generated.');
      
    } catch (error) {
      console.error('Error running code:', error);
      setOutput(`Error: ${error.response?.data?.error || error.message || 'Failed to run code'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-900 text-white box-border">
      <div className="flex justify-between items-center mb-4 p-4 bg-gray-800 rounded-lg">
        <select 
          value={selectedLanguage || ''} 
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="px-2 py-2 text-base bg-gray-700 text-white border border-gray-600 rounded min-w-[200px] focus:outline-none focus:border-blue-500"
        >
          <option value="">Select Language</option>
          {languages.map(lang => (
            <option key={lang.id} value={lang.id}>{lang.name}</option>
          ))}
        </select>
        
        <button 
          onClick={runCode} 
          disabled={isLoading || !selectedLanguage}
          className="px-6 py-2 text-base bg-blue-600 text-white border-none rounded cursor-pointer font-bold transition-colors duration-200 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Running...' : 'Run Code'}
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <h3 className="m-0 mb-2 text-white text-lg">Code Editor</h3>
          <Editor
            height="400px"
            defaultLanguage="c"
            value={code}
            onChange={setCode}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        </div>

        <div className="w-96 flex flex-col gap-4">
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="m-0 mb-2 text-white text-lg">Input</h3>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input here (optional)..."
              disabled={isLoading}
              rows="6"
              className="flex-1 min-h-[120px] p-2 bg-gray-800 text-white border border-gray-600 rounded font-mono text-sm resize-y box-border focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="m-0 mb-2 text-white text-lg">Output</h3>
            <pre className="flex-1 min-h-[150px] p-2 bg-gray-950 text-white border border-gray-600 rounded font-mono text-sm whitespace-pre-wrap overflow-y-auto m-0 box-border">
              {output || 'Click "Run Code" to see output here...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorRunner;
