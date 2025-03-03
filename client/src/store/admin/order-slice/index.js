import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  orderList: [],
  orderDetails: null,
};

const getAuthToken = () => {
  return localStorage.getItem("token"); // Adjust this based on how you store the token
};

export const getAllOrdersForAdmin = createAsyncThunk(
  "/order/getAllOrdersForAdmin",
  async () => {
    const response = await axios.get(
      `https://dwarakas-backend.vercel.app/api/admin/orders/get`
    );

    return response.data;
  }
);

export const getOrderDetailsForAdmin = createAsyncThunk(
  "/order/getOrderDetailsForAdmin",
  async (id) => {
    const response = await axios.get(
      `https://dwarakas-backend.vercel.app/api/admin/orders/details/${id}`
    );

    return response.data;
  }
);

export const updateOrderStatus = createAsyncThunk(
  "/order/updateOrderStatus",
  async ({ id, orderStatus }) => {
    const response = await axios.put(
      `https://dwarakas-backend.vercel.app/api/admin/orders/update/${id}`,
      {
        orderStatus,
      }
    );

    return response.data;
  }
);

export const updateReturnStatus = createAsyncThunk(
  "/order/updateReturnStatus",
  async ({ orderId, status }) => {
    const token = localStorage.getItem("token"); // Adjust this based on how you store the token
    console.log("Updating return status for order ID:", orderId, "with status:", status);
    console.log("Authorization Token:", token);
    const response = await axios.put(
      `https://dwarakas-backend.vercel.app/api/shop/order/return/${orderId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      }
    );

    return response.data;
  }
);

export const getAllReturnRequests = createAsyncThunk(
  "/order/getAllReturnRequests",
  async () => {
    const token = getAuthToken();
    const response = await axios.get(
      `https://dwarakas-backend.vercel.app/api/shop/order/returns`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      }
    );

    return response.data;
  }
);

export const processReturnRequest = createAsyncThunk(
  "/order/processReturnRequest",
  async (orderId) => {
    const response = await axios.post(
      `https://dwarakas-backend.vercel.app/api/shop/order/return/${orderId}/process`
    );

    return response.data;
  }
);

export const requestReturn = createAsyncThunk(
  "/order/requestReturn",
  async ({ orderId, reason, description, images }) => {
    const response = await axios.post(
      `https://dwarakas-backend.vercel.app/api/shop/order/return/${orderId}`,
      { reason, description, images }
    );

    return response.data;
  }
);

export const cancelReturnRequest = createAsyncThunk(
  "/order/cancelReturnRequest",
  async (orderId) => {
    const response = await axios.delete(
      `https://dwarakas-backend.vercel.app/api/shop/order/return/${orderId}/cancel`
    );

    return response.data;
  }
);

export const updateRefundStatus = createAsyncThunk(
  "/order/updateRefundStatus",
  async ({ orderId, refundStatus }) => {
    const token = localStorage.getItem("token"); // Adjust this based on how you store the token
    console.log("Updating refund status for order ID:", orderId, "with status:", refundStatus);
    console.log("Authorization Token:", token);
    const response = await axios.put(
      `https://dwarakas-backend.vercel.app/api/shop/order/refund/${orderId}`,
      { refundStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      }
    );

    return response.data;
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      console.log("resetOrderDetails");

      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })
      .addCase(requestReturn.fulfilled, (state, action) => {
        // Handle successful return request
        console.log("Return request submitted:", action.payload);
      })
      .addCase(cancelReturnRequest.fulfilled, (state, action) => {
        // Handle successful return cancellation
        console.log("Return request canceled:", action.payload);
      });
  },
});

export const { resetOrderDetails } = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
