import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  products: [],
  isLoading: false,
};

export const fetchProductsByCategory = createAsyncThunk(
  "/product/fetchProductsByCategory",
  async (category) => {
    const response = await axios.get(`https://dwarakas-backend.vercel.app/api/shop/products?category=${category}`);
    return response.data;
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data; // Assuming the response has a data field
      })
      .addCase(fetchProductsByCategory.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default productSlice.reducer; 