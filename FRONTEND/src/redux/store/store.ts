import { configureStore } from "@reduxjs/toolkit";
import { savedCVsSlice } from "./slices/savedCVsSlice";
import { generateContentSlice } from "./slices/generateContentSlice";
import { cvTemplateSlice } from "./slices/cvTemplateSlice";
import { cvScoreSlice } from "./slices/cvScoreSlice";
import { cvAnalyzeSlice } from "./slices/cvAnalyzeSlice";
import { paymentSlice } from "./slices/paymentSlice";
import cvBuilderReducer from "./slices/cvBuilderSlice";

const store = configureStore({
    reducer: {
        savedCVs: savedCVsSlice.reducer,
        generateContent: generateContentSlice.reducer,
        cvTemplate: cvTemplateSlice.reducer,
        cvScore: cvScoreSlice.reducer,
        cvAnalyze: cvAnalyzeSlice.reducer,
        payment: paymentSlice.reducer,
        cvBuilder: cvBuilderReducer,
    }
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export default store;