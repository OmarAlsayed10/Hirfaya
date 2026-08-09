import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { cvAnalyzeAction, requestLanguage } from '../../../../redux/store/slices/cvAnalyzeSlice';
import { clearAdjustedCV } from '../../../../redux/store/slices/cvAdjustSlice';
import type { RootState } from '../../../../redux/store/store';
import type { CVAnalysisResult } from '../CVAnalysisDashboard.types';

export function useCVAnalysis(uploadedFile?: File, cvText?: string, level?: string) {
  const dispatch = useDispatch<any>();
  const { i18n } = useTranslation();
  const { cvAnalyze, loading, error, errorStatus, errorCode, resultLanguage } = useSelector(
    (state: RootState) => state.cvAnalyze,
  );
  const language = requestLanguage();

  // StrictMode mounts effects twice in development, so one upload fired two analyses: two AI
  // calls, two charges, and two AnalysisEvent rows behind the home page counter. Refs survive
  // the remount, so keying on the request itself makes the duplicate a no-op.
  const lastRequestRef = useRef<string | null>(null);

  useEffect(() => {
    if (!uploadedFile && !cvText) return;

    const requestKey = [
      uploadedFile?.name,
      uploadedFile?.size,
      uploadedFile?.lastModified,
      cvText?.length,
      level,
    ].join('|');
    if (lastRequestRef.current === requestKey) return;
    lastRequestRef.current = requestKey;

    dispatch(cvAnalyzeAction({ file: uploadedFile, cvText, level }));
  }, [dispatch, uploadedFile, cvText, level]);

  useEffect(() => () => {
    dispatch(clearAdjustedCV());
  }, [dispatch]);

  // Switching UI language regenerates the analysis in that language. The backend caches
  // per language and does not re-charge a CV already analyzed, so switching back is free.
  const analyzedText = (cvAnalyze as CVAnalysisResult | null)?.extractedText;
  useEffect(() => {
    if (loading || !analyzedText || !resultLanguage || resultLanguage === language) return;
    dispatch(cvAnalyzeAction({ cvText: analyzedText, level, language }));
  }, [dispatch, i18n.language, language, resultLanguage, analyzedText, loading, level]);

  return {
    cvAnalyze: cvAnalyze as CVAnalysisResult | null,
    loading: loading as boolean,
    error: error as string | null,
    errorStatus: errorStatus as number,
    errorCode: errorCode as string | null,
  };
}
