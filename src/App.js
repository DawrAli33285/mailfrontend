import React, { useState,useEffect } from 'react';
import axios from 'axios'

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [convertedCode, setConvertedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [templateOption, setTemplateOption] = useState('new');
const [selectedTemplate, setSelectedTemplate] = useState('');
  const [codeType, setCodeType] = useState('html');
  const [htmlTemplates,setHtmlTemplates]=useState([])
  const [fileInfo, setFileInfo] = useState(null);
  const [contacts,setContacts]=useState([])
  
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

  // New state for enhanced email features
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedCsvFile, setSelectedCsvFile] = useState('');
  const [recordCount, setRecordCount] = useState(1);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [htmlContent, setHtmlContent] = useState([]);
  const [sendImmediate, setSendImmediate] = useState(true);

  // Industry options
  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Real Estate',
    'Marketing & Advertising',
    'Consulting',
    'Legal Services',
    'Hospitality',
    'Transportation',
    'Energy',
    'Non-profit',
    'Government',
    'Other'
  ];

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
        
        // Read the file content and set it to htmlContent
        const reader = new FileReader();
        reader.onload = (e) => {
          setHtmlContent(e.target.result);
        };
        reader.readAsText(file);
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
alert("Email extracted sucessfully")
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
    setHtmlLoading(true);
    setHtmlError('');
    setHtmlResult(null);
  
    if (!selectedHtmlFile && templateOption=="new") {
      setHtmlError('No file selected');
      setHtmlLoading(false);
      return;
    }
  
    const formData = new FormData();
    
    // Create new File object preserving all original metadata
    const htmlFile = new File([htmlContent], selectedHtmlFile.name, {
      type: selectedHtmlFile.type,
      lastModified: selectedHtmlFile.lastModified
    });
    
    formData.append('htmlTemplate', htmlFile);
    formData.append('subject', emailSubject || 'Your Document');
    formData.append('industry', selectedIndustry);
    formData.append('sendImmediate', sendImmediate.toString());
    formData.append('templateOption', templateOption);
    
    if (!sendImmediate) {
      formData.append('scheduledDate', scheduledDate);
      formData.append('scheduledTime', scheduledTime);
    }
    
    formData.append('selectedTemplate', selectedTemplate);
  
    try {
      const endpoint = sendImmediate 
        ? 'https://newbackend-sage.vercel.app/api/send-html-template'
        : 'https://newbackend-sage.vercel.app/api/send-html-schedular-template';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
  
      const result = await response.json();
      setHtmlResult(result);
      setEmailSubject("")
      setSelectedIndustry("")
      setTemplateOption("new")
      setSelectedTemplate("")
      setSendImmediate(true)
      setScheduledDate("")
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

  // Get current date and time for min values
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    return { date, time };
  };

  const { date: currentDate, time: currentTime } = getCurrentDateTime();

  useEffect(()=>{
getContacts();
getHtmlTemplates();
  },[])

  const getContacts=async()=>{
    try{
     
      let response = await axios.get('https://newbackend-sage.vercel.app/api/getIndustries');
      console.log(response.data)
      setContacts(response.data.contacts); 

    }catch(e){

    }
  }


  const getHtmlTemplates=async()=>{
    try{
let response=await axios.get("https://newbackend-sage.vercel.app/api/get-htmls")
console.log(response.data)
setHtmlContent(response.data.htmls)
    }catch(e){
      
    }
  }



  const getFileNames = () => {
    const fileNames = new Set();
    contacts.forEach(contact => {
      fileNames.add(contact._id);
    });
    return Array.from(fileNames);
  };

  // Get selected file data
  const getSelectedFileData = () => {
    return contacts.find(contact => contact._id === selectedCsvFile);
  };

  // Get max count for selected file
  const getMaxCount = () => {
    const fileData = getSelectedFileData();
    return fileData ? fileData.count : 0;
  };

  // Convert data to CSV format
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  // Download CSV file
  const downloadCSV = () => {
    if (!selectedCsvFile) {
      alert('Please select a file first');
      return;
    }

    const fileData = getSelectedFileData();
    if (!fileData) {
      alert('No data found for selected file');
      return;
    }

    // Get the specified number of records
    const recordsToDownload = fileData.documents.slice(0, recordCount);
    
    // Convert to CSV
    const csvContent = convertToCSV(recordsToDownload);
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedCsvFile.replace('.csv', '')}_${recordCount}_records.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>Enrichify Email System</h1>
        <p style={{ color: '#666' }}>Send targeted HTML email templates with scheduling</p>
        <div className="space-y-6">
        {/* File Selection */}
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
  <style>
    {`
      .form-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 8px;
      }
      .form-select {
        width: 100%;
        padding: 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .form-select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
      }
      .form-select:disabled {
        background-color: #f3f4f6;
        cursor: not-allowed;
      }
      .info-box {
        background-color: #eff6ff;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #bfdbfe;
        margin-top: 16px;
      }
      .info-title {
        font-weight: 600;
        color: #1e40af;
        margin-bottom: 8px;
      }
      .info-text {
        font-size: 14px;
        color: #1e3a8a;
        line-height: 1.5;
      }
      .download-button {
        width: 100%;
        background-color: #2563eb;
        color: white;
        font-weight: 500;
        padding: 12px 16px;
        border: none;
        border-radius: 8px;
        margin-top: 20px;
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .download-button:hover {
        background-color: #1d4ed8;
      }
      .download-button:disabled {
        background-color: #d1d5db;
        cursor: not-allowed;
      }
    `}
  </style>

  {/* File Selection */}
  <div>
    <label className="form-label">Select File</label>
    <select
      value={selectedCsvFile}
      onChange={(e) => {
        setSelectedCsvFile(e.target.value);
        setRecordCount(1);
      }}
      className="form-select"
    >
      <option value="">Choose a file...</option>
      {getFileNames().map(fileName => (
        <option key={fileName} value={fileName}>
          {fileName}
        </option>
      ))}
    </select>
  </div>

  {/* Record Count Selection */}
  <div style={{ marginTop: '20px' }}>
    <label className="form-label">Number of Records</label>
    <select
      value={recordCount}
      onChange={(e) => setRecordCount(parseInt(e.target.value))}
      disabled={!selectedCsvFile}
      className="form-select"
    >
      {selectedCsvFile &&
        Array.from({ length: getMaxCount() }, (_, i) => i + 1).map(num => (
          <option key={num} value={num}>
            {num} record{num > 1 ? 's' : ''}
          </option>
        ))}
    </select>
  </div>

  {/* File Info */}
  {selectedFile && (
    <div className="info-box">
      <div className="info-title">File Information</div>
      <p className="info-text">
        <strong>File:</strong> {selectedCsvFile} <br />
        <strong>Total Records:</strong> {getMaxCount()} <br />
        <strong>Selected Records:</strong> {recordCount}
      </p>
    </div>
  )}

  {/* Download Button */}
  <button
    onClick={downloadCSV}
    disabled={!selectedCsvFile}
    className="download-button"
  >
    Download CSV
  </button>
