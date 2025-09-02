/**
 * Utility functions for encoding and decoding Base64 strings
 * and handling Judge0 API responses
 */

// Convert string to Base64
const toBase64 = (str) => {
  return Buffer.from(str).toString('base64');
};

// Convert Base64 to string
const fromBase64 = (str) => {
  return Buffer.from(str, 'base64').toString();
};

// Decode Judge0 submission response
const decodeSubmissionResponse = (submission) => {
  try {
    if (!submission) return null;

    const decoded = {
      ...submission,
      stdout: submission.stdout ? fromBase64(submission.stdout) : null,
      stderr: submission.stderr ? fromBase64(submission.stderr) : null,
      compile_output: submission.compile_output ? fromBase64(submission.compile_output) : null,
      message: submission.message ? fromBase64(submission.message) : null,
    };

    return decoded;
  } catch (error) {
    console.error('Error decoding submission:', error);
    throw new Error('Failed to decode submission response');
  }
};

module.exports = {
  toBase64,
  fromBase64,
  decodeSubmissionResponse,
};
