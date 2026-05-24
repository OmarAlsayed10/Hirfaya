import { useSelector } from 'react-redux';
import { useTemplate } from '../../../hooks/useTemplate';
import ClassicCV from '../../../templates/classic-cv';
import LinkedInCV from '../../../templates/linkedin-cv';
import ModernCV from '../../../templates/modern-cv';
import type { RootState } from '../../../redux/store/store';

const Preview = () => {
  const formData = useSelector((state: RootState) => state.cvBuilder?.formData || {});
  const { choosenTemp } = useTemplate();

  const personalInfo = formData.personalInfo || {};
  const name = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`;
  const email = personalInfo.email || '';
  const phone = [personalInfo.phoneCode, personalInfo.phone].filter(Boolean).join(' ');
  const location = [personalInfo.town, personalInfo.city, personalInfo.country].filter(Boolean).join(', ');
  const professionalTitle = personalInfo.professionalTitle || '';
  const summary = personalInfo.ProfessionalSummary || '';

  const skills = (formData.skills?.skills || []).join(', ');
  const languages = formData.skills?.languages
    ? formData.skills.languages.split(',').map((l: string) => ({ name: l.trim() }))
    : [];
  const certifications = formData.skills?.certifications
    ? formData.skills.certifications.split(',').map((c: string) => ({ name: c.trim() }))
    : [];

  const experience = (formData.experience || []).map((exp: Record<string, string>) => ({
    role: exp.jobTitle || '',
    company: exp.company || '',
    startDate: exp.startDate || '',
    endDate: exp.endDate || '',
    years: `${exp.startDate || ''} - ${exp.endDate || ''}`,
    location: exp.location || '',
    description: exp.description || '',
  }));

  const education = (formData.education || []).map((edu: Record<string, string>) => ({
    institution: edu.institution || '',
    degree: edu.degree || '',
    startYear: edu.startYear || '',
    endYear: edu.endYear || '',
    location: edu.location || '',
    description: edu.description || '',
  }));

  const commonProps = {
    name,
    email,
    phone,
    location,
    professionalTitle,
    summary,
    skills,
    languages,
    certifications,
    experience,
    education,
  };

  return (
    <>
      {choosenTemp === 'classic-cv' && <ClassicCV {...commonProps} />}
      {choosenTemp === 'linkedin-cv' && <LinkedInCV {...commonProps} />}
      {choosenTemp === 'modern-cv' && <ModernCV {...commonProps} />}
    </>
  );
};

export default Preview;
