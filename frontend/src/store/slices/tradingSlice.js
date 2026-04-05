import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchLiveTrades = createAsyncThunk("trading/fetchLiveTrades", async () => {
  const response = await fetch("http://localhost:8000/api.php?action=admin_live_trades");
  const result = await response.json();
  if (result.success) return result.data;
  throw new Error(result.error);
});

const tradingSlice = createSlice({
  name: "trading",
  initialState: {
    liveTrades: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveTrades.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLiveTrades.fulfilled, (state, action) => {
        state.loading = false;
        state.liveTrades = action.payload;
      })
      .addCase(fetchLiveTrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default tradingSlice.reducer;
