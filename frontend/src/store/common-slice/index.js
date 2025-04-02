import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  featureImageList: [],
};

// Add delete feature image async thunk
export const deleteFeatureImage = createAsyncThunk(
  "common/deleteFeatureImage",
  async (imageUrl) => {
    const response = await axios.delete(
      `http://localhost:5002/api/common/feature/delete`,
      { data: { url: imageUrl } }
    );
    return response.data;
  }
);

// Existing async thunks
export const getFeatureImages = createAsyncThunk(
  "common/getFeatureImages",
  async () => {
    const response = await axios.get(
      `http://localhost:5002/api/common/feature/get`
    );
    return response.data;
  }
);

export const addFeatureImage = createAsyncThunk(
  "common/addFeatureImage",
  async (image) => {
    const response = await axios.post(
      `http://localhost:5002/api/common/feature/add`,
      { image }
    );
    return response.data;
  }
);

const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data;
      })
      .addCase(getFeatureImages.rejected, (state) => {
        state.isLoading = false;
        state.featureImageList = [];
      })
      // Add delete cases
      .addCase(deleteFeatureImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteFeatureImage.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteFeatureImage.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

// Export all actions
export const commonActions = {
  getFeatureImages,
  addFeatureImage,
  deleteFeatureImage
};

export default commonSlice.reducer;