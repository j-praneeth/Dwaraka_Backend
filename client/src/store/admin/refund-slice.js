import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  refunds: [],
  isLoading: false,
  error: null,
  processingRefund: false,
};

// Fetch refunds
export const fetchRefunds = createAsyncThunk(
  "/refund/fetchRefunds",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://dwarakas-backend.vercel.app/api/shop/order/refunds", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch refunds");
      }

      return response.data; // Return all refunds
    } catch (error) {
      console.error("Error fetching refunds:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch refunds"
      );
    }
  }
);

// Process a refund
export const processRefund = createAsyncThunk(
  "/refund/processRefund",
  async (orderId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `https://dwarakas-backend.vercel.app/api/shop/order/refund/${orderId}`,
        { refundStatus: "Refunded" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to process refund");
      }

      return response.data; // Return the response data
    } catch (error) {
      console.error("Error processing refund:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to process refund"
      );
    }
  }
);

const refundSlice = createSlice({
  name: "refund",
  initialState,
  reducers: {
    clearRefundError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRefunds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRefunds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.refunds = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchRefunds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "An error occurred while fetching refunds";
      })
      .addCase(processRefund.pending, (state) => {
        state.processingRefund = true;
        state.error = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.processingRefund = false;
        // Update the specific refund in the list
        if (action.payload.data) {
          state.refunds = state.refunds.map(refund =>
            refund._id === action.payload.data._id ? action.payload.data : refund
          );
        }
        state.error = null;
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.processingRefund = false;
        state.error = action.payload || "An error occurred while processing refund";
      });
  },
});

export const { clearRefundError } = refundSlice.actions;
export default refundSlice.reducer;