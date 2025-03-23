import React, { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import {
  TextField,
  MenuItem,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Tabs,
  Tab
} from '@mui/material';
import axios from 'axios';
import InvoiceChecker from './InvoiceChecker';
import SpamDetector from './SpamDetector';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    Received_currency: 'US dollar',
    Payment_type: 'Credit Card',
    Payment_currency: 'US dollar',
    Receiver_bank_location: 'USA',
    Amount: ''
  });
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const currencies = [
    'Albanian lek', 'Dirham', 'Euro', 'Indian Rupee', 'Mexican Peso',
    'Moroccan Dirham', 'Naira', 'Pakistani rupee', 'Swiss franc',
    'Turkish lira', 'UK pounds', 'US dollar', 'Yen'
  ];

  const paymentTypes = [
    'ACH', 'Cash Deposit', 'Cash Withdrawl', 'Cheque',
    'Credit Card', 'Cross-border', 'Debit Card'
  ];

  const locations = [
    'Albania', 'Austria', 'France', 'Germany', 'India', 'Italy',
    'Japan', 'Mexico', 'Morocco', 'Netherlands', 'Nigeria',
    'Pakistan', 'Spain', 'Switzerland', 'Turkey', 'UAE', 'UK', 'USA'
  ];

  const transactionAnomaliesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Normal',
        data: [90, 95, 85, 95, 85, 90],
        backgroundColor: 'rgba(45, 212, 191, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Suspicious',
        labelColor: 'white',
        data: [10, 15, 8, 12, 10, 8],
        backgroundColor: 'rgba(248, 113, 113, 0.8)',
        borderRadius: 4,
      }
    ]
  };

  const transactionsByCountryData = {
    labels: ['USA', 'UK', 'EU', 'Asia', 'Others'],
    datasets: [{
      data: [35, 25, 20, 15, 5],
      backgroundColor: [
        'rgba(45, 212, 191, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(148, 163, 184, 0.8)'
      ],
      borderWidth: 0,
      borderRadius: 2,
    }]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Using thingproxy as CORS proxy
      const corsProxy = 'https://thingproxy.freeboard.io/fetch/';
      const targetUrl = 'https://money-laundering.onrender.com/predict';
      
      const response = await axios.post(corsProxy + targetUrl, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.prediction) {
        setPredictionResult(response.data.prediction);
        
        // Store transaction data for admin dashboard
        const transactionData = {
          ...formData,
          prediction: response.data.prediction,
          timestamp: new Date().toISOString(),
          userId: JSON.parse(localStorage.getItem('currentUser'))?.id
        };
        
        const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        existingTransactions.push(transactionData);
        localStorage.setItem('transactions', JSON.stringify(existingTransactions));
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Error analyzing transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="dashboard">
      <Paper elevation={3} className="dashboard-header">
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#3B82F6',
              height: 3,
            },
            '& .MuiTab-root': {
              color: '#94A3B8',
              fontSize: '1rem',
              fontWeight: 500,
              textTransform: 'none',
              '&.Mui-selected': {
                color: '#3B82F6',
              },
            },
            mb: 3,
          }}
        >
          <Tab label="Transaction Analysis" />
          <Tab label="Invoice Checker" />
          <Tab label="Spam Mail Detector" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <h3>Risk Score</h3>
                <div className="icon warning">⚠️</div>
              </div>
              <div className="metric-value">69/100</div>
              <div className="metric-trend negative">
                <span>↑</span> +12 Higher than last month
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <h3>Suspicious Transactions</h3>
                <div className="icon money">🚫</div>
              </div>
              <div className="metric-value">23</div>
              <div className="metric-trend negative">
                <span>↑</span> +7 From previous period
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <h3>Detection Rate</h3>
                <div className="icon chart">📊</div>
              </div>
              <div className="metric-value">89%</div>
              <div className="metric-trend positive">
                <span>↑</span> +2% Improved accuracy
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <h3>Total Transactions</h3>
                <div className="icon users">💳</div>
              </div>
              <div className="metric-value">9000</div>
              <div className="metric-trend neutral">
                <span>↑</span> +156 This month
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
                  Transaction Analysis
                </Typography>
                
                <form onSubmit={handleSubmit}>
                  <TextField
                    select
                    fullWidth
                    label="Payment Currency"
                    name="Payment_currency"
                    value={formData.Payment_currency}
                    onChange={handleChange}
                    margin="normal"
                    required
                    variant="outlined"
                    sx={{ mb: 2 }}
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="Received Currency"
                    name="Received_currency"
                    value={formData.Received_currency}
                    onChange={handleChange}
                    margin="normal"
                    required
                    variant="outlined"
                    sx={{ mb: 2 }}
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="Payment Type"
                    name="Payment_type"
                    value={formData.Payment_type}
                    onChange={handleChange}
                    margin="normal"
                    required
                    variant="outlined"
                    sx={{ mb: 2 }}
                  >
                    {paymentTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="Receiver Bank Location"
                    name="Receiver_bank_location"
                    value={formData.Receiver_bank_location}
                    onChange={handleChange}
                    margin="normal"
                    required
                    variant="outlined"
                    sx={{ mb: 2 }}
                  >
                    {locations.map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="Amount"
                    name="Amount"
                    type="number"
                    value={formData.Amount}
                    onChange={handleChange}
                    margin="normal"
                    required
                    variant="outlined"
                    sx={{ mb: 3 }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isLoading}
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
                      'Analyze Transaction'
                    )}
                  </Button>
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

                {predictionResult && (
                  <Alert 
                    severity={predictionResult === 'Suspicious' ? 'warning' : 'success'}
                    sx={{ 
                      mt: 2,
                      backgroundColor: predictionResult === 'Suspicious' 
                        ? 'rgba(251, 146, 60, 0.1)'
                        : 'rgba(45, 212, 191, 0.1)',
                      color: predictionResult === 'Suspicious' 
                        ? '#FB923C'
                        : '#2DD4BF',
                      border: `1px solid ${
                        predictionResult === 'Suspicious' 
                          ? 'rgba(251, 146, 60, 0.2)'
                          : 'rgba(45, 212, 191, 0.2)'
                      }`
                    }}
                  >
                    Transaction is: <strong>{predictionResult}</strong>
                  </Alert>
                )}
              </Paper>
            </div>

            <div className="charts-section">
              <div className="chart-card">
                <div className="chart-header">
                  <div>
                    <h3>Transaction Patterns</h3>
                    <p>Monthly distribution of transactions</p>
                  </div>
                </div>
                <Bar 
                  data={transactionAnomaliesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { 
                        stacked: true,
                        grid: {
                          color: 'rgba(255, 255, 255, 0.05)'
                        }
                      },
                      y: { 
                        stacked: true,
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
                    <h3>Transactions by Region</h3>
                    <p>Geographic distribution</p>
                  </div>
                </div>
                <Doughnut 
                  data={transactionsByCountryData}
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
        </>
      )}
      
      {activeTab === 1 && (
        <InvoiceChecker />
      )}
      
      {activeTab === 2 && (
        <SpamDetector />
      )}
    </div>
  );
};

export default Dashboard;
