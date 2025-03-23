import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';

const SpamDetector = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const corsProxy = 'https://thingproxy.freeboard.io/fetch/';
      const targetUrl = 'https://spam-mail-detector-swr3.onrender.com/predict';
      
      const response = await fetch(corsProxy + targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: email })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data) {
        setResult({
          classification: data.classification,
          similarity_score: data.similarity_score
        });

        // Store spam detection data for admin dashboard
        const spamData = {
          content: email,
          classification: data.classification,
          similarity_score: data.similarity_score,
          timestamp: new Date().toISOString(),
          userId: JSON.parse(localStorage.getItem('currentUser'))?.id
        };
        
        const existingSpamEmails = JSON.parse(localStorage.getItem('spamEmails') || '[]');
        existingSpamEmails.push(spamData);
        localStorage.setItem('spamEmails', JSON.stringify(existingSpamEmails));
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(
        'We are experiencing some technical difficulties. Please try again in a few moments.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="spam-detector">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <h3>Total Emails Analyzed</h3>
            <div className="icon email">📧</div>
          </div>
          <div className="metric-value">15,234</div>
          <div className="metric-trend positive">
            <span>↑</span> +234 This week
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Detection Accuracy</h3>
            <div className="icon chart">📊</div>
          </div>
          <div className="metric-value">96%</div>
          <div className="metric-trend positive">
            <span>↑</span> +2.5% This month
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Spam Detected</h3>
            <div className="icon warning">⚠️</div>
          </div>
          <div className="metric-value">4,569</div>
          <div className="metric-trend negative">
            <span>↑</span> +89 This week
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Average Response Time</h3>
            <div className="icon time">⚡</div>
          </div>
          <div className="metric-value">1.2s</div>
          <div className="metric-trend positive">
            <span>↓</span> -0.3s Improvement
          </div>
        </div>
      </div>

      <Paper
        component={motion.div}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        elevation={24}
        sx={{
          p: 4,
          width: '100%',
          background: 'rgba(30, 41, 59, 0.5)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <SecurityIcon sx={{ fontSize: 28, color: '#3B82F6' }} />
          <Typography variant="h5" component="h2" sx={{ 
            fontWeight: 600,
            background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Spam Shield
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            label="Enter email content"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                  borderRadius: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#00bcd4',
                },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !email.trim()}
            sx={{
              background: 'linear-gradient(45deg, #00bcd4 30%, #2196f3 90%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #00acc1 30%, #1e88e5 90%)',
              },
            }}
            startIcon={<EmailIcon />}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze Email'}
          </Button>
        </form>

        {error && (
          <Alert
            severity="error"
            sx={{
              mt: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              '& .MuiAlert-message': {
                whiteSpace: 'pre-line'
              }
            }}
          >
            {error}
          </Alert>
        )}

        {result && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ mt: 3 }}
          >
            <Alert
              severity={result.classification === "Spam" ? "warning" : "success"}
              sx={{
                mb: 2,
                borderRadius: 2,
                backgroundColor: result.classification === "Spam"
                  ? 'rgba(237, 108, 2, 0.1)'
                  : 'rgba(46, 125, 50, 0.1)',
              }}
              icon={<SecurityIcon />}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {result.classification}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Similarity Score: {result.similarity_score}
              </Typography>
            </Alert>
          </Box>
        )}
      </Paper>
    </div>
  );
};

export default SpamDetector;