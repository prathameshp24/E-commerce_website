const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // Create user with plain password (model will auto-hash)
    const user = await User.create({
      userName,
      email,
      password, // Directly use the plain password
      role: 'user'
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed"
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};

// Logout User
const logoutUser = (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully"
  });
};

module.exports = { registerUser, loginUser, logoutUser };