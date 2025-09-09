import React, { useState, useEffect } from 'react';
import springBootApi from '../services/springBootApi';
import flaskApi from '../services/flaskApi';
import authService from '../services/authservice';


/**
 * Test component for verifying Spring Boot authentication integration
 */
const AuthTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};
    
    // Test 1: Check if token exists
    const token = localStorage.getItem('token');
    console.log('Current token:', token);
    results.tokenExists = !!token;
    
    // Test 2: Check Spring Boot API connection with JWT token
    try {
      // Explicitly log the token before making the request
      const token = localStorage.getItem('token');
      console.log('Token being used for auth test:', token ? `${token.substring(0, 15)}...` : 'No token found');
      
      // Call Spring Boot's authentication endpoint with explicit JWT token in headers
      const response = await springBootApi.get('/auth/validate-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Spring Boot auth test response:', response);
      results.springBootConnection = 'Success';
    } catch (error) {
      // Use the formatted error message from our API interceptors
      const errorMsg = error.message || 'Unknown error occurred';
      console.error('Spring Boot auth test error:', error);
      results.springBootConnection = `Error: ${errorMsg}`;
    }
    
    // Test 3: Check Flask API connection with Spring Boot token
    try {
      await flaskApi.get('/portfolio/fetch-data');
      results.flaskConnection = 'Success';
    } catch (error) {
      // Use the formatted error message from our API interceptors
      const errorMsg = error.message || 'Unknown error occurred';
      results.flaskConnection = `Error: ${errorMsg}`;
    }
    
    // Test 4: Check authentication status
    results.isAuthenticated = authService.isAuthenticated();
    
    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Authentication Integration Test</h2>
      
      <button 
        onClick={runTests}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Running Tests...' : 'Run Tests'}
      </button>
      
      {Object.keys(testResults).length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Test Results:</h3>
          <ul className="space-y-2">
            {Object.entries(testResults).map(([test, result]) => (
              <li key={test} className="border-b pb-2">
                <span className="font-medium">{test}:</span>{' '}
                {typeof result === 'boolean' ? 
                  (result ? '✅ Pass' : '❌ Fail') : 
                  result}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <p>This component tests the integration between:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Spring Boot authentication</li>
          <li>Flask API with Spring Boot JWT token</li>
          <li>Frontend authentication state</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthTest;