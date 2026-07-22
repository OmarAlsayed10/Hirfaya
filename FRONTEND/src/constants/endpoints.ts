export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const AUTH_ENDPOINTS = {
  login: `${API_BASE_URL}/auth/login`,
  google: `${API_BASE_URL}/auth/google`,
  register: `${API_BASE_URL}/auth/register`,
  verifyToken: `${API_BASE_URL}/auth/verify-token`,
  verifyOTP: `${API_BASE_URL}/auth/verify-otp`,
  resendOTP: `${API_BASE_URL}/auth/resend-otp`,
  logout: `${API_BASE_URL}/auth/logout`,
  updatePassword: `${API_BASE_URL}/auth/update-password`,
};

export const BUILDER_ENDPOINTS = {
  save: `${API_BASE_URL}/cvbuilder/save`,
  update: (id: string) => `${API_BASE_URL}/cvbuilder/${id}`,
  delete: (id: string) => `${API_BASE_URL}/cvbuilder/${id}`,
};

export const AI_ENDPOINTS = {
  grammarCheck: `${API_BASE_URL}/api/ai/grammarcheck`,
  analyze: `${API_BASE_URL}/api/ai/analyze`,
  careerMatch: `${API_BASE_URL}/api/ai/career-match`,
  careerMatchLimits: `${API_BASE_URL}/api/ai/career-match/limits`,
  adjustCV: `${API_BASE_URL}/api/ai/adjust-cv`,
  exportAdjustedCV: `${API_BASE_URL}/api/ai/export-adjusted-cv`,
  cvChat: `${API_BASE_URL}/api/ai/cv-chat`,
  interviewAnswers: `${API_BASE_URL}/api/ai/interview-answers`,
  parseCv: `${API_BASE_URL}/api/ai/parse-cv`,
  polishEntry: `${API_BASE_URL}/api/ai/polish-entry`,
  aiWritingAssist: `${API_BASE_URL}/api/ai/ai-writing-assist`,
  conversationalBuild: `${API_BASE_URL}/api/ai/conversational-build`,
  importCv: `${API_BASE_URL}/api/ai/import-cv`,
  optimizeCvLength: `${API_BASE_URL}/api/ai/optimize-cv-length`,
  editFieldAI: `${API_BASE_URL}/api/ai/edit-field-ai`,
  generateSmartSkills: `${API_BASE_URL}/api/ai/generate-smart-skills`,
  importProjectUrl: `${API_BASE_URL}/api/ai/import-project-url`,
  importProjectFile: `${API_BASE_URL}/api/ai/import-project-file`,
};

export const CV_ENDPOINTS = {
  userCvs: `${API_BASE_URL}/cvbuilder/user`,
  primary: `${API_BASE_URL}/cvbuilder/primary`,
  save: `${API_BASE_URL}/cvbuilder/save`,
  delete: (id: string) => `${API_BASE_URL}/cvbuilder/${id}`,
  setPrimary: (id: string) => `${API_BASE_URL}/cvbuilder/${id}/primary`,
};

export const DOCUMENT_ENDPOINTS = {
  list: `${API_BASE_URL}/documents`,
  byType: (type: string) => `${API_BASE_URL}/documents?type=${encodeURIComponent(type)}`,
  generate: `${API_BASE_URL}/documents/generate`,
  update: (id: string) => `${API_BASE_URL}/documents/${id}`,
  delete: (id: string) => `${API_BASE_URL}/documents/${id}`,
  setPrimary: (id: string) => `${API_BASE_URL}/documents/${id}/primary`,
};
export const QUOTA_ENDPOINTS = {
  status: `${API_BASE_URL}/quota/status`,
};


export const USER_ENDPOINTS = {
  plan: `${API_BASE_URL}/auth/plan`,
  updateProfile: `${API_BASE_URL}/auth/profile`,
  deleteAccount: `${API_BASE_URL}/auth/account`,
};

