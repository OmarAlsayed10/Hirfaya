import PlagiarismIcon from "@mui/icons-material/PlagiarismOutlined";
import TaskIcon from "@mui/icons-material/TaskOutlined";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import { COLORS } from "../theme/tokens";

export const CV_TOOLS = [
  {
    titleKey: "CV Analysis",
    descriptionKey: "cv_analysis.subtitle",
    icon: <PlagiarismIcon sx={{ fontSize: "28px", color: COLORS.primary }} />,
    badge: "AI Powered",
    to: "/cv-analysis",
  },
  {
    titleKey: "Smart Feedback",
    descriptionKey: "cv_feedback.subtitle",
    icon: <TaskIcon sx={{ fontSize: "28px", color: COLORS.primary }} />,
    badge: "Real-time",
    to: "/getStart",
  },
  {
    titleKey: "CV Builder",
    descriptionKey: "cv_builder.subtitle",
    icon: <BorderColorOutlinedIcon sx={{ fontSize: "28px", color: COLORS.primary }} />,
    badge: "Templates",
    to: "/getStart",
  },
  {
    titleKey: "Performance Tracking",
    descriptionKey: "performance_tracking.subtitle",
    icon: <TrendingUpOutlinedIcon sx={{ fontSize: "28px", color: COLORS.primary }} />,
    badge: "Analytics",
    to: "/getStart",
  },
  {
    titleKey: "Interview Questions",
    descriptionKey: "interview_questions.subtitle",
    icon: <QuestionAnswerOutlinedIcon sx={{ fontSize: "28px", color: COLORS.primary }} />,
    badge: "Pro",
    to: "/getStart",
  },
  {
    titleKey: "Chat Assistant",
    descriptionKey: "chat_assistant.subtitle",
    icon: <ChatBubbleOutlineIcon sx={{ fontSize: "28px", color: COLORS.primary }} />,
    badge: "24/7",
    to: "/getStart",
  },
  {
    titleKey: "Cover Letter Generator",
    descriptionKey: "cover_letter.subtitle",
    icon: <DescriptionOutlinedIcon sx={{ fontSize: "28px", color: COLORS.primary }} />,
    badge: "AI Powered",
    to: "/getStart",
  },
  {
    titleKey: "LinkedIn Optimization",
    descriptionKey: "linkedin.subtitle",
    icon: <LinkedInIcon sx={{ fontSize: "28px", color: COLORS.primary }} />,
    badge: "Profile Sync",
    to: "/getStart",
  },
  {
    titleKey: "Job Matching",
    descriptionKey: "job_matching.subtitle",
    icon: <WorkOutlineOutlinedIcon sx={{ fontSize: "28px", color: COLORS.primary }} />,
    badge: "Smart Match",
    to: "/getStart",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    icon: <UploadFileOutlinedIcon sx={{ fontSize: "28px", color: COLORS.primary }} />,
    titleKey: "Build or Upload Your CV",
    descriptionKey:
      "Start from scratch with our AI-powered builder or upload your existing CV. Choose from premium templates designed to impress recruiters.",
    badges: ["Templates", "PDF Import", "DOCX Support", "Auto-Save"],
    detailPoints: [
      "Pick a blank template or upload your existing CV",
      "AI pre-fills sections from your uploaded file",
      "Switch templates instantly with no data loss",
    ],
  },
  {
    step: "02",
    icon: <AutoFixHighOutlinedIcon sx={{ fontSize: "28px", color: COLORS.primary }} />,
    titleKey: "Get AI Analysis & Feedback",
    descriptionKey:
      "Our AI scans your CV for ATS compatibility, grammar issues, keyword gaps, and gives you a detailed improvement score.",
    badges: ["CV Quality Score", "Grammar Check", "Keywords", "Readability"],
    detailPoints: [
      "Instant CV Quality Score out of 100",
      "Highlighted grammar issues with one-click fixes",
      "Clear keyword coverage suggestions",
    ],
  },
  {
    step: "03",
    icon: <RocketLaunchOutlinedIcon sx={{ fontSize: "28px", color: COLORS.primary }} />,
    titleKey: "Apply with Confidence",
    descriptionKey:
      "Download your polished, recruiter-ready CV and start landing more interviews. Track your progress with our analytics dashboard.",
    badges: ["1-Click Export", "Track Progress", "Analytics", "Interview Prep"],
    detailPoints: [
      "Export as PDF, Word, or share a live link",
      "Track application status across companies",
      "Practice with AI-generated interview questions",
    ],
  },
];

