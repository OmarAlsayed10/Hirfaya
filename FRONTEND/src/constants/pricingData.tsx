import DescriptionIcon from "@mui/icons-material/Description";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import EditIcon from "@mui/icons-material/Edit";
import { ReactNode } from "react";

export interface FeatureHighlight {
  icon: ReactNode;
  headline: string;
  text: string;
}

export const FREE_PLAN_FEATURES: string[] = [
  "All resume templates",
  "Basic resume sections",
  "ResumIq branding",
  "Maximum 12 section items",
  "Access to all design tools",
];

export const PRO_PLAN_FEATURES: string[] = [
  "150 resumes and cover letters",
  "All resume templates",
  "Real-time content suggestions",
  "ATS check (Applicant Tracking System)",
  "Pro resume sections",
  "No branding",
  "Unlimited section items",
  "Thousands of design options",
];

export const BILLING_CYCLES = ["Monthly", "Quarterly", "Semi-Annual"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const PRO_PRICE_MAP: Record<
  BillingCycle,
  { monthly: string; total: string }
> = {
  Monthly: { monthly: "$5", total: "Billed monthly" },
  Quarterly: { monthly: "$3.85", total: "$11.56 billed every 3 months" },
  "Semi-Annual": { monthly: "$3.50", total: "$21.00 billed every 6 months" },
};

export const FEATURE_HIGHLIGHTS: FeatureHighlight[] = [
  {
    icon: <DescriptionIcon sx={{ color: "#2a5c45", fontSize: "2rem" }} />,
    headline: "One builder, hundreds of templates",
    text: "Choose from hundreds of professionally designed and ATS-friendly resume templates, tens of resume sections, and thousands of combinations made to make you stand out.",
  },
  {
    icon: <AutoFixHighIcon sx={{ color: "#2a5c45", fontSize: "2rem" }} />,
    headline: "AI Grammar & Content Checks",
    text: "Get a powerful AI-powered content analyzing tool. Don't let mistakes and typos cost a potential job. Cut out clichés, repetition, and vague wording.",
  },
  {
    icon: <EditIcon sx={{ color: "#2a5c45", fontSize: "2rem" }} />,
    headline: "Tailor your resume with a single click",
    text: "With our resume tailoring feature you can ensure your resume is relevant to the job you're applying for.",
  },
];
