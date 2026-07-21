import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import FormattedText from "../components/ui/FormattedText";

const PAGE_HEIGHT = 1123;
const PAGE_WIDTH = 794;

const ModernCV = ({
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
  languages = [],
  certifications = [],
  experience = [],
  education = [],
  pageCount = 1,
  sectionOrder = ['personal', 'projects', 'experience', 'education', 'skills', 'languages', 'certifications'],
}: any) => {
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState(1);

  const fullContent = (
    <Box sx={{
      display: 'flex',
      width: '100%',
      backgroundColor: '#ffffff',
      overflow: 'visible',
      minHeight: `${PAGE_HEIGHT}px`,
    }}>
      <Box sx={{
        width: '30%',
        backgroundColor: '#1e293b',
        color: '#ffffff',
        padding: '40px 25px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Typography variant="h1" sx={{ fontSize: '22px', marginBottom: '20px' }}>{name}</Typography>
        <Typography><Box component="strong">{t('Title:')}</Box> {professionalTitle}</Typography>
        <Typography><Box component="strong">{t('Email:')}</Box> {email}</Typography>
        <Typography><Box component="strong">{t('Phone:')}</Box> {phone}</Typography>
        <Typography><Box component="strong">{t('Location:')}</Box> {location}</Typography>
        {linkedin && <Typography><Box component="strong">LinkedIn:</Box> {linkedin}</Typography>}
        {github && <Typography><Box component="strong">GitHub:</Box> {github}</Typography>}
        {portfolio && <Typography><Box component="strong">Portfolio:</Box> {portfolio}</Typography>}

        <Box data-cv-section="skills" sx={{ order: sectionOrder.indexOf('skills') }}>
          <Typography draggable data-cv-drag-handle variant="h2" sx={{ fontSize: '18px', marginTop: '30px', marginBottom: '10px', borderBottom: '1px solid #ffffff', paddingBottom: '5px' }}>{t('Skills')}</Typography>
          <Typography>{skills}</Typography>
        </Box>
        <Box data-cv-section="languages" sx={{ order: sectionOrder.indexOf('languages') }}>
          <Typography draggable data-cv-drag-handle variant="h2" sx={{ fontSize: '18px', marginTop: '30px', marginBottom: '10px', borderBottom: '1px solid #ffffff', paddingBottom: '5px' }}>{t('Languages')}</Typography>
          <Typography>{languages.map((language: any) => language.name).join(", ")}</Typography>
        </Box>
        <Box data-cv-section="certifications" sx={{ order: sectionOrder.indexOf('certifications') }}>
          <Typography draggable data-cv-drag-handle variant="h2" sx={{ fontSize: '18px', marginTop: '30px', marginBottom: '10px', borderBottom: '1px solid #ffffff', paddingBottom: '5px' }}>{t('Certifications')}</Typography>
          <Typography>{certifications.map((certification: any) => certification.name).join(", ")}</Typography>
        </Box>
      </Box>

      <Box sx={{
        width: '70%',
        padding: '40px',
        color: '#333',
        fontFamily: `"Segoe UI", sans-serif`,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box data-cv-section="personal" sx={{ marginBottom: '30px', order: sectionOrder.indexOf('personal') }}>
          <Typography draggable data-cv-drag-handle variant="h2" sx={{ fontSize: '22px', borderBottom: '2px solid #1e293b', paddingBottom: '5px', marginBottom: '10px' }}>{t('Professional Summary')}</Typography>
          <Typography data-cv-field="personalInfo.ProfessionalSummary"><FormattedText text={summary} /></Typography>
        </Box>

        <Box data-cv-section="experience" sx={{ marginBottom: '30px', order: sectionOrder.indexOf('experience') }}>
          <Typography draggable data-cv-drag-handle variant="h2" sx={{ fontSize: '22px', borderBottom: '2px solid #1e293b', paddingBottom: '5px', marginBottom: '10px' }}>{t('Experience')}</Typography>
          {experience.map((exp: any, index: number) => (
            <Box key={index} sx={{ marginBottom: '20px' }}>
              <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 'bold' }}>{exp.role} at {exp.company}</Typography>
              <Typography><Box component="strong">{t('Location:')}</Box> {exp.location}</Typography>
              <Typography><Box component="strong">From:</Box> {exp.startDate} <Box component="strong">To:</Box> {exp.endDate}</Typography>
              <Typography data-cv-field={`experience.${index}.description`}><FormattedText text={exp.description} /></Typography>
            </Box>
          ))}
        </Box>

        <Box data-cv-section="education" sx={{ marginBottom: '30px', order: sectionOrder.indexOf('education') }}>
          <Typography draggable data-cv-drag-handle variant="h2" sx={{ fontSize: '22px', borderBottom: '2px solid #1e293b', paddingBottom: '5px', marginBottom: '10px' }}>{t('Education')}</Typography>
          {education.map((edu: any, index: number) => (
            <Box key={index} sx={{ marginBottom: '20px' }}>
              <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 'bold' }}>{edu.degree} - {edu.institution}</Typography>
              <Typography><Box component="strong">{t('Location:')}</Box> {edu.location}</Typography>
              <Typography><Box component="strong">{t('Years:')}</Box> {edu.startYear} - {edu.endYear}</Typography>
              <Typography data-cv-field={`education.${index}.description`}><FormattedText text={edu.description} /></Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );

  const pageContainerStyle = {
    backgroundColor: "#fff",
    width: `${PAGE_WIDTH}px`,
    height: `${PAGE_HEIGHT}px`,
    border: "1px solid rgba(26,26,24,0.1)",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
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
                backgroundColor: activePage === page ? "#1e293b" : "transparent",
                color: activePage === page ? "#fff" : "#555",
                boxShadow: activePage === page ? "0 4px 15px rgba(0, 0, 0, 0.15)" : "none",
                "&:hover": {
                  backgroundColor: activePage === page ? "#334155" : "rgba(0, 0, 0, 0.05)",
                  color: activePage === page ? "#fff" : "#1e293b",
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
    <Box sx={{ backgroundColor: "#f5f4ef", p: { xs: 2, md: 4 }, display: "flex", justifyContent: "center" }}>
      <Box sx={pageContainerStyle}>
        <Box sx={{ width: "100%" }}>
          {fullContent}
        </Box>
      </Box>
    </Box>
  );
};

export default ModernCV;
