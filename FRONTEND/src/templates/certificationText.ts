export interface CertificationProp {
  name?: string;
  issuer?: string;
  date?: string;
  url?: string;
  description?: string;
}

// Issuer and date shown under the credential name; empty when neither was filled in.
export const certificationDetail = (cert: CertificationProp): string =>
  [cert.issuer, cert.date].map((part) => (part || '').trim()).filter(Boolean).join(' · ');
