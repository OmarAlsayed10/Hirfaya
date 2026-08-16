import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { cvAnalyzeAction, requestLanguage } from '../../../../redux/store/slices/cvAnalyzeSlice';
import { clearAdjustedCV } from '../../../../redux/store/slices/cvAdjustSlice';
import type { RootState } from '../../../../redux/store/store';
import type { CVAnalysisResult } from '../CVAnalysisDashboard.types';

export function useCVAnalysis(uploadedFile?: File, cvId?: string, level?: string) {
  const dispatch = useDispatch<any>();
  const { i18n } = useTranslation();
  const { cvAnalyze, loading, error, errorStatus, errorCode, resultLanguage } = useSelector(
    (state: RootState) => state.cvAnalyze,
  );
  const language = requestLanguage();

  const lastRequestRef = useRef<string | null>(null);

  useEffect(() => {
    if (!uploadedFile && !cvId) return;

    const requestKey = [
      uploadedFile?.name,
      uploadedFile?.size,
      uploadedFile?.lastModified,
      cvId,
      level,
    ].join('|');
    if (lastRequestRef.current === requestKey) return;
    lastRequestRef.current = requestKey;

    dispatch(cvAnalyzeAction({ file: uploadedFile, cvId, level }));
  }, [dispatch, uploadedFile, cvId, level]);

  useEffect(() => () => {
    dispatch(clearAdjustedCV());
  }, [dispatch]);

  // Switching UI language regenerates the analysis in that language. The backend caches
  // per language and does not re-charge a CV already analyzed, so switching back is free.
  const analyzedText = (cvAnalyze as CVAnalysisResult | null)?.extractedText;
  useEffect(() => {
    if (loading || !analyzedText || !resultLanguage || resultLanguage === language) return;
    dispatch(cvAnalyzeAction({
      file: uploadedFile,
      cvId,
      level,
      language,
    }));
  }, [dispatch, i18n.language, language, resultLanguage, analyzedText, loading, level, uploadedFile, cvId]);

  return {
    cvAnalyze: cvAnalyze as CVAnalysisResult | null,
    loading: loading as boolean,
    error: error as string | null,
    errorStatus: errorStatus as number,
    errorCode: errorCode as string | null,
  };
}
