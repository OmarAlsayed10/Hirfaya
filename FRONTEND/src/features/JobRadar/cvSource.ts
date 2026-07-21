import axios from "axios";
import { CV_ENDPOINTS } from "../../constants/endpoints";

interface RawCv {
  _id?: string;
  id?: string;
  title?: string;
  updatedAt?: string;
  personalInfo?: Record<string, unknown>;
  experience?: Record<string, unknown>[];
  education?: Record<string, unknown>[];
  skills?: { skills?: string[]; languages?: string; certifications?: string };
}

export interface CvOption {
  id: string;
  title: string;
  text: string;
}

const line = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(" · ").trim();

export const cvToText = (cv: RawCv): string => {
  const p = cv.personalInfo ?? {};
  const s = String;
  const blocks: string[] = [];

  blocks.push(line(s(p.firstName ?? ""), s(p.lastName ?? "")));
  blocks.push(line(s(p.professionalTitle ?? "")));
  blocks.push(line(s(p.email ?? ""), s(p.phone ?? ""), s(p.city ?? ""), s(p.country ?? "")));
  if (p.ProfessionalSummary) blocks.push(`Summary\n${s(p.ProfessionalSummary)}`);

  const exp = (cv.experience ?? [])
    .map((e) =>
      line(s(e.jobTitle ?? ""), s(e.company ?? ""), s(e.location ?? ""), `${s(e.startDate ?? "")}-${s(e.endDate ?? "")}`) +
      (e.description ? `\n${s(e.description)}` : "")
    )
    .filter((x) => x.trim());
  if (exp.length) blocks.push(`Experience\n${exp.join("\n\n")}`);

  const edu = (cv.education ?? [])
    .map((e) =>
      line(s(e.degree ?? ""), s(e.institution ?? ""), `${s(e.startYear ?? "")}-${s(e.endYear ?? "")}`) +
      (e.description ? `\n${s(e.description)}` : "")
    )
    .filter((x) => x.trim());
  if (edu.length) blocks.push(`Education\n${edu.join("\n\n")}`);

  const sk = cv.skills ?? {};
  if (sk.skills?.length) blocks.push(`Skills: ${sk.skills.join(", ")}`);
  if (sk.languages) blocks.push(`Languages: ${sk.languages}`);
  if (sk.certifications) blocks.push(`Certifications: ${sk.certifications}`);

  return blocks.filter(Boolean).join("\n\n").trim();
};

export const loadCvOptions = async (): Promise<CvOption[]> => {
  const { data } = await axios.get(CV_ENDPOINTS.userCvs, { withCredentials: true });
  const cvs: RawCv[] = Array.isArray(data) ? data : data.cvs ?? [];
  return cvs
    .map((cv, i) => ({
      id: cv._id ?? cv.id ?? String(i),
      title: cv.title || `CV ${i + 1}`,
      text: cvToText(cv),
    }))
    .filter((o) => o.text.length > 0);
};
