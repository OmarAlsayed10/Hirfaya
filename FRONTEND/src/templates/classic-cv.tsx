import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import FormattedText from "../components/ui/FormattedText";

const PAGE_HEIGHT = 1123;
const PAGE_WIDTH = 794;

const ClassicCV = ({
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

  const fullContent = (
    <Box sx={{
      backgroundColor: "#ffffff",
      padding: { xs: 3, sm: 5 },
      width: "100%",
      fontFamily: '"DM Sans", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      lineHeight: 1.6,
      boxSizing: "border-box",
    }}>
      <Typography variant="h1" sx={{ fontFamily: '"DM Serif Display", serif', fontSize: '2.5rem', color: "#1a1a18", mb: 0.5 }}>{name}</Typography>
      <Typography sx={{ color: "#6b6b66", fontSize: "0.95rem" }}><Box component="span" sx={{ color: "#1a1a18", fontWeight: 500 }}>{t('Email:')} </Box> {email}</Typography>
      <Typography sx={{ color: "#6b6b66", fontSize: "0.95rem" }}><Box component="span" sx={{ color: "#1a1a18", fontWeight: 500 }}>{t('Phone:')} </Box> {phone}</Typography>
      <Typography sx={{ color: "#6b6b66", fontSize: "0.95rem" }}><Box component="span" sx={{ color: "#1a1a18", fontWeight: 500 }}>{t('Location:')} </Box> {location}</Typography>
      <Typography sx={{ color: "#6b6b66", fontSize: "0.95rem" }}><Box component="span" sx={{ color: "#1a1a18", fontWeight: 500 }}>{t('Title:')} </Box> {professionalTitle}</Typography>
      {linkedin && <Typography sx={{ color: "#6b6b66", fontSize: "0.95rem" }}><Box component="span" sx={{ color: "#1a1a18", fontWeight: 500 }}>LinkedIn: </Box> {linkedin}</Typography>}
      {github && <Typography sx={{ color: "#6b6b66", fontSize: "0.95rem" }}><Box component="span" sx={{ color: "#1a1a18", fontWeight: 500 }}>GitHub: </Box> {github}</Typography>}
      {portfolio && <Typography sx={{ color: "#6b6b66", fontSize: "0.95rem" }}><Box component="span" sx={{ color: "#1a1a18", fontWeight: 500 }}>Portfolio: </Box> {portfolio}</Typography>}
      <Box sx={{ mb: 2 }} />

      <Box sx={{ borderBottom: "1px solid rgba(26,26,24,0.1)", mb: 3 }}></Box>

      {summary && (
        <Box data-cv-section="personal" sx={{ marginBottom: "25px", order: sectionOrder.indexOf('personal') }}>
          <Typography draggable data-cv-drag-handle variant="h2" sx={{ color: "#6b6b66", fontSize: '0.85rem', fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>{t('Professional Summary')}</Typography>
          <Typography data-cv-field="personalInfo.ProfessionalSummary" sx={{ color: "#1a1a18", fontSize: "0.95rem" }}><FormattedText text={summary} /></Typography>
        </Box>
      )}

      {experience && experience.length > 0 && (
        <Box data-cv-section="experience" sx={{ marginBottom: "25px", order: sectionOrder.indexOf('experience') }}>
          <Typography draggable data-cv-drag-handle variant="h2" sx={{ color: "#6b6b66", fontSize: '0.85rem', fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1.5 }}>{t('Experience')}</Typography>
          <Box component="ul" sx={{ paddingLeft: "16px", m: 0 }}>
            {experience.map((exp: any, index: number) => (
              <Box component="li" key={index} sx={{ marginBottom: '12px', color: "#6b6b66" }}>
                <Typography sx={{ color: "#1a1a18" }}><Box component="span" sx={{ fontWeight: 500 }}>{exp.role}</Box> at {exp.company}</Typography>
                <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}>{exp.years} | {exp.location}</Typography>
                <Typography data-cv-field={`experience.${index}.description`} sx={{ color: "#1a1a18", fontSize: "0.95rem" }}><FormattedText text={exp.description} /></Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {projects && projects.length > 0 && (
        <Box data-cv-section="projects" sx={{ marginBottom: "25px", order: sectionOrder.indexOf('projects') }}>
          <Typography draggable data-cv-drag-handle variant="h2" sx={{ color: "#6b6b66", fontSize: '0.85rem', fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1.5 }}>{t('Projects')}</Typography>
          <Box component="ul" sx={{ paddingLeft: "16px", m: 0 }}>
            {projects.map((proj: any, index: number) => (
              <Box component="li" key={index} sx={{ marginBottom: '12px', color: "#6b6b66" }}>
                <Typography sx={{ color: "#1a1a18" }}>
                  <Box component="span" sx={{ fontWeight: 500 }}>{proj.name}</Box>
                  {proj.technologies ? ` — ${proj.technologies}` : ""}
                </Typography>
                {(proj.demoUrl || proj.githubUrl) && (
                  <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}>
                    {proj.demoUrl && <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer" style={{ marginRight: 8, color: '#007acc', textDecoration: 'none' }}>Demo</a>}
                    {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007acc', textDecoration: 'none' }}>GitHub</a>}
                  </Typography>
                )}
                <Typography data-cv-field={`projects.${index}.description`} sx={{ color: "#1a1a18", fontSize: "0.95rem" }}><FormattedText text={proj.description} /></Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {education && education.length > 0 && (
        <Box data-cv-section="education" sx={{ marginBottom: "25px", order: sectionOrder.indexOf('education') }}>
          <Typography draggable data-cv-drag-handle variant="h2" sx={{ color: "#6b6b66", fontSize: '0.85rem', fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1.5 }}>{t('Education')}</Typography>
          <Box component="ul" sx={{ paddingLeft: "16px", m: 0 }}>
            {education.map((edu: any, index: number) => (
              <Box component="li" key={index} sx={{ marginBottom: '12px', color: "#6b6b66" }}>
                <Typography sx={{ color: "#1a1a18" }}><Box component="strong" sx={{ fontWeight: 500 }}>{edu.institution}</Box> — {edu.degree}</Typography>
                <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}>{edu.startYear} to {edu.endYear} | {edu.location}</Typography>
                <Typography data-cv-field={`education.${index}.description`} sx={{ color: "#1a1a18", fontSize: "0.95rem" }}><FormattedText text={edu.description} /></Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {skills && (
        <Box data-cv-section="skills" sx={{ marginBottom: "25px", order: sectionOrder.indexOf('skills') }}>
          <Typography draggable data-cv-drag-handle variant="h2" sx={{ color: "#6b6b66", fontSize: '0.85rem', fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>{t('Skills')}</Typography>
          <Typography sx={{ color: "#1a1a18", fontSize: "0.95rem" }}>{skills}</Typography>
        </Box>
      )}

      {languages && languages.length > 0 && (
        <Box data-cv-section="languages" sx={{ marginBottom: "25px", order: sectionOrder.indexOf('languages') }}>
          <Typography draggable data-cv-drag-handle variant="h2" sx={{ color: "#6b6b66", fontSize: '0.85rem', fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>{t('Languages')}</Typography>
          <Box component="ul" sx={{ paddingLeft: "16px", m: 0, color: "#1a1a18" }}>
            {languages.map((lang: any, index: number) => (
              <Box component="li" key={index} sx={{ fontSize: "0.95rem" }}>{lang.name}</Box>
            ))}
          </Box>
        </Box>
      )}

      {certifications && certifications.length > 0 && (
        <Box data-cv-section="certifications" sx={{ marginBottom: "25px", order: sectionOrder.indexOf('certifications') }}>
          <Typography draggable data-cv-drag-handle variant="h2" sx={{ color: "#6b6b66", fontSize: '0.85rem', fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>{t('Certifications')}</Typography>
          <Box component="ul" sx={{ paddingLeft: "16px", m: 0, color: "#1a1a18" }}>
            {certifications.map((cert: any, index: number) => (
              <Box component="li" key={index} sx={{ fontSize: "0.95rem" }}>{cert.name}</Box>
            ))}
          </Box>
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
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    boxSizing: "border-box" as const,
    position: "relative" as const,
    overflow: "hidden",
  };

  if (pageCount > 1) {
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

    return (
      <Box sx={{ backgroundColor: "#f5f4ef", p: { xs: 2, md: 4 }, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
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

  return (
    <Box sx={{
      backgroundColor: "#f5f4ef",
      padding: { xs: 2, md: 4 },
      display: "flex",
      justifyContent: "center",
    }}>
      <Box sx={pageContainerStyle}>
        <Box sx={{ width: "100%" }}>
          {fullContent}
        </Box>
      </Box>
    </Box>
  );
};

export default ClassicCV;
