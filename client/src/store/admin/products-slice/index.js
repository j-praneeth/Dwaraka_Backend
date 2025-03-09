/* eslint-disable no-unused-vars */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
};

export const addNewProduct = createAsyncThunk(
  "/products/addnewproduct",
  async (formData) => {
    try {
      const result = await axios.post(
        "https://dwarakas-backend.vercel.app/api/admin/products/add",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return result?.data;
    } catch (error) {
      console.error("Error adding new product:", error); // Log the error for debugging
      throw error; // Rethrow the error to be caught in the extraReducers
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async () => {
    const result = await axios.get(
      "https://dwarakas-backend.vercel.app/api/admin/products/get"
    );

    return result?.data;
  }
);

export const editProduct = createAsyncThunk(
  "/products/editProduct",
  async ({ id, productData }) => {
    try {
      const response = await axios.put(
        `https://dwarakas-backend.vercel.app/api/admin/products/edit/${id}`,
        productData
      );
      return response.data;
    } catch (error) {
      console.error("Error in editProduct:", error); // Log the error for debugging
      throw error; // Rethrow the error to be caught in the extraReducers
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "/products/deleteProduct",
  async (id) => {
    const result = await axios.delete(
      `https://dwarakas-backend.vercel.app/api/admin/products/delete/${id}`
    );

    return result?.data;
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        // Handle successful edit
      })
      .addCase(editProduct.rejected, (state, action) => {
        // Handle error
      });
  },
});

export default AdminProductsSlice.reducer;
