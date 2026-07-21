import { useState } from 'react';
import axios from 'axios';
import { AI_ENDPOINTS } from '../../../../constants/endpoints';
import type { InterviewQA } from '../CVAnalysisDashboard.types';

export function useInterviewAnswers(cvText: string | undefined, questions: string[]) {
  const [answers, setAnswers] = useState<InterviewQA[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const fetchAnswers = async (): Promise<InterviewQA[]> => {
    if (!cvText || !questions.length) return [];
    setLoading(true);
    setVisible(true);
    try {
      const res = await axios.post(
        AI_ENDPOINTS.interviewAnswers,
        { cvText, questions },
        { withCredentials: true }
      );
      const data: InterviewQA[] = res.data.answers || [];
      setAnswers(data);
      return data;
    } catch {
      setAnswers([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { answers, loading, visible, fetchAnswers };
}
