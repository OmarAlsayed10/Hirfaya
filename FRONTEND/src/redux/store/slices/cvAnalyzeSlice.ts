import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AI_ENDPOINTS } from "../../../constants/endpoints";

export const cvAnalyzeAction = createAsyncThunk(
  "cvAnalyze",
  async function featchAnalysisCV(
    { file, cvText, level }: { file?: File; cvText?: string; level?: string },
    { rejectWithValue }
  ) {
    try {
      const formData = new FormData();
      if (file) formData.append("cv", file);
      if (cvText) formData.append("cvText", cvText);
      if (level) formData.append("level", level);
      const response = await axios.post(AI_ENDPOINTS.analyze, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      window.dispatchEvent(new Event("quota:refresh"));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        return rejectWithValue({
          status: error.response.status,
          code: error.response.data.code,
          message: error.response.data.message,
        });
      }
      return rejectWithValue({ status: 0, message: "Something went wrong. Please try again." });
    }
  }
);



export const cvAnalyzeSlice = createSlice({
  name: "cvAnalyze",
  initialState: {
    cvAnalyze: null,
    loading: false,
    error: null as string | null,
    errorStatus: 0,
    errorCode: null as string | null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(cvAnalyzeAction.pending, (state) => {
        state.loading = true;
        state.cvAnalyze = null;
        state.error = null;
        state.errorStatus = 0;
        state.errorCode = null;
      })
      .addCase(cvAnalyzeAction.fulfilled, (state, action) => {
        state.loading = false;
        state.cvAnalyze = action.payload;
      })
      .addCase(cvAnalyzeAction.rejected, (state, action) => {
        state.loading = false;
        state.cvAnalyze = null;
        const payload = action.payload as { status?: number; code?: string; message?: string } | undefined;
        state.error = payload?.message ?? "Something went wrong. Please try again.";
        state.errorStatus = payload?.status ?? 0;
        state.errorCode = payload?.code ?? null;
      });
  },
})

export default cvAnalyzeSlice.reducer;