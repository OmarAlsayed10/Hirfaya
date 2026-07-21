import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: string;
  phone: string;
  country?: string;
  city: string;
  professionalTitle: string;
  ProfessionalSummary: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ExperienceItem {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  location: string;
  startYear: string;
  endYear: string;
  description: string;
}

export interface ProjectItem { name: string; technologies: string; demoUrl: string; githubUrl: string; description: string; }

export interface SkillsData {
  skills: string[];
  languages: string;
  certifications: string;
}

export interface BuilderFormData {
  personalInfo: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: SkillsData;
}

export type CvSection = "personal" | "projects" | "experience" | "education" | "skills" | "languages" | "certifications";

export interface CvBuilderState {
  formData: BuilderFormData;
  myCvs: any[];
  pageCount: number;
  sectionOrder: CvSection[];
}

const emptyPersonalInfo = (): PersonalInfo => ({
  firstName: "",
  lastName: "",
  email: "",
  phoneCode: "",
  phone: "",
  country: "",
  city: "",
  professionalTitle: "",
  ProfessionalSummary: "",
  linkedin: "",
  github: "",
  portfolio: "",
});

export const createEmptyBuilderFormData = (): BuilderFormData => ({
  personalInfo: emptyPersonalInfo(),
  experience: [],
  education: [],
  projects: [],
  skills: { skills: [], languages: "", certifications: "" },
});

const isRecord = (input: unknown): input is Record<string, unknown> =>
  typeof input === "object" && input !== null && !Array.isArray(input);

const recordArray = <T>(input: unknown): T[] =>
  Array.isArray(input) ? input.filter(isRecord) as T[] : [];

const normalizeSkills = (input: unknown): SkillsData => {
  if (!isRecord(input)) return { skills: [], languages: "", certifications: "" };
  return {
    skills: Array.isArray(input.skills)
      ? input.skills.filter((skill): skill is string => typeof skill === "string")
      : [],
    languages: typeof input.languages === "string" ? input.languages : "",
    certifications: typeof input.certifications === "string" ? input.certifications : "",
  };
};

export const normalizeBuilderFormData = (input: unknown): BuilderFormData => {
  const source = isRecord(input) ? input : {};
  return {
    personalInfo: {
      ...emptyPersonalInfo(),
      ...(isRecord(source.personalInfo) ? source.personalInfo : {}),
    } as PersonalInfo,
    experience: recordArray<ExperienceItem>(source.experience),
    education: recordArray<EducationItem>(source.education),
    projects: recordArray<ProjectItem>(source.projects),
    skills: normalizeSkills(source.skills),
  };
};

const initialState: CvBuilderState = {
  formData: createEmptyBuilderFormData(),
  myCvs: [],
  pageCount: 1,
  sectionOrder: ["personal", "projects", "experience", "education", "skills", "languages", "certifications"],
};

// Reducers index formData by a dynamic `section` key; cast to a loose record for that.
type LooseForm = Record<string, any>;

export const cvBuilderSlice = createSlice({
  name: "cvBuilder",
  initialState,
  reducers: {
    updateFormData: (state, action: PayloadAction<unknown>) => {
      state.formData = normalizeBuilderFormData(action.payload);
    },
    setPageCount: (state, action: PayloadAction<number>) => {
      state.pageCount = action.payload;
    },
    moveCvSection: (state, action: PayloadAction<{ from: number; to: number }>) => {
      const { from, to } = action.payload;
      if (from < 0 || to < 0 || from >= state.sectionOrder.length || to >= state.sectionOrder.length) return;
      const [section] = state.sectionOrder.splice(from, 1);
      state.sectionOrder.splice(to, 0, section);
    },
    updateSection: (state, action: PayloadAction<{ section: string; data: any }>) => {
      const { section, data } = action.payload;
      const form = state.formData as LooseForm;

      if (section === "experience" || section === "education" || section === "projects") {
        if (Array.isArray(data)) {
          form[section] = data;
        } else if (form[section].length > 0) {
          form[section][0] = { ...form[section][0], ...data };
        } else {
          form[section] = [data];
        }
      } else {
        form[section] = { ...form[section], ...data };
      }
    },
    updateArraySection: (state, action: PayloadAction<{ section: string; index: number; data: any }>) => {
      const { section, index, data } = action.payload;
      const form = state.formData as LooseForm;
      if (index >= 0 && index < form[section].length) {
        form[section][index] = { ...form[section][index], ...data };
      } else if (index === form[section].length) {
        form[section].push(data);
      }
    },
    addArrayItem: (state, action: PayloadAction<{ section: string; template?: any }>) => {
      const { section, template } = action.payload;
      (state.formData as LooseForm)[section].push(template || {});
    },
    removeArrayItem: (state, action: PayloadAction<{ section: string; index: number }>) => {
      const { section, index } = action.payload;
      const form = state.formData as LooseForm;
      if (index >= 0 && index < form[section].length) {
        form[section].splice(index, 1);
      }
      if (form[section].length === 0) {
        form[section].push({});
      }
    },
    setMyCvs: (state, action: PayloadAction<any[]>) => {
      state.myCvs = action.payload;
    },
  },
});

export const {
  updateFormData,
  setPageCount,
  moveCvSection,
  updateSection,
  updateArraySection,
  addArrayItem,
  removeArrayItem,
  setMyCvs,
} = cvBuilderSlice.actions;

export default cvBuilderSlice.reducer;
