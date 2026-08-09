import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSection } from '../../../redux/store/slices/cvBuilderSlice';
import type { RootState } from '../../../redux/store/store';
import { extractSkills } from '../skillDictionary';
import axios from 'axios';
import { AI_ENDPOINTS } from '../../../constants/endpoints';

// Watches the experience text and adds newly-detected skills to the Skills section once.
// A skill is only ever auto-added a single time, so the user can freely remove one without
// it reappearing on the next keystroke.
export const useSkillAutoExtract = () => {
  const dispatch = useDispatch();
  const formData = useSelector((s: RootState) => s.cvBuilder?.formData);
  const experience = formData?.experience || [];
  const skills = formData?.skills || { skills: [], languages: '', certifications: [] };

  const everAdded = useRef<Set<string>>(new Set());
  const formDataRef = useRef(formData);
  const lastFetchedTextRef = useRef('');

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    const text = experience.map((e) => `${e.jobTitle ?? ''} ${e.description ?? ''}`).join(' ');
    
    // 1. Instant static dictionary extraction
    const detected = extractSkills(text);
    if (detected.length === 0) return;

    const current = skills.skills ?? [];
    const currentLower = new Set(current.map((s) => s.toLowerCase()));
    const toAdd = detected.filter(
      (s) => !everAdded.current.has(s.toLowerCase()) && !currentLower.has(s.toLowerCase()),
    );

    detected.forEach((s) => everAdded.current.add(s.toLowerCase()));

    if (toAdd.length > 0) {
      dispatch(updateSection({ section: 'skills', data: { ...skills, skills: [...current, ...toAdd] } }));
    }

    // 2. AI-powered smart extraction (debounced to avoid spamming the API on every keystroke)
    const timeout = setTimeout(async () => {
      // Only run AI extraction if there's substantial text
      if (text.trim().length > 30 && text !== lastFetchedTextRef.current) {
        lastFetchedTextRef.current = text;
        try {
          const { data } = await axios.post(
            AI_ENDPOINTS.generateSmartSkills,
            { formData: formDataRef.current },
            { withCredentials: true }
          );
          if (data?.skills && Array.isArray(data.skills)) {
            const aiDetected = data.skills;
            const currentAI = skills.skills ?? [];
            const currentAILower = new Set(currentAI.map((s) => s.toLowerCase()));
            const toAddAI = aiDetected.filter(
              (s: string) => !everAdded.current.has(s.toLowerCase()) && !currentAILower.has(s.toLowerCase()),
            );
            
            aiDetected.forEach((s: string) => everAdded.current.add(s.toLowerCase()));
            
            if (toAddAI.length > 0) {
              dispatch(updateSection({ section: 'skills', data: { ...skills, skills: [...currentAI, ...toAddAI] } }));
            }
          }
        } catch (ignoredError) {
          void ignoredError;
        }
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [experience, skills, dispatch]);
};
