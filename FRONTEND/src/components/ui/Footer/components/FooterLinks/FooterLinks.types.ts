export interface FooterLink {
  label: string;
  to: string;
}

export interface FooterLinksProps {
  title: string;
  links: FooterLink[];
}
