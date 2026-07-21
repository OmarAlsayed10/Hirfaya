import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import classic from '../../../assets/classic.jpg';
import modern from '../../../assets/modern.jpg';
import linkedin from '../../../assets/linkedin.jpg';
export const cvTemplateAction = createAsyncThunk(
    'cvTemplate/getAll',


    async () => {
        return [{ title: 'jake-cv', id: 4, img: classic, pro: true, disc: 'ATS-optimized single-column (recommended)' },
        { title: 'harvard-cv', id: 5, img: classic, pro: true, disc: 'Harvard resume format (serif, single-column)' },
        { title: 'classic-cv', id: 1, img: classic, pro: false, disc: 'discription 1' },
        { title: 'linkedin-cv', id: 2, img: linkedin, pro: false, disc: 'discription 2' },
        { title: 'modern-cv', id: 3, img: modern, pro: true, disc: 'discription 3' },]
    }

)

export const cvTemplateSlice = createSlice({
    name: 'cvTemplate',
    initialState: {
        cvTemplate: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(cvTemplateAction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cvTemplateAction.fulfilled, (state, action) => {
                state.loading = false;
                state.cvTemplate = action.payload;
            })
            .addCase(cvTemplateAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
})

export default cvTemplateSlice.reducer;