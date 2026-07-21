import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import FormattedText from "../components/ui/FormattedText";

const PAGE_HEIGHT = 1123; // exact A4 height at 96 DPI
const PAGE_WIDTH = 794;   // exact A4 width at 96 DPI

const HEADING = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.8rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "#1a1a18",
  borderBottom: "1.5px solid #1a1a18",
  pb: 0.3,
  mt: 2.5,
  mb: 1,
};

function Bullets({ text, fieldPath }: { text: string; fieldPath: string }) {
  if (!text) return null;
  const lines = text.split("\n").map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  if (lines.length <= 1) {
    return <Typography data-cv-field={fieldPath} sx={{ fontSize: "0.9rem", color: "#333", lineHeight: 1.5 }}><FormattedText text={text} /></Typography>;
  }
  return (
    <Box component="ul" data-cv-field={fieldPath} sx={{ pl: 2.2, m: 0 }}>
      {lines.map((l, i) => (
        <Box component="li" key={i} sx={{ fontSize: "0.9rem", color: "#333", lineHeight: 1.5, mb: 0.3 }}><FormattedText text={l} /></Box>
      ))}
    </Box>
  );
}

const JakeCV = ({
  name,
  email,
  phone,
  location,
  professionalTitle,
  linkedin,
  github,
  portfolio,
  summary,
  skills,
  languages,
  certifications,
  experience,
  education,
  projects = [],
  pageCount = 1,
  sectionOrder = ['personal', 'projects', 'experience', 'education', 'skills', 'languages', 'certifications'],
}: any) => {
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState(1);
  const contact = [phone, email, linkedin, github, portfolio, location, professionalTitle].filter(Boolean).join("  |  ");

  const fullContent = (
    <Box sx={{ p: { xs: 4, sm: 5 }, boxSizing: "border-box", display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 1 }}>
        <Typography sx={{ fontSize: "1.9rem", fontWeight: 700, color: "#1a1a18", lineHeight: 1.1 }}>{name || "Your Name"}</Typography>
        {contact && <Typography sx={{ fontSize: "0.82rem", color: "#555", mt: 0.6 }}>{contact}</Typography>}
      </Box>

      {/* Summary */}
      {summary && (
        <Box data-cv-section="personal" sx={{ order: sectionOrder.indexOf('personal') }}>
          <Typography draggable data-cv-drag-handle sx={HEADING}>{t('Summary')}</Typography>
          <Typography data-cv-field="personalInfo.ProfessionalSummary" sx={{ fontSize: "0.9rem", color: "#333", lineHeight: 1.5 }}><FormattedText text={summary} /></Typography>
        </Box>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <Box data-cv-section="experience" sx={{ order: sectionOrder.indexOf('experience') }}>
          <Typography draggable data-cv-drag-handle sx={HEADING}>{t('Experience')}</Typography>
          {experience.map((exp: any, i: number) => (
            <Box key={i} sx={{ mb: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a1a18" }}>
                  {exp.role}{exp.company ? ` — ${exp.company}` : ""}
                </Typography>
                <Typography sx={{ fontSize: "0.82rem", color: "#555", fontStyle: "italic" }}>{exp.years}</Typography>
              </Box>
              {exp.location && <Typography sx={{ fontSize: "0.8rem", color: "#777", mb: 0.3 }}>{exp.location}</Typography>}
              <Bullets text={exp.description} fieldPath={`experience.${i}.description`} />
            </Box>
          ))}
        </Box>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <Box data-cv-section="projects" sx={{ order: sectionOrder.indexOf('projects') }}>
          <Typography draggable data-cv-drag-handle sx={HEADING}>{t('Projects')}</Typography>
          {projects.map((proj: any, i: number) => (
            <Box key={i} sx={{ mb: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a1a18" }}>
                  {proj.name}{proj.technologies ? ` — ${proj.technologies}` : ""}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {proj.demoUrl && (
                    <Typography component="a" href={proj.demoUrl} target="_blank" rel="noopener noreferrer" sx={{ fontSize: "0.8rem", color: "#007acc", textDecoration: "none" }}>
                      Demo
                    </Typography>
                  )}
                  {proj.githubUrl && (
                    <Typography component="a" href={proj.githubUrl} target="_blank" rel="noopener noreferrer" sx={{ fontSize: "0.8rem", color: "#007acc", textDecoration: "none" }}>
                      GitHub
                    </Typography>
                  )}
                </Box>
              </Box>
              <Bullets text={proj.description} fieldPath={`projects.${i}.description`} />
            </Box>
          ))}
        </Box>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <Box data-cv-section="education" sx={{ order: sectionOrder.indexOf('education') }}>
          <Typography draggable data-cv-drag-handle sx={HEADING}>{t('Education')}</Typography>
          {education.map((edu: any, i: number) => (
            <Box key={i} sx={{ mb: 1.2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a1a18" }}>
                  {edu.degree}{edu.institution ? ` — ${edu.institution}` : ""}
                </Typography>
                <Typography sx={{ fontSize: "0.82rem", color: "#555", fontStyle: "italic" }}>
                  {[edu.startYear, edu.endYear].filter(Boolean).join(" – ")}
                </Typography>
              </Box>
              {edu.location && <Typography sx={{ fontSize: "0.8rem", color: "#777" }}>{edu.location}</Typography>}
              <Bullets text={edu.description} fieldPath={`education.${i}.description`} />
            </Box>
          ))}
        </Box>
      )}

      {/* Skills */}
      {skills && (
        <Box data-cv-section="skills" sx={{ order: sectionOrder.indexOf('skills') }}>
          <Typography draggable data-cv-drag-handle sx={HEADING}>{t('Skills')}</Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "#333", lineHeight: 1.5 }}>{skills}</Typography>
        </Box>
      )}

      {languages && languages.length > 0 && (
        <Box data-cv-section="languages" sx={{ order: sectionOrder.indexOf('languages') }}>
          <Typography draggable data-cv-drag-handle sx={HEADING}>{t('Languages')}</Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "#333" }}>{languages.map((l: any) => l.name).join(", ")}</Typography>
        </Box>
      )}

      {certifications && certifications.length > 0 && (
        <Box data-cv-section="certifications" sx={{ order: sectionOrder.indexOf('certifications') }}>
          <Typography draggable data-cv-drag-handle sx={HEADING}>{t('Certifications')}</Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "#333" }}>{certifications.map((c: any) => c.name).join(", ")}</Typography>
        </Box>
      )}
    </Box>
  );

  const pageContainerStyle = {
    backgroundColor: "#fff",
    width: `${PAGE_WIDTH}px`,
    height: `${PAGE_HEIGHT}px`,
    fontFamily: '"DM Sans", sans-serif',
    border: "1px solid rgba(26,26,24,0.1)",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    boxSizing: "border-box" as const,
    position: "relative" as const,
    overflow: "hidden",
  };

  // Multi-page: render all content in a single flow, shift by page offset
  if (pageCount > 1) {
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

    return (
      <Box sx={{ backgroundColor: "#f5f4ef", p: { xs: 2, md: 4 }, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        {/* Page pagination tab bar */}
        <Box sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          mb: 4,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          p: "8px 16px",
          borderRadius: "40px",
          border: "1.5px solid rgba(0, 0, 0, 0.1)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)"
        }}>
          <Typography sx={{ fontSize: "0.85rem", color: "#666", fontWeight: 800, mr: 1, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {t('Document View')}:
          </Typography>
          {pages.map((page) => (
            <Button
              key={page}
              onClick={() => setActivePage(page)}
              variant="text"
              sx={{
                borderRadius: "30px",
                textTransform: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                px: 3,
                py: 1,
                minWidth: 120,
                backgroundColor: activePage === page ? "#1a1a18" : "transparent",
                color: activePage === page ? "#fff" : "#555",
                boxShadow: activePage === page ? "0 4px 15px rgba(0, 0, 0, 0.15)" : "none",
                "&:hover": {
                  backgroundColor: activePage === page ? "#333" : "rgba(0, 0, 0, 0.05)",
                  color: activePage === page ? "#fff" : "#1a1a18",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, lineHeight: 1.2 }}>
                {t("Page")} {page}
              </Typography>
              <Typography sx={{ fontSize: "0.68rem", opacity: activePage === page ? 0.9 : 0.6, fontWeight: 500, mt: 0.2 }}>
                {page} / {pageCount}
              </Typography>
            </Button>
          ))}
        </Box>

        {/* Page container: shift content up by (activePage - 1) * PAGE_HEIGHT */}
        <Box sx={pageContainerStyle}>
          <Box sx={{
            width: "100%",
            transform: `translateY(-${(activePage - 1) * PAGE_HEIGHT}px)`,
            transition: "transform 0.3s ease",
          }}>
            {fullContent}
          </Box>
        </Box>
      </Box>
    );
  }

  // Single page
  return (
    <Box sx={{ backgroundColor: "#f5f4ef", p: { xs: 2, md: 4 }, display: "flex", justifyContent: "center" }}>
      <Box sx={pageContainerStyle}>
        <Box sx={{ width: "100%" }}>
          {fullContent}
        </Box>
      </Box>
    </Box>
  );
};

export default JakeCV;
