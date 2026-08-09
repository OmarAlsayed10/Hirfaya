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
import cvBuilderReducer, { hydrateBuilderDraft } from "./slices/cvBuilderSlice";
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

const DRAFT_KEY = "cvBuilderDraft";

const readDraft = () => {
  try {
    const restored = hydrateBuilderDraft(localStorage.getItem(DRAFT_KEY));
    return restored ? { cvBuilder: restored } : undefined;
  } catch {
    return undefined;
  }
};

const store = configureStore({ reducer: rootReducer, preloadedState: readDraft() });

// The in-progress CV lives only in memory, so a refresh would wipe unsaved edits without this.
let lastBuilder = store.getState().cvBuilder;
store.subscribe(() => {
  const builder = store.getState().cvBuilder;
  if (builder === lastBuilder) return;
  lastBuilder = builder;
  const { formData, currentCvId, title, template, sectionOrder } = builder;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData, currentCvId, title, template, sectionOrder }));
  } catch {
    // Quota exceeded or storage disabled — drafts simply stop persisting.
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export default store;
