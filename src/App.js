import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // ===== UPDATE THIS WHEN ALINA GIVES YOU THE ENDPOINT =====
  const API_ENDPOINT = 'https://YOUR-API-ENDPOINT-HERE.execute-api.us-east-1.amazonaws.com/prod/predict';

  // Handle file selection
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

  // Handle upload and prediction
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

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      setResults({
        prediction: data.prediction,
        confidence: data.confidence,
        message: data.message
      });

    } catch (err) {
      setError(`Upload failed: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
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
        <h1>Bone Fracture Detector</h1>
        <p>AI-powered X-ray analysis tool</p>
      </header>

      <main className="app-main">
        {/* Upload Section */}
        {!results ? (
          <div className="upload-section">
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
                <span className="upload-icon">📁</span>
                <span className="upload-text">
                  {selectedFile ? 'Image selected ✓' : 'Click to select JPG or PNG'}
                </span>
              </label>

              {/* Image Preview */}
              {preview && (
                <div className="preview-container">
                  <img src={preview} alt="Preview" className="preview-image" />
                  <p className="preview-text">{selectedFile.name}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className={`upload-button ${loading ? 'loading' : ''}`}
              >
                {loading ? 'Analyzing...' : 'Analyze X-ray'}
              </button>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="results-section">
            <div className={`results-box ${results.prediction === 'fracture' ? 'fracture-detected' : 'no-fracture'}`}>
              <h2>Analysis Results</h2>

              {/* Prediction */}
              <div className="result-item">
                <p className="result-label">Classification:</p>
                <p className={`result-value ${results.prediction === 'fracture' ? 'fracture-text' : 'safe-text'}`}>
                  {results.prediction === 'fracture' ? '🔴 Fracture Detected' : '🟢 No Fracture Detected'}
                </p>
              </div>

              {/* Confidence Score */}
              <div className="result-item">
                <p className="result-label">Confidence:</p>
                <p className="result-value confidence-score">
                  {(results.confidence * 100).toFixed(1)}%
                </p>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ width: `${results.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Clinical Message */}
              <div className="result-item message-box">
                <p className="result-label">Recommendation:</p>
                <p className="result-message">💡 {results.message}</p>
              </div>

              {/* Analysis Image */}
              {preview && (
                <div className="analyzed-image">
                  <p className="result-label">Analyzed Image:</p>
                  <img src={preview} alt="Analyzed" className="results-image" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="action-buttons">
                <button onClick={handleReset} className="reset-button">
                  Analyze Another
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>⚠️ This tool is a screening aid only, not a diagnostic tool. Always consult with a healthcare professional.</p>
      </footer>
    </div>
  );
}

export default App;