const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const { category, brand, sortBy } = req.query;
    
    const filter = {};
    if (category) filter.category = { $in: category.split(',') };
    if (brand) filter.brand = { $in: brand.split(',') };

    const sort = {};
    switch(sortBy) {
      case 'price-hightolow': sort.price = -1; break;
      case 'title-atoz': sort.title = 1; break;
      case 'title-ztoa': sort.title = -1; break;
      default: sort.price = 1;
    }

    const products = await Product.find(filter).sort(sort);
    res.json({ 
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
    res.json({ 
      success: true, 
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

module.exports = { getProducts, getProductById };