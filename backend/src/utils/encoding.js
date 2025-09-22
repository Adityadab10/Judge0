/**
 * Utility functions for encoding and decoding Base64 strings
 * and handling Judge0 API responses
 */

// Convert string to Base64
const toBase64 = (str) => {
  return Buffer.from(str).toString('base64');
};

// Convert Base64 to string with error handling for corrupted data
const fromBase64 = (str) => {
  try {
    if (!str) return null;
    
    // Try to decode as base64 first
    const decoded = Buffer.from(str, 'base64').toString('utf8');
    
    // Check if the decoded string contains mostly non-printable characters
    // If so, it might be corrupted binary data
    const printableChars = decoded.replace(/[\x00-\x1F\x7F-\x9F]/g, '').length;
    const totalChars = decoded.length;
    
    if (totalChars > 0 && (printableChars / totalChars) < 0.5) {
      // More than 50% non-printable characters, likely corrupted
      console.warn('Detected corrupted base64 data, attempting alternative decoding...');
      
      // Try treating it as already decoded text
      if (str.length < 1000 && /^[a-zA-Z0-9+/]*={0,2}$/.test(str)) {
        // Looks like valid base64, but decoding gave garbage
        return `[Corrupted compilation output - length: ${str.length} chars]`;
      } else {
        // Might already be plain text
        return str;
      }
    }
    
    return decoded;
  } catch (error) {
    console.error('Base64 decoding error:', error.message);
    // Return the original string if decoding fails
    return str || null;
  }
};

// Decode Judge0 submission response
const decodeSubmissionResponse = (submission) => {
  try {
    if (!submission) return null;

    const decoded = {
      ...submission,
      stdout: submission.stdout ? decodeField(submission.stdout) : null,
      stderr: submission.stderr ? decodeField(submission.stderr) : null,
      compile_output: submission.compile_output ? decodeField(submission.compile_output) : null,
      message: submission.message ? decodeField(submission.message) : null,
    };

    return decoded;
  } catch (error) {
    console.error('Error decoding submission:', error);
    throw new Error('Failed to decode submission response');
  }
};

// Helper function to decode a field (either base64 or plain text)
const decodeField = (str) => {
  if (!str) return null;
  
  try {
    // Check if it looks like base64 (only contains base64 characters and has proper length)
    const isBase64 = /^[a-zA-Z0-9+/]*={0,2}$/.test(str) && str.length % 4 === 0 && str.length > 10;
    
    if (isBase64) {
      // Try to decode as base64
      const decoded = Buffer.from(str, 'base64').toString('utf8');
      
      // Validate the decoded content makes sense (mostly printable characters)
      const printableChars = decoded.replace(/[\x00-\x08\x0E-\x1F\x7F-\x9F]/g, '').length;
      const totalChars = decoded.length;
      
      // If more than 90% printable characters, it's likely valid decoded text
      if (totalChars > 0 && (printableChars / totalChars) > 0.9) {
        console.log('Successfully decoded base64 field');
        return decoded;
      }
    }
    
    // If not base64 or decoding didn't work, return as plain text
    console.log('Using field as plain text (not base64)');
    return str;
    
  } catch (error) {
    console.error('Field decoding error:', error.message);
    // Return the original string if decoding fails
    return str;
  }
};

module.exports = {
  toBase64,
  fromBase64,
  decodeSubmissionResponse,
  decodeField,
};
