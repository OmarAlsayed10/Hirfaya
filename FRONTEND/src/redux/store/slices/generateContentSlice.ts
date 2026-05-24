import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const generateContentAction = createAsyncThunk(
  "generateContent",
  async function fetchAIContent(data) {
    try {
      const response = await axios.post('http://localhost:3001/api/ai/ai-writing-assist', data, { withCredentials: true });
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