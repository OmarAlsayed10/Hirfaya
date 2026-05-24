import { Box, Typography, TypographyProps } from '@mui/material';
import { ContentBlockProps } from './ContentBlock.types';
import contentBlock from './contentBlock.tokens';

const ContentBlock = ({
  headline,
  text,
  icon,
  iconBg = 'tinted',
  stepNumber,
  size = 'card',
  textMaxWidth,
}: ContentBlockProps) => {
  const isSection = size === 'section';
  const headlineVariant: TypographyProps['variant'] = isSection ? 'h2' : 'h3';

  const textSx = isSection
    ? { ...contentBlock.textSection, maxWidth: textMaxWidth, mx: textMaxWidth ? 'auto' : undefined }
    : { ...contentBlock.textCard, maxWidth: textMaxWidth ?? '260px' };

  return (
    <Box sx={contentBlock.root}>
      {icon && (
        <Box sx={contentBlock.iconWrapper}>
          <Box sx={iconBg === 'white' ? contentBlock.circleWhite : contentBlock.circleTinted}>
            {icon}
          </Box>

          {stepNumber !== undefined && (
            <Box sx={contentBlock.stepBadge}>{stepNumber}</Box>
          )}
        </Box>
      )}

      <Typography variant={headlineVariant} sx={isSection ? contentBlock.headlineSection : contentBlock.headlineCard}>
        {headline}
      </Typography>

      <Typography sx={textSx}>{text}</Typography>
    </Box>
  );
};

export default ContentBlock;
