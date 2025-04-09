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
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ----- Proxy Middlewares (ORDER MATTERS!) ----- //

// 1. Auth Service (Highest Priority)
app.use('/api/auth', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' },
  onProxyReq: (proxyReq) => {
    console.log('Proxying to Auth Service:', proxyReq.path);
  }
}));

// 2. Product Service (Specific Paths)
app.use('/api/shop/products', createProxyMiddleware({
  target: 'http://localhost:5003',  // Target base URL without path
  changeOrigin: true,
  pathRewrite: { 
    '^/api/shop/products': '/api/products' // Correct path rewrite
  },
  onProxyReq: (proxyReq) => {
    console.log('Proxying to Product Service:', proxyReq.path);
  }
}));

// 3. Legacy Backend (Lowest Priority - Catch All)
app.use('/api', createProxyMiddleware({
  target: process.env.LEGACY_BACKEND_URL,
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
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