import { createSlice } from "@reduxjs/toolkit";
import type { BuilderSnapshot } from "./builderHistoryActions";
import {
  clearBuilderHistory,
  reapplyBuilderSnapshot,
  recordBuilderSnapshot,
  restoreBuilderSnapshot,
} from "./builderHistoryActions";

interface BuilderHistoryState {
  snapshots: BuilderSnapshot[];
  redoSnapshots: BuilderSnapshot[];
}

const initialState: BuilderHistoryState = { snapshots: [], redoSnapshots: [] };

export const builderHistorySlice = createSlice({
  name: "builderHistory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(clearBuilderHistory, (state) => {
        state.snapshots = [];
        state.redoSnapshots = [];
      })
      .addCase(recordBuilderSnapshot, (state, action) => {
        state.snapshots.push(action.payload);
        if (state.snapshots.length > 50) state.snapshots.shift();
        state.redoSnapshots = [];
      })
      .addCase(restoreBuilderSnapshot, (state, action) => {
        state.snapshots.pop();
        state.redoSnapshots.push(action.payload.currentBuilder);
      })
      .addCase(reapplyBuilderSnapshot, (state, action) => {
        state.redoSnapshots.pop();
        state.snapshots.push(action.payload.currentBuilder);
        if (state.snapshots.length > 50) state.snapshots.shift();
      });
  },
});

export default builderHistorySlice.reducer;