</div>
</div>
      </header>

      <main style={{ display: 'grid', gap: '30px' }}>
        {/* Enhanced HTML Template Section */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f0f8ff' }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>Send HTML Email Template</h2>
          
          {/* Email Subject */}
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

          {/* Industry Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Target Industry: <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Select an industry</option>
              {contacts?.map((industry) => (
                <option key={industry?._id} value={industry?.industry}>
                  {industry?._id}
                </option>
              ))}
            </select>
          </div>



          <div style={{ marginBottom: '20px' }}>
  <div style={{ marginBottom: '15px' }}>
    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
      Template Option:
    </label>
    <select
      value={templateOption}
      onChange={(e) => setTemplateOption(e.target.value)}
      style={{
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        boxSizing: 'border-box',
        marginBottom: '15px'
      }}
    >
      <option value="new">Create New Template</option>
      <option value="existing">Use Existing Template</option>
    </select>
  </div>

  {templateOption === 'existing' ? (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        Select Template:
      </label>
      <select
        value={selectedTemplate}
        onChange={(e) => {
          setSelectedTemplate(e.target.value);
          // Find and set the selected template's content
          const template = htmlTemplates.find(t => t.fileName === e.target.value);
          if (template) {
            setHtmlContent(template.htmlContent);
          }
        }}
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      >
        <option value="">Select a template</option>
        {htmlContent?.map((template) => (
          <option key={template?._id} value={template?.fileName}>
            {template?.fileName}
          </option>
        ))}
      </select>
    </div>
  ) : (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <label style={{ fontWeight: 'bold' }}>
          HTML Content: <span style={{ color: '#dc3545' }}>*</span>
        </label>
        <div>
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
              padding: '6px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Upload HTML File
          </label>
        </div>
      </div>
      
    
      
      {htmlFileInfo && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Loaded from: <strong>{htmlFileInfo.name}</strong> ({htmlFileInfo.size})
        </div>
      )}
    </>
  )}
</div>
          

          {/* Send Timing Options */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
              Send Timing:
            </label>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  checked={sendImmediate}
                  onChange={() => setSendImmediate(true)}
                />
                Send Immediately
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  checked={!sendImmediate}
                  onChange={() => setSendImmediate(false)}
                />
                Schedule for Later
              </label>
            </div>

            {/* Schedule DateTime */}
            {!sendImmediate && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', paddingLeft: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                    Date:
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={currentDate}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                    Time:
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

         
         
          {htmlError && <div style={{ color: '#dc3545', marginBottom: '20px', fontSize: '14px' }}>{htmlError}</div>}

          <button
  onClick={handleHtmlUpload}
  disabled={(!selectedTemplate && templateOption === 'existing') || !selectedIndustry || htmlLoading}
  style={{
    padding: '12px 24px',
    backgroundColor: ((!selectedTemplate && templateOption === 'existing') || !selectedIndustry || htmlLoading) ? '#ccc' : '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: ((!selectedTemplate && templateOption === 'existing') || !selectedIndustry || htmlLoading) ? 'not-allowed' : 'pointer',
    fontSize: '16px'
  }}
>
  {htmlLoading ? 'Processing...' : sendImmediate ? 'Send Email Template' : 'Schedule Email Template'}
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
              <h2 style={{ color: '#28a745', margin: 0 }}>Email Campaign Results</h2>
            </div>
            
            <div style={{ backgroundColor: '#e9ecef', padding: '15px', borderRadius: '4px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Status:</strong> {htmlResult.success ? '✅ Success' : '❌ Failed'}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Message:</strong> {htmlResult.message}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Industry:</strong> {selectedIndustry}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Send Mode:</strong> {sendImmediate ? 'Immediate' : `Scheduled for ${scheduledDate} at ${scheduledTime}`}
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