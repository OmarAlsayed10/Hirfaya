import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";

export const FOOTER_LINKS_DATA = {
  Product: [
    { label: "CV Builder", to: "/getStart" },
    { label: "CV Analyzer", to: "/cv-analysis" },
    { label: "Templates", to: "/templates" },
    { label: "Pricing", to: "/payment-check" },
  ],
  Resources: [
    { label: "Blog", to: "/blogs" },
    { label: "CV Tips", to: "/blogs" },
    { label: "Help Center", to: "/help" },
    { label: "Grammar Check", to: "/grammar-check" },
  ],
  Company: [
    { label: "About Us", to: "/" },
    { label: "Careers", to: "/" },
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
  ],
};

export const FOOTER_SOCIAL_LINKS = [
  {
    icon: <LinkedInIcon fontSize="small" />,
    href: "https://www.linkedin.com/in/omaralsayed10",
  },
  {
    icon: <GitHubIcon fontSize="small" />,
    href: "https://github.com/OmarAlsayed10",
  },
];
