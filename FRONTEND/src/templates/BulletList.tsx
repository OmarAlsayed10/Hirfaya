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

  return (
    <Box component="ul" data-cv-field={fieldPath} sx={{ pl: 2.2, m: 0, ...sx }}>
      {lines.map((line, index) => (
        <Box component="li" key={index} sx={{ mb: 0.2 }}><FormattedText text={line} /></Box>
      ))}
    </Box>
  );
};

export default BulletList;
