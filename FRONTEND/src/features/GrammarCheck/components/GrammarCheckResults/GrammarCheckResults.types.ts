export interface GrammarIssue {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface GrammarCheckResultsProps {
  error: string;
  isLoading: boolean;
  grammarResult: Record<string, string[]> | null;
  selectedTab: string;
  setSelectedTab: (val: string) => void;
  issues: GrammarIssue[];
  filteredIssues: GrammarIssue[];
  handleFix: (wrong: string, correct: string, id: string) => void;
}
