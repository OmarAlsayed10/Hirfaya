import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cvAnalyzeAction } from '../../../../redux/store/slices/cvAnalyzeSlice';
import { clearAdjustedCV } from '../../../../redux/store/slices/cvAdjustSlice';
import type { RootState } from '../../../../redux/store/store';
import type { CVAnalysisResult } from '../CVAnalysisDashboard.types';

export function useCVAnalysis(uploadedFile?: File, cvText?: string, level?: string) {
  const dispatch = useDispatch<any>();
  const { cvAnalyze, loading, error, errorStatus, errorCode } = useSelector((state: RootState) => state.cvAnalyze);

  useEffect(() => {
    if (uploadedFile || cvText) {
      dispatch(cvAnalyzeAction({ file: uploadedFile, cvText, level }));
    }
    return () => {
      dispatch(clearAdjustedCV());
    };
  }, [dispatch, uploadedFile, cvText, level]);

  return {
    cvAnalyze: cvAnalyze as CVAnalysisResult | null,
    loading: loading as boolean,
    error: error as string | null,
    errorStatus: errorStatus as number,
    errorCode: errorCode as string | null,
  };
}
