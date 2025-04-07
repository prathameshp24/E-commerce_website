import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  error: null,
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async ({ filterParams, sortParams }) => {
    try {
      const queryParams = new URLSearchParams({
        ...filterParams,
        sortBy: sortParams,
      }).toString();

      const response = await axios.get(
        `http://localhost:5000/api/shop/products?${queryParams}`
      );

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch products";
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  "products/fetchProductDetails",
  async (productId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/shop/products/${productId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch product details";
    }
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    resetProductDetails: (state) => {
      state.productDetails = null;
    },
    clearProductList: (state) => {
      state.productList = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Products
      .addCase(fetchAllFilteredProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data || [];
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Fetch Single Product
      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data || null;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { resetProductDetails, clearProductList } = shoppingProductSlice.actions;
export default shoppingProductSlice.reducer;