import React, { useState } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);

  const handleSubmit = async () => {
    const lines = inputText.split(/\n+/).map(line => line.trim()).filter(Boolean);
    const validRequests = [];
    const errorMessages = [];

    for (let rawId of lines) {
      let regId = rawId;
      if (regId.length < 10) regId = regId.padStart(10, '0');

      if (regId.length !== 10 && regId.length !== 14) {
        errorMessages.push(`❌ Invalid ID "${rawId}": Must be 10 or 14 digits.`);
        continue;
      }

      const payload = {
        Info: JSON.stringify({
          ApplicationStatusFor: regId,
          Language: 'en',
          ApplicationUpdateStatus_Key: 'APPSUB',
          DistrictName: '05-WEST'
        })
      };

      try {
        const res = await fetch('/api/fetch-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        validRequests.push(data);
      } catch (err) {
        errorMessages.push(`⚠️ Failed for ID "${rawId}"`);
      }
    }

    setResults(validRequests);
    setErrors(errorMessages);
  };

  const headers = [...new Set(results.flatMap(obj => Object.keys(obj)))];

  return (
    <div className="App">
      <h2>Registration ID Checker</h2>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter one registration ID per line..."
      />
      <br />
      <button onClick={handleSubmit}>Fetch</button>

      {errors.length > 0 && (
        <div className="errors">{errors.join('\n')}</div>
      )}

      {results.length > 0 && (
        <table>
          <thead>
            <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {results.map((row, i) => (
              <tr key={i}>
                {headers.map((h, j) => (
                  <td key={j}>
                    {typeof row[h] === 'object' ? (
                      <pre>{JSON.stringify(row[h], null, 2)}</pre>
                    ) : (
                      row[h]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
