import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './App.css';

// --- Configuration ---
const BACKEND_URL = 'http://127.0.0.1:5001/bfhl'; // Or your deployed backend URL
const YOUR_ROLL_NUMBER = "0827AL221142"; // e.g., ABCD123 (Same as backend)

function App() {
  const [jsonInput, setJsonInput] = useState('{"data": ["M","1","334","4","B","Z","a","7"]}'); // Default example
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  useEffect(() => {
    document.title = YOUR_ROLL_NUMBER;
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setApiResponse(null);
    setSelectedFilters([]); // Reset filters on new submission
    setIsLoading(true);

    let requestPayload;
    try {
      requestPayload = JSON.parse(jsonInput);
      if (typeof requestPayload.data === 'undefined') { // Basic check for data key
        setError('Invalid JSON: "data" key is missing.');
        setIsLoading(false);
        return;
      }
    } catch (e) {
      setError('Invalid JSON format. Please check your input.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(BACKEND_URL, requestPayload);
      if (response.data.is_success) {
        setApiResponse(response.data);
      } else {
        setError(response.data.error || 'API returned success=false');
      }
    } catch (err) {
      console.error("API Error:", err);
      setError(err.response?.data?.error || err.message || 'An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOptions = [
    { value: 'alphabets', label: 'Alphabets' },
    { value: 'numbers', label: 'Numbers' },
    { value: 'highest_lowercase_alphabet', label: 'Highest Lowercase Alphabet' },
  ];

  const getFilteredResponse = () => {
    if (!apiResponse || selectedFilters.length === 0) {
      return null; // Or show all if no filter selected, based on preference
    }
    const filtered = {};
    selectedFilters.forEach(filter => {
      if (apiResponse.hasOwnProperty(filter.value)) {
        filtered[filter.value] = apiResponse[filter.value];
      }
    });
    return filtered;
  };

  const displayedResponse = getFilteredResponse();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bajaj Finserv Health Dev Challenge</h1>
        <p>My Roll Number: {YOUR_ROLL_NUMBER}</p>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="input-form">
          <label htmlFor="jsonInput">API Input (JSON):</label>
          <textarea
            id="jsonInput"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows="5"
            placeholder='e.g., {"data": ["A","1","b"], "file_b64": "YOUR_BASE64_STRING"}'
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit to Backend'}
          </button>
        </form>

        {error && <p className="error-message">Error: {error}</p>}

        {apiResponse && (
          <div className="response-section">
            <h2>Full API Response:</h2>
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>

            <h3>Filter Response:</h3>
            <Select
              isMulti
              options={filterOptions}
              value={selectedFilters}
              onChange={setSelectedFilters}
              className="multi-select"
              classNamePrefix="select"
              placeholder="Select filters..."
            />

            {displayedResponse && Object.keys(displayedResponse).length > 0 && (
              <div className="filtered-response">
                <h4>Filtered Data:</h4>
                {Object.entries(displayedResponse).map(([key, value]) => (
                  <p key={key}>
                    <strong>{filterOptions.find(opt => opt.value === key)?.label || key}: </strong>
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </p>
                ))}
              </div>
            )}
             {displayedResponse && Object.keys(displayedResponse).length === 0 && selectedFilters.length > 0 && (
                <p>No data matched for selected filters in the current response.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;