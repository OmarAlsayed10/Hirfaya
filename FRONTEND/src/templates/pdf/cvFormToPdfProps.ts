import type { BuilderFormData } from '../../redux/store/slices/cvBuilderSlice';

export function cvFormToPdfProps(formData: BuilderFormData) {
  const p = formData.personalInfo;
  return {
    name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
    email: p.email || '',
    phone: [p.phoneCode, p.phone].filter(Boolean).join(' '),
    location: [p.city, p.country].filter(Boolean).join(', '),
    professionalTitle: p.professionalTitle || '',
    linkedin: p.linkedin || '',
    github: p.github || '',
    portfolio: p.portfolio || '',
    summary: p.ProfessionalSummary || '',
    skills: formData.skills.skills.join(', '),
    languages: formData.skills.languages
      ? formData.skills.languages.split(',').map((l) => ({ name: l.trim() }))
      : [],
    certifications: formData.skills.certifications
      ? formData.skills.certifications.split(',').map((c) => ({ name: c.trim() }))
      : [],
    experience: formData.experience.map((exp) => ({
      role: exp.jobTitle || '',
      company: exp.company || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      years: `${exp.startDate || ''} - ${exp.endDate || ''}`,
      location: exp.location || '',
      description: exp.description || '',
    })),
    education: formData.education.map((edu) => ({
      institution: edu.institution || '',
      degree: edu.degree || '',
      startYear: edu.startYear || '',
      endYear: edu.endYear || '',
      location: edu.location || '',
      description: edu.description || '',
    })),
    projects: formData.projects.map((proj) => ({
      name: proj.name || '',
      technologies: proj.technologies || '',
      demoUrl: proj.demoUrl || '',
      githubUrl: proj.githubUrl || '',
      description: proj.description || '',
    })),
  };
}
