require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to User Service DB'))
  .catch(err => console.error('DB connection error:', err));

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/', authRoutes);

app.listen(port, () => {
  console.log(`User Service running on port ${port}`);
});