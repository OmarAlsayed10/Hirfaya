import {
  combineReducers,
  configureStore,
  createAction,
} from "@reduxjs/toolkit";
import { savedCVsSlice } from "./slices/savedCVsSlice";
import { generateContentSlice } from "./slices/generateContentSlice";
import { cvTemplateSlice } from "./slices/cvTemplateSlice";
import { cvScoreSlice } from "./slices/cvScoreSlice";
import { cvAnalyzeSlice } from "./slices/cvAnalyzeSlice";
import { paymentSlice } from "./slices/paymentSlice";
import cvBuilderReducer from "./slices/cvBuilderSlice";
import cvAdjustReducer from "./slices/cvAdjustSlice";
import fieldHistoryReducer from "./slices/fieldHistorySlice";

export const resetStore = createAction("app/reset");

const appReducer = combineReducers({
  savedCVs: savedCVsSlice.reducer,
  generateContent: generateContentSlice.reducer,
  cvTemplate: cvTemplateSlice.reducer,
  cvScore: cvScoreSlice.reducer,
  cvAnalyze: cvAnalyzeSlice.reducer,
  payment: paymentSlice.reducer,
  cvBuilder: cvBuilderReducer,
  cvAdjust: cvAdjustReducer,
  fieldHistory: fieldHistoryReducer,
});

const rootReducer: typeof appReducer = (state, action) =>
  appReducer(resetStore.match(action) ? undefined : state, action);

const store = configureStore({ reducer: rootReducer });

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export default store;
