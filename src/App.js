import React, { useState } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [convertedCode, setConvertedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeType, setCodeType] = useState('html');
  const [fileInfo, setFileInfo] = useState(null);
  
  // New state for contacts upload
  const [selectedContactsFile, setSelectedContactsFile] = useState(null);
  const [extractedEmails, setExtractedEmails] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState('');
  const [contactsFileInfo, setContactsFileInfo] = useState(null);

  // New state for HTML template upload
  const [selectedHtmlFile, setSelectedHtmlFile] = useState(null);
  const [htmlLoading, setHtmlLoading] = useState(false);
  const [htmlError, setHtmlError] = useState('');
  const [htmlFileInfo, setHtmlFileInfo] = useState(null);
  const [htmlResult, setHtmlResult] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Only accept PDF files
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setSelectedFile(file);
        setError('');
        setFileInfo({
          type: 'PDF',
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          name: file.name
        });
      } else {
        setError('Please select a PDF file');
        setSelectedFile(null);
        setFileInfo(null);
      }
    }
  };

  const handleContactsFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Only accept CSV files
      if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
        setSelectedContactsFile(file);
        setContactsError('');
        setContactsFileInfo({
          type: 'CSV',
          size: (file.size / 1024).toFixed(2) + ' KB',
          name: file.name
        });
      } else {
        setContactsError('Please select a CSV file');
        setSelectedContactsFile(null);
        setContactsFileInfo(null);
      }
    }
  };

  const handleHtmlFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Only accept HTML files
      if (file.type === 'text/html' || file.name.toLowerCase().endsWith('.html')) {
        setSelectedHtmlFile(file);
        setHtmlError('');
        setHtmlFileInfo({
          type: 'HTML',
          size: (file.size / 1024).toFixed(2) + ' KB',
          name: file.name
        });
      } else {
        setHtmlError('Please select an HTML file');
        setSelectedHtmlFile(null);
        setHtmlFileInfo(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError('');
    setConvertedCode('');

    const formData = new FormData();
    formData.append('template', selectedFile);
    formData.append('codeType', codeType);

    try {
      const response = await fetch('https://newbackend-sage.vercel.app/api/convert-template', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Conversion failed with status ${response.status}`);
      }

      const result = await response.json();
      setConvertedCode(result.code);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContactsUpload = async () => {
    if (!selectedContactsFile) {
      setContactsError('Please select a CSV file first');
      return;
    }

    setContactsLoading(true);
    setContactsError('');
    setExtractedEmails([]);

    const formData = new FormData();
    formData.append('contacts', selectedContactsFile);

    try {
      const response = await fetch('https://newbackend-sage.vercel.app/api/extract-emails', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Email extraction failed with status ${response.status}`);
      }

      const result = await response.json();
      // Handle both array of strings and array of objects
      const emails = result.emails.map(email => 
        typeof email === 'string' ? email : email.email || email
      );
      setExtractedEmails(emails);
    } catch (err) {
      setContactsError(err.message);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleHtmlUpload = async () => {
    if (!selectedHtmlFile) {
      setHtmlError('Please select an HTML file first');
      return;
    }

    setHtmlLoading(true);
    setHtmlError('');
    setHtmlResult(null);

    const formData = new FormData();
    formData.append('htmlTemplate', selectedHtmlFile);
    formData.append('subject', emailSubject || 'Your Document');

    try {
      const response = await fetch('https://newbackend-sage.vercel.app/api/send-html-template', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTML email sending failed with status ${response.status}`);
      }

      const result = await response.json();
      setHtmlResult(result);
    } catch (err) {
      setHtmlError(err.message);
    } finally {
      setHtmlLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(convertedCode)
      .then(() => alert('Code copied to clipboard!'))
      .catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = convertedCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Code copied to clipboard!');
      });
  };

  const copyEmailsToClipboard = () => {
    const emailList = extractedEmails.join('\n');
    navigator.clipboard.writeText(emailList)
      .then(() => alert('Emails copied to clipboard!'))
      .catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = emailList;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Emails copied to clipboard!');
      });
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([convertedCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `converted-template.${codeType === 'react' ? 'jsx' : 'html'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadEmails = () => {
    const element = document.createElement('a');
    const emailList = extractedEmails.join('\n');
    const file = new Blob([emailList], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'extracted-emails.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>PDF to Code Converter & Email System</h1>
        <p style={{ color: '#666' }}>Upload your PDF file and convert it to HTML, extract emails from CSV, or send HTML email templates</p>
      </header>

      <main style={{ display: 'grid', gap: '30px' }}>
        {/* PDF Conversion Section */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>Upload PDF</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <input
                type="radio"
                value="html"
                checked={codeType === 'html'}
                onChange={(e) => setCodeType(e.target.value)}
              />
              HTML
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              id="file-input"
              style={{ display: 'none' }}
            />
            <label 
              htmlFor="file-input" 
              style={{ 
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {selectedFile ? selectedFile.name : 'Choose PDF file'}
            </label>
          </div>

          {fileInfo && (
            <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
              <span style={{ 
                backgroundColor: '#28a745', 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                marginRight: '10px' 
              }}>
                {fileInfo.type}
              </span>
              <span>{fileInfo.size}</span>
            </div>
          )}

          {error && <div style={{ color: '#dc3545', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            style={{
              padding: '12px 24px',
              backgroundColor: (!selectedFile || loading) ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (!selectedFile || loading) ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Converting...' : 'Convert PDF'}
          </button>
        </div>

        {/* HTML Template Upload Section */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f0f8ff' }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>Send HTML Email Template</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Email Subject:
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Enter email subject (optional)"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <input
              type="file"
              accept=".html"
              onChange={handleHtmlFileSelect}
              id="html-input"
              style={{ display: 'none' }}
            />
            <label 
              htmlFor="html-input" 
              style={{ 
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {selectedHtmlFile ? selectedHtmlFile.name : 'Choose HTML file'}
            </label>
          </div>

          {htmlFileInfo && (
            <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
              <span style={{ 
                backgroundColor: '#17a2b8', 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                marginRight: '10px' 
              }}>
                {htmlFileInfo.type}
              </span>
              <span>{htmlFileInfo.size}</span>
            </div>
          )}

          {htmlError && <div style={{ color: '#dc3545', marginBottom: '20px', fontSize: '14px' }}>{htmlError}</div>}

          <button
            onClick={handleHtmlUpload}
            disabled={!selectedHtmlFile || htmlLoading}
            style={{
              padding: '12px 24px',
              backgroundColor: (!selectedHtmlFile || htmlLoading) ? '#ccc' : '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (!selectedHtmlFile || htmlLoading) ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {htmlLoading ? 'Sending Emails...' : 'Send HTML Template'}
          </button>
        </div>

        {/* Contacts Upload Section */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff8dc' }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>Upload Contacts</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleContactsFileSelect}
              id="contacts-input"
              style={{ display: 'none' }}
            />
            <label 
              htmlFor="contacts-input" 
              style={{ 
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#ffc107',
                color: '#212529',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {selectedContactsFile ? selectedContactsFile.name : 'Choose CSV file'}
            </label>
          </div>

          {contactsFileInfo && (
            <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
              <span style={{ 
                backgroundColor: '#ffc107', 
                color: '#212529', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                marginRight: '10px' 
              }}>
                {contactsFileInfo.type}
              </span>
              <span>{contactsFileInfo.size}</span>
            </div>
          )}

          {contactsError && <div style={{ color: '#dc3545', marginBottom: '20px', fontSize: '14px' }}>{contactsError}</div>}

          <button
            onClick={handleContactsUpload}
            disabled={!selectedContactsFile || contactsLoading}
            style={{
              padding: '12px 24px',
              backgroundColor: (!selectedContactsFile || contactsLoading) ? '#ccc' : '#ffc107',
              color: '#212529',
              border: 'none',
              borderRadius: '4px',
              cursor: (!selectedContactsFile || contactsLoading) ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {contactsLoading ? 'Extracting...' : 'Extract Emails'}
          </button>
        </div>

        {/* HTML Email Results */}
        {htmlResult && (
          <div style={{ border: '1px solid #28a745', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#28a745', margin: 0 }}>HTML Email Results</h2>
            </div>
            
            <div style={{ backgroundColor: '#e9ecef', padding: '15px', borderRadius: '4px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Status:</strong> {htmlResult.success ? '✅ Success' : '❌ Failed'}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Message:</strong> {htmlResult.message}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Total Contacts:</strong> {htmlResult.totalContacts}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Successful Sends:</strong> {htmlResult.successCount}
              </div>
              {htmlResult.failedCount > 0 && (
                <div style={{ marginBottom: '10px', color: '#dc3545' }}>
                  <strong>Failed Sends:</strong> {htmlResult.failedCount}
                </div>
              )}
              {htmlResult.sampleHtml && (
                <div style={{ marginTop: '15px' }}>
                  <strong>Sample HTML Preview:</strong>
                  <pre style={{ 
                    backgroundColor: 'white', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    overflow: 'auto',
                    maxHeight: '200px',
                    border: '1px solid #ddd'
                  }}>
                    {htmlResult.sampleHtml}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PDF Conversion Results */}
        {convertedCode && (
          <div style={{ border: '1px solid #007bff', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#007bff', margin: 0 }}>Converted Code</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={copyToClipboard} 
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Copy to Clipboard
                </button>
                <button 
                  onClick={downloadCode} 
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Download {codeType === 'react' ? 'JSX' : 'HTML'}
                </button>
              </div>
            </div>
            
            <div style={{ backgroundColor: '#f1f3f4', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
              <pre style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>
                <code>{convertedCode}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Email Extraction Results */}
        {extractedEmails.length > 0 && (
          <div style={{ border: '1px solid #ffc107', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#856404', margin: 0 }}>Extracted Emails ({extractedEmails.length})</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={copyEmailsToClipboard} 
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Copy Emails
                </button>
                <button 
                  onClick={downloadEmails} 
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Download Emails
                </button>
              </div>
            </div>
            
            <div style={{ backgroundColor: '#f1f3f4', padding: '15px', borderRadius: '4px', overflow: 'auto', maxHeight: '300px' }}>
              <pre style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>
                <code>{extractedEmails.join('\n')}</code>
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;