export const JOB_ENDPOINTS = {
  catalog: `${API_BASE_URL}/job-radar/catalog`,
  suggestions: `${API_BASE_URL}/job-radar/role-suggestions`,
  submissions: `${API_BASE_URL}/job-radar/submissions`,
  preference: `${API_BASE_URL}/job-radar/preference`,
  matches: `${API_BASE_URL}/job-radar/matches`,
  refresh: `${API_BASE_URL}/job-radar/refresh`,
  status: (id: string) => `${API_BASE_URL}/job-radar/matches/${id}/status`,
  coverLetter: (id: string) => `${API_BASE_URL}/job-radar/matches/${id}/cover-letter`,
  analytics: `${API_BASE_URL}/job-radar/analytics`,
  variants: (id: string) => `${API_BASE_URL}/job-radar/matches/${id}/variants`,
  variantOutcome: (id: string) => `${API_BASE_URL}/job-radar/variants/${id}/outcome`,
};


export const PAYMENT_ENDPOINTS = {
  plans: `${API_BASE_URL}/payment/plans`,
  instapayDetails: (planId: string) =>
    `${API_BASE_URL}/payment/instapay/details/${planId}`,
  submit: `${API_BASE_URL}/payment/instapay/submit`,
  creditQuote: `${API_BASE_URL}/payment/credit-quote`,
  customInstapayDetails: `${API_BASE_URL}/payment/instapay/details/custom`,
  status: `${API_BASE_URL}/payment/status`,
  adminPending: `${API_BASE_URL}/payment/admin/pending`,
  adminApprove: (id: string) => `${API_BASE_URL}/payment/admin/${id}/approve`,
  adminReject: (id: string) => `${API_BASE_URL}/payment/admin/${id}/reject`,
};

export const ADMIN_ENDPOINTS = {
  jobCatalog: `${API_BASE_URL}/admin/job-catalog`,
  jobCategories: `${API_BASE_URL}/admin/job-categories`,
  jobCategory: (id: string) => `${API_BASE_URL}/admin/job-categories/${id}`,
  jobRoles: (categoryId: string) => `${API_BASE_URL}/admin/job-categories/${categoryId}/roles`,
  jobRole: (id: string) => `${API_BASE_URL}/admin/job-roles/${id}`,
  jobRoleSuggestions: `${API_BASE_URL}/admin/job-role-suggestions`,
  jobRoleSuggestion: (id: string) => `${API_BASE_URL}/admin/job-role-suggestions/${id}`,
  jobSubmissions: `${API_BASE_URL}/admin/job-submissions`,
  jobSubmission: (id: string) => `${API_BASE_URL}/admin/job-submissions/${id}`,
  users: `${API_BASE_URL}/admin/users`,
  user: (id: string) => `${API_BASE_URL}/admin/users/${id}`,
  banUser: (id: string) => `${API_BASE_URL}/admin/users/${id}/ban`,
  unbanUser: (id: string) => `${API_BASE_URL}/admin/users/${id}/unban`,
  revokePro: (id: string) => `${API_BASE_URL}/admin/users/${id}/revoke-pro`,
  setPlan: (id: string) => `${API_BASE_URL}/admin/users/${id}/plan`,
  grantAnalyses: (id: string) => `${API_BASE_URL}/admin/users/${id}/grant-analyses`,
  aiStatus: `${API_BASE_URL}/admin/ai-status`,
  bannedIps: `${API_BASE_URL}/admin/banned-ips`,
  unbanIp: (ip: string) => `${API_BASE_URL}/admin/banned-ips/${encodeURIComponent(ip)}`,
  payments: `${API_BASE_URL}/admin/payments`,
  blogs: `${API_BASE_URL}/admin/blogs`,
  blog: (id: string) => `${API_BASE_URL}/admin/blogs/${id}`,
};

export const BLOG_ENDPOINTS = {
  list: `${API_BASE_URL}/blogs`,
  bySlug: (slug: string) => `${API_BASE_URL}/blogs/${slug}`,
};

export const CHATBOT_ENDPOINTS = {
  create: `${API_BASE_URL}/api/chatbot/create`,
  send: `${API_BASE_URL}/api/chatbot`,
};
