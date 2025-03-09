import { configureStore } from "@reduxjs/toolkit";
import adminProductsReducer from "./admin/products-slice";
import categoryReducer from "./shop/category-slice"; // Import the category reducer

const store = configureStore({
  reducer: {
    adminProducts: adminProductsReducer,
    category: categoryReducer, // Ensure this line is present
    // other reducers...
  },
});

export default store; 