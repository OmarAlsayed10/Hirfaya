import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import FormattedText from "../components/ui/FormattedText";
import { bulletLines } from "./bulletLines";

// One bullet per line, wrapping onto further lines within the same bullet. A single-line
// description stays a plain paragraph so short entries don't grow a pointless marker.
const BulletList = ({ text, fieldPath, sx }: { text: string; fieldPath?: string; sx?: SxProps<Theme> }) => {
  const lines = bulletLines(text);
  if (lines.length === 0) return null;

  if (lines.length === 1) {
    return <Typography data-cv-field={fieldPath} sx={sx}><FormattedText text={lines[0]} /></Typography>;
  }

  // The marker is written as text rather than left to `list-style`. A CSS marker is painted into
  // the PDF but never lands in its text layer, so every parser reading that layer — the analysis
  // scorer and a real ATS alike — saw a CV with no bullets at all.
  return (
    <Box component="ul" data-cv-field={fieldPath} sx={{ pl: 0, m: 0, listStyle: 'none', ...sx }}>
      {lines.map((line, index) => (
        <Box component="li" key={index} sx={{ mb: 0.2, display: 'flex', gap: '0.55em' }}>
          <Box component="span" sx={{ flexShrink: 0 }}>•</Box>
          <Box component="span"><FormattedText text={line} /></Box>
        </Box>
      ))}
    </Box>
  );
};

export default BulletList;
