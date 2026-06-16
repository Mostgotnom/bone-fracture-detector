import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Alina's API Endpoint
  const API_ENDPOINT = 'https://icaa8eqoge.execute-api.us-east-2.amazonaws.com/predict';

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setSelectedFile(file);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload a JPG or PNG image');
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      console.log('Sending request to:', API_ENDPOINT);
      console.log('File name:', selectedFile.name);
      console.log('File type:', selectedFile.type);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${JSON.stringify(responseData)}`);
      }

      // Alina's Lambda wraps the data in a "body" field, so parse it
      let data;
      if (responseData.body) {
        data = typeof responseData.body === 'string' 
          ? JSON.parse(responseData.body) 
          : responseData.body;
      } else {
        data = responseData;
      }

      setResults({
        possible_concern: data.possible_concern,
        finding_type: data.finding_type,
        confidence: data.confidence,
        message: data.message
      });

    } catch (err) {
      setError(`Upload failed: ${err.message}`);
      console.error('Full error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResults(null);
    setError(null);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-content">
          <h1>Bone Fracture Detector</h1>
          <p>AI-powered X-ray analysis</p>
        </div>
      </header>

      <main className="app-main">
        {!results ? (
          // Upload Section
          <div className="space-y-6">
            {/* Upload Box */}
            <div className="upload-box">
              <h2>Upload X-ray Image</h2>
              
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                id="file-input"
                className="file-input"
              />
              
              <label htmlFor="file-input" className="file-label">
                {preview ? (
                  <div className="preview-container">
                    <img src={preview} alt="Preview" className="preview-image" />
                    <p className="preview-text">{selectedFile?.name}</p>
                  </div>
                ) : (
                  <div className="upload-area">
                    <span className="upload-icon">📁</span>
                    <p className="upload-text">Click to upload X-ray</p>
                    <p className="upload-hint">JPG or PNG format</p>
                  </div>
                )}
              </label>

              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className="analyze-button"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Analyzing...
                  </>
                ) : (
                  <>🔍 Analyze X-ray</>
                )}
              </button>
            </div>

            <div className="info-box">
              ℹ️ This tool is a screening aid only. Always consult a healthcare professional for diagnosis.
            </div>
          </div>
        ) : (
          // Results Section
          <div className="space-y-6">
            <div className={`results-box ${results.possible_concern ? 'fracture-detected' : 'no-fracture'}`}>
              <h2>Analysis Results</h2>

              <div className="result-item">
                <p className="result-label">Classification</p>
                <p className={`result-value ${results.possible_concern ? 'fracture-text' : 'safe-text'}`}>
                  {results.possible_concern ? '🔴 Possible Concern Detected' : '🟢 No Concern Detected'}
                </p>
              </div>

              <div className="result-item">
                <p className="result-label">Finding Type</p>
                <p className="result-value" style={{ color: '#cbd5e1' }}>
                  {results.finding_type}
                </p>
              </div>

              <div className="result-item">
                <p className="result-label">Confidence Score</p>
                <div className="confidence-bar-container">
                  <div style={{ flex: 1 }}>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill"
                        style={{ width: `${results.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="confidence-value">
                    {(results.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.75rem', lineHeight: '1.5' }}>
                  This score indicates how confident the AI model is in its prediction. A higher percentage means the model is more certain about the result.
                  <br/><br/>
                  <strong>Score Interpretation:</strong>
                  <br/>• 90-100%: Very confident in the prediction
                  <br/>• 75-89%: Moderately confident
                  <br/>• 50-74%: Less certain (borderline case)
                  <br/><br/>
                  <strong>Important:</strong> Even with high confidence, this is a screening tool only. Always consult a licensed medical professional for diagnosis.
                </p>
              </div>

              <div className="result-item message-box">
                <p className="result-label">Message</p>
                <p className="result-message">💡 {results.message}</p>
              </div>

              {preview && (
                <div className="analyzed-image-container">
                  <p className="result-label">Analyzed Image</p>
                  <img src={preview} alt="Analyzed" className="analyzed-image" />
                </div>
              )}

              <button onClick={handleReset} className="reset-button">
                ↻ Analyze Another
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Bone Fracture Detector • Powered by AI</p>
      </footer>
    </div>
  );
}

export default App;