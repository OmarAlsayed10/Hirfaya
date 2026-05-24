import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formData: {
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phoneCode: "",
      phone: "",
      country: "",
      city: "",
      town: "",
      professionalTitle: "",
      ProfessionalSummary: "",
    },
    experience: [
      {
        jobTitle: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ],
    education: [
      {
        institution: "",
        degree: "",
        location: "",
        startYear: "",
        endYear: "",
        description: "",
      },
    ],
    skills: {
      skills: [],
      languages: "",
      certifications: "",
    },
  },
  myCvs: [],
};

export const cvBuilderSlice = createSlice({
  name: "cvBuilder",
  initialState,
  reducers: {
    updateFormData: (state, action) => {
      state.formData = action.payload;
    },
    updateSection: (state, action) => {
      const { section, data } = action.payload;

      if (section === "experience" || section === "education") {
        if (Array.isArray(data)) {
          state.formData[section] = data;
        } else if (state.formData[section].length > 0) {
          state.formData[section][0] = { ...state.formData[section][0], ...data };
        } else {
          state.formData[section] = [data];
        }
      } else {
        state.formData[section] = {
          ...state.formData[section],
          ...data,
        };
      }
    },
    updateArraySection: (state, action) => {
      const { section, index, data } = action.payload;
      if (index >= 0 && index < state.formData[section].length) {
        state.formData[section][index] = {
          ...state.formData[section][index],
          ...data,
        };
      } else if (index === state.formData[section].length) {
        state.formData[section].push(data);
      }
    },
    addArrayItem: (state, action) => {
      const { section, template } = action.payload;
      state.formData[section].push(template || {});
    },
    removeArrayItem: (state, action) => {
      const { section, index } = action.payload;
      if (index >= 0 && index < state.formData[section].length) {
        state.formData[section].splice(index, 1);
      }
      if (state.formData[section].length === 0) {
        state.formData[section].push({});
      }
    },
    setMyCvs: (state, action) => {
      state.myCvs = action.payload;
    },
  },
});

export const {
  updateFormData,
  updateSection,
  updateArraySection,
  addArrayItem,
  removeArrayItem,
  setMyCvs,
} = cvBuilderSlice.actions;

export default cvBuilderSlice.reducer;
