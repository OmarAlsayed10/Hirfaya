import { Box, Typography } from "@mui/material";
import FormattedText from "../components/ui/FormattedText";

const LinkedInCV = ({
  name,
  email,
  phone,
  location,
  professionalTitle,
  linkedin,
  github,
  portfolio,
  summary,
  experience = [],
  education = [],
  skills,
  languages = [],
  certifications = [],
  sectionOrder = ['personal', 'projects', 'experience', 'education', 'skills', 'languages', 'certifications'],
}) => {
  return (
    <Box sx={{
      backgroundColor: "#f4f7fb",
      display: "flex",
      justifyContent: "center",
      padding: "40px 20px",
      minHeight: "100vh",
    }}>
      <Box sx={{
        width: "100%",
        backgroundColor: "#fff",
        padding: "40px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        borderRadius: "12px",
        fontFamily: `"Segoe UI", Tahoma, Geneva, Verdana, sans-serif`,
        color: "#333",
        lineHeight: 1.6,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box sx={{
          borderBottom: "2px solid #0056b3",
          paddingBottom: "16px",
          marginBottom: "30px",
          textAlign: "center",
        }}>
          <Typography variant="h1" sx={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#0056b3",
          }}>{name}</Typography>
          <Typography variant="h2" sx={{
            fontSize: "24px",
            fontWeight: "500",
            color: "#0077cc",
            marginTop: "4px",
          }}>{professionalTitle}</Typography>
          <Box sx={{
            fontSize: "15px",
            color: "#555",
            marginTop: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap"
          }}>
            <Box component="span">
              <Box component="span" sx={{ fontWeight: 600, color: "#333", mr: 0.5 }}>Email:</Box> 
              {email}
            </Box> 
            <Box component="span" sx={{ color: "#ccc" }}>|</Box> 
            <Box component="span">
              <Box component="span" sx={{ fontWeight: 600, color: "#333", mr: 0.5 }}>Phone:</Box> 
              {phone}
            </Box> 
            <Box component="span" sx={{ color: "#ccc" }}>|</Box> 
            <Box component="span">
              <Box component="span" sx={{ fontWeight: 600, color: "#333", mr: 0.5 }}>Location:</Box> 
              {location}
            </Box>
            {linkedin && (
              <>
                <Box component="span" sx={{ color: "#ccc" }}>|</Box>
                <Box component="span">
                  <Box component="span" sx={{ fontWeight: 600, color: "#333", mr: 0.5 }}>LinkedIn:</Box>
                  {linkedin}
                </Box>
              </>
            )}
            {github && (
              <>
                <Box component="span" sx={{ color: "#ccc" }}>|</Box>
                <Box component="span">
                  <Box component="span" sx={{ fontWeight: 600, color: "#333", mr: 0.5 }}>GitHub:</Box>
                  {github}
                </Box>
              </>
            )}
            {portfolio && (
              <>
                <Box component="span" sx={{ color: "#ccc" }}>|</Box>
                <Box component="span">
                  <Box component="span" sx={{ fontWeight: 600, color: "#333", mr: 0.5 }}>Portfolio:</Box>
                  {portfolio}
                </Box>
              </>
            )}
          </Box>
        </Box>

        <Box data-cv-section="personal" sx={{ marginBottom: "30px", order: sectionOrder.indexOf('personal') }}>
          <Typography draggable data-cv-drag-handle variant="h3" sx={{
            fontSize: "20px",
            marginBottom: "10px",
            color: "#004080",
            borderBottom: "1px solid #ccc",
            paddingBottom: "4px",
          }}>Summary</Typography>
          <Typography data-cv-field="personalInfo.ProfessionalSummary" sx={{
            fontSize: "14px",
            marginTop: "6px",
            color: "#444",
          }}><FormattedText text={summary} /></Typography>
        </Box>

        <Box data-cv-section="experience" sx={{ marginBottom: "30px", order: sectionOrder.indexOf('experience') }}>
          <Typography draggable data-cv-drag-handle variant="h3" sx={{
            fontSize: "20px",
            marginBottom: "10px",
            color: "#004080",
            borderBottom: "1px solid #ccc",
            paddingBottom: "4px",
          }}>Experience</Typography>
          <Box component="ul" sx={{ listStyle: "none", paddingLeft: "0" }}>
            {experience.map((item, index) => (
              <Box component="li" key={index} sx={{ marginBottom: "16px" }}>
                <Typography sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#222",
                }}>{item.role}</Typography>
                <Typography sx={{
                  fontSize: "14px",
                  color: "#666",
                }}>
                  {item.company} — {item.years}
                </Typography>
                <Typography data-cv-field={`experience.${index}.description`} sx={{
                  fontSize: "14px",
                  marginTop: "6px",
                  color: "#444",
                }}><FormattedText text={item.description} /></Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box data-cv-section="education" sx={{ marginBottom: "30px", order: sectionOrder.indexOf('education') }}>
          <Typography draggable data-cv-drag-handle variant="h3" sx={{
            fontSize: "20px",
            marginBottom: "10px",
            color: "#004080",
            borderBottom: "1px solid #ccc",
            paddingBottom: "4px",
          }}>Education</Typography>
          <Box component="ul" sx={{ listStyle: "none", paddingLeft: "0" }}>
            {education.map((edu, index) => (
              <Box component="li" key={index} sx={{ marginBottom: "16px" }}>
                <Typography sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#222",
                }}>{edu.institution}</Typography>
                <Typography sx={{
                  fontSize: "14px",
                  color: "#666",
                }}>
                  {edu.degree} ({edu.startYear} - {edu.endYear})
                </Typography>
                <Typography sx={{
                  fontSize: "14px",
                  color: "#666",
                }}>{edu.location}</Typography>
                <Typography data-cv-field={`education.${index}.description`} sx={{
                  fontSize: "14px",
                  marginTop: "6px",
                  color: "#444",
                }}><FormattedText text={edu.description} /></Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box data-cv-section="skills" sx={{ marginBottom: "30px", order: sectionOrder.indexOf('skills') }}>
          <Typography draggable data-cv-drag-handle variant="h3" sx={{
            fontSize: "20px",
            marginBottom: "10px",
            color: "#004080",
            borderBottom: "1px solid #ccc",
            paddingBottom: "4px",
          }}>Skills</Typography>
          <Box sx={{
            marginTop: "10px",
            fontSize: "14px",
            backgroundColor: "#eaf4ff",
            padding: "10px",
            borderRadius: "6px",
            lineHeight: 1.8,
          }}>{skills}</Box>
        </Box>

        <Box data-cv-section="languages" sx={{ marginBottom: "30px", order: sectionOrder.indexOf('languages') }}>
          <Typography draggable data-cv-drag-handle variant="h3" sx={{
            fontSize: "20px",
            marginBottom: "10px",
            color: "#004080",
            borderBottom: "1px solid #ccc",
            paddingBottom: "4px",
          }}>Languages</Typography>
          <Box component="ul" sx={{ listStyle: "none", paddingLeft: "0" }}>
            {languages.map((lang, index) => (
              <Box component="li" key={index}>
                {lang.name} 
              </Box>
            ))}
          </Box>
        </Box>

        <Box data-cv-section="certifications" sx={{ marginBottom: "30px", order: sectionOrder.indexOf('certifications') }}>
          <Typography draggable data-cv-drag-handle variant="h3" sx={{
            fontSize: "20px",
            marginBottom: "10px",
            color: "#004080",
            borderBottom: "1px solid #ccc",
            paddingBottom: "4px",
          }}>Certifications</Typography>
          <Box component="ul" sx={{ listStyle: "none", paddingLeft: "0" }}>
            {certifications.map((cert, index) => (
              <Box component="li" key={index}>
                {cert.name} 
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LinkedInCV;
