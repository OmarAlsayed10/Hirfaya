import { useSelector } from 'react-redux';
import { useTemplate } from '../../../hooks/useTemplate';
import ClassicCV from '../../../templates/classic-cv';
import LinkedInCV from '../../../templates/linkedin-cv';
import ModernCV from '../../../templates/modern-cv';
import JakeCV from '../../../templates/jake-cv';
import HarvardCV from '../../../templates/harvard-cv';
import type { RootState } from '../../../redux/store/store';

const Preview = () => {
  const formData = useSelector((state: RootState) => state.cvBuilder.formData);
  const pageCount = useSelector((state: RootState) => state.cvBuilder.pageCount);
  const sectionOrder = useSelector((state: RootState) => state.cvBuilder.sectionOrder);
  const { choosenTemp } = useTemplate();

  const personalInfo = formData.personalInfo;
  const name = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`;
  const email = personalInfo.email || '';
  const phone = [personalInfo.phoneCode, personalInfo.phone].filter(Boolean).join(' ');
  const location = [personalInfo.city, personalInfo.country].filter(Boolean).join(', ');
  const professionalTitle = personalInfo.professionalTitle || '';
  const summary = personalInfo.ProfessionalSummary || '';
  const linkedin = personalInfo.linkedin || '';
  const github = personalInfo.github || '';
  const portfolio = personalInfo.portfolio || '';

  const skills = formData.skills.skills.join(', ');
  const languages = formData.skills.languages
    ? formData.skills.languages.split(',').map((l) => ({ name: l.trim() }))
    : [];
  const certifications = formData.skills.certifications
    ? formData.skills.certifications.split(',').map((c) => ({ name: c.trim() }))
    : [];

  const experience = formData.experience.map((exp) => ({
    role: exp.jobTitle || '',
    company: exp.company || '',
    startDate: exp.startDate || '',
    endDate: exp.endDate || '',
    years: `${exp.startDate || ''} - ${exp.endDate || ''}`,
    location: exp.location || '',
    description: exp.description || '',
  }));

  const education = formData.education.map((edu) => ({
    institution: edu.institution || '',
    degree: edu.degree || '',
    startYear: edu.startYear || '',
    endYear: edu.endYear || '',
    location: edu.location || '',
    description: edu.description || '',
  }));

  const projects = formData.projects.map((proj) => ({
    name: proj.name || '',
    technologies: proj.technologies || '',
    demoUrl: proj.demoUrl || '',
    githubUrl: proj.githubUrl || '',
    description: proj.description || '',
  }));

  const commonProps = {
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
    projects,
    sectionOrder,
  };

  return (
    <>
      {choosenTemp === 'jake-cv' && <JakeCV {...commonProps} pageCount={pageCount} />}
      {choosenTemp === 'harvard-cv' && <HarvardCV {...commonProps} pageCount={pageCount} />}
      {choosenTemp === 'classic-cv' && <ClassicCV {...commonProps} pageCount={pageCount} />}
      {choosenTemp === 'linkedin-cv' && <LinkedInCV {...commonProps} pageCount={pageCount} />}
      {choosenTemp === 'modern-cv' && <ModernCV {...commonProps} pageCount={pageCount} />}
    </>
  );
};

export default Preview;

