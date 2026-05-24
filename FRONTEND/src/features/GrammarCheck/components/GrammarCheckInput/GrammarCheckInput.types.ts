export interface GrammarCheckInputProps {
  grammarText: string;
  handleContentChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleClear: () => void;
  handleCheckGrammar: () => void;
  isLoading: boolean;
  isButtonVisible: boolean;
}
