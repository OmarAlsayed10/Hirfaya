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

export const CV_TOOLS = [
  {
    titleKey: "CV Analysis",
    descriptionKey: "cv_analysis.subtitle",
    icon: <PlagiarismIcon sx={{ fontSize: "28px", color: "#2a5c45" }} />,
    badge: "AI Powered",
    to: "/cv-analysis",
  },
  {
    titleKey: "Smart Feedback",
    descriptionKey: "cv_feedback.subtitle",
    icon: <TaskIcon sx={{ fontSize: "28px", color: "#2a5c45" }} />,
    badge: "Real-time",
    to: "/getStart",
  },
  {
    titleKey: "CV Builder",
    descriptionKey: "cv_builder.subtitle",
    icon: <BorderColorOutlinedIcon sx={{ fontSize: "28px", color: "#2a5c45" }} />,
    badge: "Templates",
    to: "/getStart",
  },
  {
    titleKey: "Performance Tracking",
    descriptionKey: "performance_tracking.subtitle",
    icon: <TrendingUpOutlinedIcon sx={{ fontSize: "28px", color: "#2a5c45" }} />,
    badge: "Analytics",
    to: "/getStart",
  },
  {
    titleKey: "Interview Questions",
    descriptionKey: "interview_questions.subtitle",
    icon: <QuestionAnswerOutlinedIcon sx={{ fontSize: "28px", color: "#2a5c45" }} />,
    badge: "Pro",
    to: "/getStart",
  },
  {
    titleKey: "Chat Assistant",
    descriptionKey: "chat_assistant.subtitle",
    icon: <ChatBubbleOutlineIcon sx={{ fontSize: "28px", color: "#2a5c45" }} />,
    badge: "24/7",
    to: "/getStart",
  },
  {
    titleKey: "Cover Letter Generator",
    descriptionKey: "cover_letter.subtitle",
    icon: <DescriptionOutlinedIcon sx={{ fontSize: "28px", color: "#2a5c45" }} />,
    badge: "AI Powered",
    to: "/getStart",
  },
  {
    titleKey: "LinkedIn Optimization",
    descriptionKey: "linkedin.subtitle",
    icon: <LinkedInIcon sx={{ fontSize: "28px", color: "#2a5c45" }} />,
    badge: "Profile Sync",
    to: "/getStart",
  },
  {
    titleKey: "Job Matching",
    descriptionKey: "job_matching.subtitle",
    icon: <WorkOutlineOutlinedIcon sx={{ fontSize: "28px", color: "#2a5c45" }} />,
    badge: "Smart Match",
    to: "/getStart",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    icon: <UploadFileOutlinedIcon sx={{ fontSize: "28px", color: "#2a5c45" }} />,
    titleKey: "Build or Upload Your CV",
    descriptionKey:
      "Start from scratch with our AI-powered builder or upload your existing CV. Choose from premium templates designed to impress recruiters.",
    badges: ["50+ Templates", "PDF Import", "DOCX Support", "Auto-Save"],
    detailPoints: [
      "Pick a blank template or upload your existing CV",
      "AI pre-fills sections from your uploaded file",
      "Switch templates instantly with no data loss",
    ],
  },
  {
    step: "02",
    icon: <AutoFixHighOutlinedIcon sx={{ fontSize: "28px", color: "#2a5c45" }} />,
    titleKey: "Get AI Analysis & Feedback",
    descriptionKey:
      "Our AI scans your CV for ATS compatibility, grammar issues, keyword gaps, and gives you a detailed improvement score.",
    badges: ["ATS Score", "Grammar Check", "Keywords", "Readability"],
    detailPoints: [
      "Instant ATS compatibility score out of 100",
      "Highlighted grammar issues with one-click fixes",
      "Missing keyword suggestions tailored to the job",
    ],
  },
  {
    step: "03",
    icon: <RocketLaunchOutlinedIcon sx={{ fontSize: "28px", color: "#2a5c45" }} />,
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

export const TESTIMONIALS_DATA = [
  {
    name: "Sarah M.",
    role: "Software Engineer",
    company: "Google",
    avatar: "S",
    rating: 5,
    text: "Resume-IQ transformed my job search. The AI analysis pointed out exactly what recruiters look for and helped me land interviews at top tech companies.",
  },
  {
    name: "James K.",
    role: "Product Manager",
    company: "Microsoft",
    avatar: "J",
    rating: 5,
    text: "The CV builder is incredibly intuitive. I went from a blank page to a polished, ATS-optimized resume in under 30 minutes. Got hired within 3 weeks!",
  },
  {
    name: "Amira B.",
    role: "Data Scientist",
    company: "Meta",
    avatar: "A",
    rating: 5,
    text: "The grammar checker and smart feedback caught issues I'd been overlooking for years. My application rate jumped by 60% after using Resume-IQ.",
  },
];

export const STATS_DATA = [
  { value: "50K+", labelKey: "CVs Created" },
  { value: "92%", labelKey: "Interview Rate" },
  { value: "4.9★", labelKey: "User Rating" },
  { value: "120+", labelKey: "Countries" },
];
