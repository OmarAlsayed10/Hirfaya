import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AI_ENDPOINTS } from "../../../constants/endpoints";

export interface CVChange {
  section: string;
  what: string;
  why: string;
  impact: "high" | "medium" | "low";
}

export interface ScoreCategory {
  name: string;
  earned: number;
  max: number;
  tip: string | null;
  blocker?: "content" | "experience" | null;
  owner?: "user" | "ai";
}

interface AdjustCVPayload {
  cvText: string;
  currentScore: number;
  negativeFeedback: string[];
  sectionsToImprove: { section: string; suggestion: string }[];
  targetRole?: string;
  level?: string;
  applyJakeTemplate?: boolean;
}

export const adjustCVAction = createAsyncThunk(
  "cvAdjust/adjust",
  async (payload: AdjustCVPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        AI_ENDPOINTS.adjustCV,
        payload,
        { withCredentials: true }
      );
      return response.data as { adjustedCV: string; formData: Record<string, any> | null; changes: CVChange[]; originalScore: number; newScore: number; newBreakdown: ScoreCategory[] };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        return rejectWithValue(error.response.data.message as string);
      }
      return rejectWithValue("Failed to optimize CV. Please try again.");
    }
  }
);

const cvAdjustSlice = createSlice({
  name: "cvAdjust",
  initialState: {
    adjustedCV: null as string | null,
    // The optimizer returns the rewrite as fields too, so the download can use the real templates.
    optimizedFormData: null as Record<string, any> | null,
    changes: [] as CVChange[],
    originalScore: null as number | null,
    newScore: null as number | null,
    newBreakdown: [] as ScoreCategory[],
    appliedJake: false,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearAdjustedCV(state) {
      state.adjustedCV = null;
      state.optimizedFormData = null;
      state.changes = [];
      state.originalScore = null;
      state.newScore = null;
      state.newBreakdown = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adjustCVAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adjustCVAction.fulfilled, (state, action) => {
        state.loading = false;
        state.adjustedCV = action.payload.adjustedCV;
        state.optimizedFormData = action.payload.formData ?? null;
        state.changes = action.payload.changes;
        state.originalScore = action.payload.originalScore;
        state.newScore = action.payload.newScore;
        state.newBreakdown = action.payload.newBreakdown || [];
        state.appliedJake = action.meta.arg.applyJakeTemplate ?? false;
      })
      .addCase(adjustCVAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to optimize CV";
      });
  },
});

export const { clearAdjustedCV } = cvAdjustSlice.actions;
export default cvAdjustSlice.reducer;
