import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [value, setValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [spamEmails, setSpamEmails] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadData = () => {
    try {
      const transactionsData = JSON.parse(localStorage.getItem('transactions') || '[]');
      const spamEmailsData = JSON.parse(localStorage.getItem('spamEmails') || '[]');
      const invoicesData = JSON.parse(localStorage.getItem('invoices') || '[]');
      
      console.log('Loaded invoices:', invoicesData);
      
      setTransactions(transactionsData);
      setSpamEmails(spamEmailsData);
      setInvoices(invoicesData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleRefresh = () => {
    setLoading(true);
    loadData();
  };

  // Debug function to check invoice structure
  const debugInvoice = (invoice) => {
    console.log('Invoice structure:', {
      fraudulent: invoice.fraudulent,
      output: invoice.output,
      type: typeof invoice.fraudulent
    });
    return invoice.fraudulent === true || invoice.output === 'Fraud';
  };

  const getStats = () => ({
    totalTransactions: transactions.length,
    fraudulentTransactions: transactions.filter(t => 
      t.prediction === 'Fraudulent' || t.prediction === 'Suspicious'
    ).length,
    totalEmails: spamEmails.length,
    spamEmails: spamEmails.filter(e => e.classification === 'spam').length,
    totalInvoices: invoices.length,
    fraudulentInvoices: invoices.filter(invoice => debugInvoice(invoice)).length
  });

  const formatTransactionDetails = (transaction) => {
    const details = [
      ['Amount', transaction.Amount || 'N/A'],
      ['Currency', transaction.Payment_currency || 'N/A'],
      ['Payment Type', transaction.Payment_type || 'N/A'],
      ['Received Currency', transaction.Received_currency || 'N/A'],
      ['Transaction Code', transaction.Transaction_code || 'N/A']
    ];

    return (
      <Table size="small">
        <TableBody>
          {details.map(([key, value]) => (
            <TableRow key={key}>
              <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                {key}
              </TableCell>
              <TableCell>{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const getStatusColor = (status) => {
    if (status === 'Fraud Check Result: Fraud') 
      return 'fraudulent';
    else 
    return 'legitimate';
  };

  const handleNewInvoice = (invoice) => {
    const isFraud = invoice.output === 'Fraud';
    const newInvoice = {
      ...invoice,
      fraudulent: isFraud
    };

    // Save the new invoice to local storage
    const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    existingInvoices.push(newInvoice);
    localStorage.setItem('invoices', JSON.stringify(existingInvoices));

    // Update state
    setInvoices(existingInvoices);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress size={60} />
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <DashboardIcon /> Admin Panel
        </div>
        <Tabs
          orientation="vertical"
          value={value}
          onChange={handleTabChange}
          sx={{ borderRight: 1, borderColor: 'divider' }}
        >
          <Tab icon={<AssessmentIcon />} label="Transactions" />
          <Tab icon={<EmailIcon />} label="Spam Emails" />
          <Tab icon={<DescriptionIcon />} label="Invoices" />
        </Tabs>
      </div>

      <div className="admin-content">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            {value === 0 ? 'Transaction Analysis' : value === 1 ? 'Email Analysis' : 'Invoice Analysis'}
          </Typography>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} sx={{ color: 'white' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <div className="stats-grid">
          {value === 0 && (
            <>
              <div className="stat-card">
                <div className="stat-label">Total Transactions</div>
                <div className="stat-value">{stats.totalTransactions}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Fraudulent Transactions</div>
                <div className="stat-value">{stats.fraudulentTransactions}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Success Rate</div>
                <div className="stat-value">
                  {stats.totalTransactions ? 
                    ((1 - stats.fraudulentTransactions / stats.totalTransactions) * 100).toFixed(1) + '%'
                    : '0%'}
                </div>
              </div>
            </>
          )}

          {value === 1 && (
            <>
              <div className="stat-card">
                <div className="stat-label">Total Emails</div>
                <div className="stat-value">{stats.totalEmails}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Spam Emails</div>
                <div className="stat-value">{stats.spamEmails}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Legitimate Rate</div>
                <div className="stat-value">
                  {stats.totalEmails ? 
                    ((1 - stats.spamEmails / stats.totalEmails) * 100).toFixed(1) + '%'
                    : '0%'}
                </div>
              </div>
            </>
          )}

          {value === 2 && (
            <>
              <div className="stat-card">
                <div className="stat-label">Total Invoices</div>
                <div className="stat-value">{stats.totalInvoices}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Fraudulent Invoices</div>
                <div className="stat-value">{stats.fraudulentInvoices}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Success Rate</div>
                <div className="stat-value">
                  {stats.totalInvoices ? 
                    ((1 - stats.fraudulentInvoices / stats.totalInvoices) * 100).toFixed(1) + '%'
                    : '0%'}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="data-table">
          {value === 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Transaction Details</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(transaction.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{transaction.userId}</TableCell>
                      <TableCell>
                        {formatTransactionDetails(transaction)}
                      </TableCell>
                      <TableCell className={getStatusColor(transaction.prediction)}>
                        {transaction.prediction}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {value === 1 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Email Content</TableCell>
                    <TableCell>Classification</TableCell>
                    <TableCell>Similarity Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {spamEmails.map((email, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(email.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{email.userId}</TableCell>
                      <TableCell>{email.content}</TableCell>
                      <TableCell className={email.classification === 'Fraud' ? 'fraudulent' : 'legitimate'}>
                        {email.classification}
                      </TableCell>
                      <TableCell>{email.similarity_score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {value === 2 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>File Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(invoice.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{invoice.userId}</TableCell>
                      <TableCell>{invoice.fileName}</TableCell>
                      <TableCell className={debugInvoice(invoice) ? 'fraudulent' : 'legitimate'}>
                        {debugInvoice(invoice) ? 'Fraud' : 'Not Fraud'}
                      </TableCell>
                      <TableCell>{invoice.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>

        <div className="refresh-time">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
