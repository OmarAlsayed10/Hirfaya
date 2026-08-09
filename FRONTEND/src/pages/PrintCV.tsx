import { useEffect } from 'react';
import { Box, GlobalStyles } from '@mui/material';
import ClassicCV from '../templates/classic-cv';
import LinkedInCV from '../templates/linkedin-cv';
import ModernCV from '../templates/modern-cv';
import JakeCV from '../templates/jake-cv';
import HarvardCV from '../templates/harvard-cv';
import PhotoCV from '../templates/photo-cv';
import { cvFormToPdfProps } from '../templates/pdf/cvFormToPdfProps';
import { applyPalette } from '../theme/palettes';

const PAGE_WIDTH = 794;

const templates: Record<string, any> = {
  'classic-cv': ClassicCV,
  'linkedin-cv': LinkedInCV,
  'modern-cv': ModernCV,
  'jake-cv': JakeCV,
  'harvard-cv': HarvardCV,
  'photo-cv': PhotoCV,
};

// The export browser injects this before navigating, so the page needs no auth and no fetch.
declare global {
  interface Window {
    __CV_DATA__?: { formData: any; sectionOrder?: string[]; template?: string; fontScale?: number };
    __CV_PRINT_READY__?: boolean;
  }
}

// A container's top padding is spent once, on page one, so every page after it started
// flush against the paper edge. The vertical inset has to come from @page, which the browser
// re-applies to every page; horizontal padding already repeats, so it stays on the template.
// modern-cv is deliberately 0 — its dark sidebar is full-bleed and a top margin would leave
// a white band above it on every page.
const PRINT_VERTICAL_MARGIN: Record<string, number> = {
  'classic-cv': 40,
  'harvard-cv': 48,
  'jake-cv': 40,
  'photo-cv': 40,
  'linkedin-cv': 40,
  'modern-cv': 0,
};

const printStyles = (verticalMargin: number) => ({
  '@page': { size: 'A4', margin: `${verticalMargin}px 0` },
  // The html background propagates to the whole page canvas, margins included. In dark mode
  // palette.css paints body near-black plus gradients, which printed as black bands in the
  // @page margin strips. The print page is always a white sheet, whatever theme the user is in.
  'html, body, #root': {
    margin: 0,
    padding: 0,
    background: '#fff !important',
    backgroundColor: '#fff !important',
    backgroundImage: 'none !important',
    colorScheme: 'light',
  },
  // The id beats emotion's class specificity, so no !important is needed.
  '#cv-print-root > *': { paddingTop: 0, paddingBottom: 0 },
  // The browser paginates instead of the preview's fixed-height clipping, so entries and
  // list items are told not to split and headings not to be left alone at a page bottom.
  '[data-cv-section] > *, [data-cv-section] li': { breakInside: 'avoid' },
  '[data-cv-drag-handle]': { breakAfter: 'avoid' },
});

const PrintCV = () => {
  const data = window.__CV_DATA__;

  useEffect(() => {
    if (!data) return;
    // Chrome paints the page box outside the content with the UA canvas colour, and
    // `color-scheme: dark` makes that rgb(18,18,18) — that, not the body background, is what
    // printed black bands down the @page margins. applyPalette owns color-scheme (it writes
    // it inline), so the print page forces light through the same function rather than
    // fighting it. It runs after mount effects have settled, so nothing overwrites it.
    void document.fonts?.ready.then(() => {
      applyPalette('light');
      window.__CV_PRINT_READY__ = true;
    });
  }, [data]);

  if (!data) return null;

  const templateName = data.template || 'classic-cv';
  const Template = templates[templateName] || ClassicCV;
  const props = {
    ...cvFormToPdfProps(data.formData),
    sectionOrder: data.sectionOrder,
    printMode: true,
  };

  return (
    <>
      <GlobalStyles styles={printStyles(PRINT_VERTICAL_MARGIN[templateName] ?? 40)} />
      <Box sx={{ width: PAGE_WIDTH, mx: 'auto', background: '#fff' }}>
        <Box id="cv-print-root" sx={{ zoom: data.fontScale ?? 1 }}>
          <Template {...props} />
        </Box>
      </Box>
    </>
  );
};

export default PrintCV;
