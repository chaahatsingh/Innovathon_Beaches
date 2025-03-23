import React, { useState } from 'react';
import { Paper, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const InvoiceChecker = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Sample data for charts
  const fraudDistributionData = {
    labels: ['Not Fraud', 'Fraud'],
    datasets: [{
      data: [75, 25],
      backgroundColor: [
        'rgba(45, 212, 191, 0.8)',
        'rgba(248, 113, 113, 0.8)',
      ],
      borderWidth: 0,
      borderRadius: 2,
    }]
  };

  const monthlyTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Genuine Invoices',
        data: [65, 72, 68, 75, 70, 73],
        backgroundColor: 'rgba(45, 212, 191, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Fraudulent Invoices',
        data: [15, 18, 12, 20, 15, 17],
        backgroundColor: 'rgba(248, 113, 113, 0.8)',
        borderRadius: 4,
      }
    ]
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a PDF file');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const corsProxy = 'https://thingproxy.freeboard.io/fetch/';
      const targetUrl = 'https://fraud-receipt-detector.onrender.com/upload';
      
      const response = await axios.post(corsProxy + targetUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });

      setResult(response.data);

      // Store invoice check data for admin dashboard
      const invoiceData = {
        fileName: file.name,
        fraudulent: response.data.output === 'Fraud',
        output: response.data.output,
        details: response.data.details || 'No details provided',
        timestamp: new Date().toISOString(),
        userId: JSON.parse(localStorage.getItem('currentUser'))?.id
      };
      
      const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      existingInvoices.push(invoiceData);
      localStorage.setItem('invoices', JSON.stringify(existingInvoices));
    } catch (err) {
      setError(err.response?.data?.message || 'Error checking invoice');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="invoice-checker">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <h3>Total Invoices Checked</h3>
            <div className="icon document">📄</div>
          </div>
          <div className="metric-value">1,234</div>
          <div className="metric-trend positive">
            <span>↑</span> +45 This month
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Fraud Detection Rate</h3>
            <div className="icon chart">📊</div>
          </div>
          <div className="metric-value">92%</div>
          <div className="metric-trend positive">
            <span>↑</span> +3% From last month
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Fraudulent Invoices</h3>
            <div className="icon warning">⚠️</div>
          </div>
          <div className="metric-value">187</div>
          <div className="metric-trend negative">
            <span>↑</span> +12 This week
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Average Processing Time</h3>
            <div className="icon time">⚡</div>
          </div>
          <div className="metric-value">2.3s</div>
          <div className="metric-trend positive">
            <span>↓</span> -0.5s Improvement
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="transaction-form-section">
          <Paper elevation={3} className="form-card">
            <Typography variant="h5" component="h2" gutterBottom sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '2rem'
            }}>
              Invoice Analysis
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <div className="file-upload-container">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  id="invoice-file"
                  style={{ display: 'none' }}
                />
                <label htmlFor="invoice-file">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    size="large"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      mb: 3,
                      height: '120px',
                      border: '2px dashed rgba(255, 255, 255, 0.2)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '2px dashed rgba(255, 255, 255, 0.3)',
                      }
                    }}
                  >
                    {file ? file.name : 'Drop PDF invoice here or click to upload'}
                  </Button>
                </label>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isLoading || !file}
                >
                  {isLoading ? (
                    <CircularProgress 
                      size={24} 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))'
                      }} 
                    />
                  ) : (
                    'Analyze Invoice'
                  )}
                </Button>
              </div>
            </form>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 2,
                  backgroundColor: 'rgba(248, 113, 113, 0.1)',
                  color: '#F87171',
                  border: '1px solid rgba(248, 113, 113, 0.2)'
                }}
              >
                {error}
              </Alert>
            )}

            {result && (
              <Alert 
                severity={result === 'Fraud' ? 'error' : 'success'}
                sx={{ 
                  mt: 2,
                  backgroundColor: result === 'Fraud'
                    ? 'rgba(248, 113, 113, 0.1)'
                    : 'rgba(45, 212, 191, 0.1)',
                  color: result === 'Fraud'
                    ? '#F87171'
                    : '#2DD4BF',
                  border: `1px solid ${
                    result === 'Fraud'
                      ? 'rgba(248, 113, 113, 0.2)'
                      : 'rgba(45, 212, 191, 0.2)'
                  }`
                }}
              >
                This invoice appears to be: <strong>{result}</strong>
              </Alert>
            )}
          </Paper>
        </div>

        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3>Monthly Invoice Trends</h3>
                <p>Distribution of genuine vs fraudulent invoices</p>
              </div>
            </div>
            <Bar 
              data={monthlyTrendsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { 
                    grid: {
                      color: 'rgba(255, 255, 255, 0.05)'
                    }
                  },
                  y: { 
                    grid: {
                      color: 'rgba(255, 255, 255, 0.05)'
                    }
                  }
                },
                plugins: {
                  legend: {
                    labels: {
                      color: '#94A3B8',
                      font: {
                        family: 'Inter, system-ui, sans-serif',
                        weight: 500
                      }
                    }
                  }
                }
              }}
            />
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3>Fraud Distribution</h3>
                <p>Overall ratio of genuine to fraudulent invoices</p>
              </div>
            </div>
            <Doughnut 
              data={fraudDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#94A3B8',
                      font: {
                        family: 'Inter, system-ui, sans-serif',
                        weight: 500
                      },
                      padding: 20
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceChecker;
