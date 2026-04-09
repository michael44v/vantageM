import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminService, tradingService } from "../../services/api";

export const fetchLiveTrades = createAsyncThunk("trading/fetchLiveTrades", async () => {
  const result = await adminService.getLiveTrades();
  return result.data;
});

export const executeTrade = createAsyncThunk("trading/executeTrade", async (tradeData) => {
  const result = await tradingService.execute({
    tradingAccountId: tradeData.account_id,
    symbol: tradeData.symbol,
    type: tradeData.type,
    lots: tradeData.lots,
    price: tradeData.price
  });
  return result;
});

const tradingSlice = createSlice({
  name: "trading",
  initialState: {
    liveTrades: [],
    loading: false,
    error: null,
  },
  reducers: {
    simulatePriceMove: (state) => {
      state.liveTrades = state.liveTrades.map(trade => {
        const move = (Math.random() - 0.5) * 0.0002;
        const newPrice = parseFloat(trade.current_price) + move;
        const pnl = (trade.type === 'long' ? 1 : -1) * (newPrice - parseFloat(trade.entry_price)) * (parseFloat(trade.lots) * 100000);
        return {
          ...trade,
          current_price: newPrice.toFixed(5),
          pnl: pnl.toFixed(2)
        };
      });
    }
  },
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
      })
      .addCase(executeTrade.pending, (state) => {
        state.loading = true;
      })
      .addCase(executeTrade.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(executeTrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { simulatePriceMove } = tradingSlice.actions;
export default tradingSlice.reducer;
