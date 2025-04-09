const express = require('express');
const axios = require('axios');
const router = express.Router();

const Order = require('../models/Order');
const OrderLine = require('../models/OrderLine');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const { authenticate } = require('../middleware/auth');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3000/products';

// Checkout: Convert cart into an order
router.post('/checkout', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethod, deliveryAddress, phoneNumber } = req.body;

    if (!paymentMethod || !deliveryAddress || !phoneNumber) {
      return res.status(400).json({
        error: 'Payment method, delivery address, and phone number are required.'
      });
    }

    // Find the user's cart to transfer the cart into order
    const cart = await Cart.findOne({ createdBy: userId });
    if (!cart) {
      return res.status(400).json({ error: 'No active cart found for this user.' });
    }

    const cartItems = await CartItem.find({ cartId: cart._id });
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty. Cannot proceed with checkout.' });
    }

    // Create a new order
    const order = new Order({
      userId,
      paymentMethod,
      deliveryAddress,
      phoneNumber,
      paymentStatus: 'Pending',
      deliveryStatus: 'Pending',
      orderPlacedTime: new Date(),
      deliveryTime: new Date(new Date().setDate(new Date().getDate() + 7))
    });
    await order.save();

    const orderLines = [];
    const errors = [];

    for (const item of cartItems) {
      try {
        const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${item.productId}`);
        const product = productResponse.data;

        if (product.stock < item.quantity) {
          errors.push(`Not enough stock for product ${item.productId}.`);
          continue;
        }

        const orderLine = new OrderLine({
          orderId: order._id,
          productId: item.productId,
          price: item.price,
          quantity: item.quantity
        });
        await orderLine.save();
        orderLines.push(orderLine);

        // Decrement product stock
        await axios.post(
          `${PRODUCT_SERVICE_URL}/api/products/decrement`,
          {
            productId: item.productId,
            quantity: item.quantity
          },
          {
            headers: {
              'Authorization': req.headers.authorization,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        console.error(`Error processing product ${item.productId}:`, error.response?.data || error.message);
        errors.push(`Error processing product ${item.productId}.`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors });
    }

    // Clear the cart items
    await CartItem.deleteMany({ cartId: cart._id });

    res.status(201).json({
      message: 'Order created successfully.',
      order,
      orderLines
    });
  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).json({ error: err.message });
  }
});

//get all orders for the user
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ orderPlacedTime: -1 });

    const summaries = await Promise.all(orders.map(async (order) => {
      const orderLines = await OrderLine.find({ orderId: order._id });

      const totalItems = orderLines.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = orderLines.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        id: order._id,
        orderPlacedTime: order.orderPlacedTime,
        deliveryTime: order.deliveryTime,
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.deliveryStatus,
        totalItems,
        totalAmount,
      };
    }));

    res.json(summaries);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// view specific order
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this order.' });
    }

    const orderLines = await OrderLine.find({ orderId: order._id });

    const totalAmount = orderLines.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      order,
      items: orderLines,
      totalAmount,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
