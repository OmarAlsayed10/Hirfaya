import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../../lib/api';
import { AI_ENDPOINTS } from '../../../constants/endpoints';

export const generateContentAction = createAsyncThunk(
  "generateContent",
  async function fetchAIContent(data: Record<string, string>) {
    try {
      const response = await api.post(AI_ENDPOINTS.aiWritingAssist, data);
      if (response.status === 200) {
        return response.data.generatedContent;
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  }

);


export const generateContentSlice = createSlice({
  name: 'generateContent',
  initialState: {
    generateContent: "",
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(generateContentAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateContentAction.fulfilled, (state, action) => {
        state.loading = false;
        state.generateContent = action.payload;
      })
      .addCase(generateContentAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
})

export default generateContentSlice.reducer;