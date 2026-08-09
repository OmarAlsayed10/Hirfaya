import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { AI_ENDPOINTS } from '../../../../constants/endpoints';
import type { InterviewQA } from '../CVAnalysisDashboard.types';

export function useInterviewAnswers(cvText: string | undefined, questions: string[]) {
  const [answers, setAnswers] = useState<InterviewQA[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  // useTranslation rather than the i18n singleton: reading the singleton does not subscribe
  // to changes, so the effect below would not re-run when the user switches language.
  const { i18n } = useTranslation();
  const language = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const fetchedLanguage = useRef(language);

  const fetchAnswers = async (): Promise<InterviewQA[]> => {
    if (!cvText || !questions.length) return [];
    setLoading(true);
    setVisible(true);
    try {
      const res = await axios.post(
        AI_ENDPOINTS.interviewAnswers,
        { cvText, questions, language },
        { withCredentials: true }
      );
      const data: InterviewQA[] = res.data.answers || [];
      fetchedLanguage.current = language;
      setAnswers(data);
      return data;
    } catch {
      setAnswers([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Answers are generated in whatever language was active when they were requested, and
  // the PDF export reuses whatever is already here rather than calling the API again.
  // Without this the report kept shipping the answers fetched during an English session.
  useEffect(() => {
    if (fetchedLanguage.current === language) return;
    fetchedLanguage.current = language;
    setAnswers([]);
    if (visible) void fetchAnswers();
  }, [language, visible]);

  return { answers, loading, visible, fetchAnswers };
}
