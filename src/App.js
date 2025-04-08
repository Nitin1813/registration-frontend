import React, { useState } from 'react';
import { Container, Button, Modal, Table, Form, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => setShowModal(false);

  const handleSubmit = async () => {
    const lines = inputText.split(/\n+/).map(line => line.trim()).filter(Boolean);
    const validRequests = [];
    const errorMessages = [];
    setLoading(true);
    setResults([]);
    setErrors([]);

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
    setLoading(false);
    if (validRequests.length > 0) setShowModal(true);
  };

  const formatDistrict = (gdArray) => {
    if (!Array.isArray(gdArray) || gdArray.length === 0) return '-';
    const district = gdArray[0].DistrictName || '';
    return district.split('-')[1]?.trim() || district;
  };

  const extractName = (nameString) => {
    if (!nameString) return '-';
    return nameString.split('=>')[0].trim();
  };

  const getRowStyle = (status) => {
    console.log(status)
    if (status === 'Approved Application') return { backgroundColor: '#00FF00'   }; // light green
    if (status === 'Application has Deficiencies') return { backgroundColor: '#fff3cd' }; // light orange
    if (status === 'Rejected Application') return { backgroundColor: '#a12e2e' }; // light red
    if (status === 'Submitted Application') return { backgroundColor: '#d4edda'} 
    return {};
  };

  return (
    <Container className="my-4">
      <h2>Registration ID Checker</h2>
      <Form.Control
        as="textarea"
        rows={6}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter one registration ID per line..."
        className="mb-3"
      />
      <Button variant="primary" onClick={handleSubmit} disabled={loading}>
        {loading ? <><Spinner animation="border" size="sm" /> Loading...</> : 'Get Details'}
      </Button>

      {errors.length > 0 && (
        <div className="text-danger mt-3 white-space-pre-line">{errors.join('\n')}</div>
      )}

      <Container>
        <Modal show={showModal} onHide={handleClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Application Results</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Key</th>
                  <th>District</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, i) => (
                  <tr key={i}>
                    <td>{row.ApplicationIdGenerated}</td>
                    <td>{extractName(row.NameOfApplicant)}</td>
                    <td>{row.ApplicationType}</td>
                    <td style={getRowStyle(row.Status)}>{row.Status}</td>
                    <td>{row.ApplicationCurrentStatus_Key}</td>
                    <td>{formatDistrict(row.GD)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Container>
  );
}

export default App;
