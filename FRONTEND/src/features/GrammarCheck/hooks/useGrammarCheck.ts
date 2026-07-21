import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { AI_ENDPOINTS } from "../../../constants/endpoints";

export interface GrammarIssue {
  id: string;
  type: string;
  severity: "high" | "medium" | "low";
  suggestion: string;
}

export const useGrammarCheck = () => {
  const { t } = useTranslation();
  const [grammarText, setGrammarText] = useState("");
  const [grammarResult, setGrammarResult] = useState<any>("");
  const [selectedTab, setSelectedTab] = useState("All");
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isButtonVisible, setIsButtonVisible] = useState(false);

  const handleContentChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGrammarText(event.target.value);
    setIsButtonVisible(event.target.value.trim() !== "");
  };

  const handleClear = () => {
    setGrammarText("");
    setIsButtonVisible(false);
    setError("");
    setGrammarResult("");
    setIssues([]);
  };

  const handleCheckGrammar = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        AI_ENDPOINTS.grammarCheck,
        { grammarText: grammarText },
        { withCredentials: true },
      );

      if (response.status === 200) {
        setGrammarResult(response.data);
        setError("");
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          setError(t("pleaseLogin"));
          setGrammarResult("");
        } else if (error.response.status === 403) {
          setError(t("proRequired"));
          setGrammarResult("");
        } else {
          setGrammarResult("");
        }
      } else if (error.request) {
        if (error.code === "ERR_NETWORK") {
          setError(t("networkError"));
          setGrammarResult("");
        } else {
          setGrammarResult("");
        }
      } else {
        setError(t("Error:") + " " + error.message);
        setGrammarResult("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (grammarResult) {
      const categories = {
        Grammar: grammarResult?.Grammar || [],
        Spelling: grammarResult?.Spelling || [],
        Punctuation: grammarResult?.Punctuation || [],
        Style: grammarResult?.Style || [],
      };

      const allIssues = Object.entries(categories).flatMap(([type, issues]: [string, any]) =>
        issues.map((item: string, idx: number) => ({
          id: `${type}-${idx}`,
          type,
          severity:
            type === "Grammar"
              ? "high"
              : type === "Punctuation"
                ? "low"
                : "medium",
          suggestion: item,
        })),
      );

      setIssues(allIssues as GrammarIssue[]);
    }
  }, [grammarResult]);

  const filteredIssues =
    selectedTab === "All"
      ? issues
      : issues.filter((issue) => issue.type === selectedTab);

  const handleFix = (errorText: string, correctText: string, issueId: string) => {
    const updatedText = grammarText.replace(errorText, correctText);
    setGrammarText(updatedText);

    const updatedIssues = issues.filter((issue) => issue.id !== issueId);
    setIssues(updatedIssues);
  };

  return {
    grammarText,
    handleContentChange,
    handleClear,
    handleCheckGrammar,
    isLoading,
    isButtonVisible,
    error,
    grammarResult,
    selectedTab,
    setSelectedTab,
    issues,
    filteredIssues,
    handleFix,
  };
};
