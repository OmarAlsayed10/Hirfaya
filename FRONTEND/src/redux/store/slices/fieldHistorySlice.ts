import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { updateFormData } from "./cvBuilderSlice";

interface FieldHistoryState {
  entries: Record<string, unknown[]>;
}

const initialState: FieldHistoryState = { entries: {} };

export const fieldHistorySlice = createSlice({
  name: "fieldHistory",
  initialState,
  reducers: {
    pushFieldHistory: (state, action: PayloadAction<{ key: string; value: unknown }>) => {
      const { key, value } = action.payload;
      if (!state.entries[key]) state.entries[key] = [];
      state.entries[key].push(value);
    },
    popFieldHistory: (state, action: PayloadAction<{ key: string }>) => {
      state.entries[action.payload.key]?.pop();
    },
  },
  extraReducers: (builder) => {

    builder.addCase(updateFormData, (state) => {
      state.entries = {};
    });
  },
});

export const { pushFieldHistory, popFieldHistory } = fieldHistorySlice.actions;
export default fieldHistorySlice.reducer;
