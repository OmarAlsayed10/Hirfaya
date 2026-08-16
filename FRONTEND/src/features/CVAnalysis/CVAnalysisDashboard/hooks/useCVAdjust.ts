import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adjustCVAction, clearAdjustedCV } from '../../../../redux/store/slices/cvAdjustSlice';
import type { RootState } from '../../../../redux/store/store';
import type { CVAnalysisResult } from '../CVAnalysisDashboard.types';

export function useCVAdjust(cvAnalyze: CVAnalysisResult | null) {
  const dispatch = useDispatch<any>();
  const adjustState = useSelector((state: RootState) => state.cvAdjust);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (applyJakeTemplate = false) => {
    if (!cvAnalyze?.extractedText) return;
    setModalOpen(true);
    const needsRun = !adjustState.adjustedCV || adjustState.appliedJake !== applyJakeTemplate;
    if (needsRun) {
      dispatch(clearAdjustedCV());
      dispatch(
        adjustCVAction({
          cvText: cvAnalyze.extractedText,
          currentScore: cvAnalyze.qualityScore || 0,
          negativeFeedback: cvAnalyze.negativeFeedback || [],
          sectionsToImprove: cvAnalyze.sectionsToImprove || [],
          targetRole: "",
          level: cvAnalyze.level || "",
          applyJakeTemplate,
        })
      );
    }
  };

  const closeModal = () => setModalOpen(false);

  return {
    modalOpen,
    openModal,
    closeModal,
    adjustedCV: adjustState.adjustedCV,
    optimizedFormData: adjustState.optimizedFormData,
    changes: adjustState.changes,
    newScore: adjustState.newScore,
    newBreakdown: adjustState.newBreakdown,
    loading: adjustState.loading,
    error: adjustState.error,
    pageCount: adjustState.appliedJake ? 1 : Math.max(1, cvAnalyze?.pageCount ?? 1),
    // prefer the rule-based original score returned by the API so both scores use the same scale
    originalScore: adjustState.originalScore ?? cvAnalyze?.qualityScore ?? 0,
  };
}
