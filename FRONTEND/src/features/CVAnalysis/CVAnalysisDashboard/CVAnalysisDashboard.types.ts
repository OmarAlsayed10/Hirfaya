export interface CVAnalysisDashboardProps {
  uploadedFile: File;
}

export interface SectionImprovement {
  section: string;
  suggestion: string;
}

export interface CVAnalysisResult {
  atsScore: number;
  positiveFeedback: string[];
  negativeFeedback: string[];
  neutralFeedback: string[];
  sectionsToImprove: SectionImprovement[];
  interviewQuestions: string[];
}
