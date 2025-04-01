// api-gateway/src/index.js
require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// User Service Proxy
app.use('/api/auth', createProxyMiddleware({
    target: 'http://localhost:5001/api/auth', // Add full path
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' }, // Remove prefix completely
    onProxyReq: (proxyReq) => {
      console.log('Proxying to:', proxyReq.path); // Should show /register
    }
  }));

// Legacy Backend Proxy
app.use('/api', createProxyMiddleware({
  target: process.env.LEGACY_BACKEND_URL,
  changeOrigin: true,
  pathRewrite: { '^/api': '' }, // Remove prefix
  onProxyReq: (proxyReq, req) => {
    if (req.headers.authorization) {
      proxyReq.setHeader('authorization', req.headers.authorization);
    }
  }
}));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});