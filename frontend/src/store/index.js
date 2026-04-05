import { configureStore } from "@reduxjs/toolkit";
import tradingReducer from "./slices/tradingSlice";

export const store = configureStore({
  reducer: {
    trading: tradingReducer,
  },
});

export default store;
