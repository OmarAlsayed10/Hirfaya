import type { RefObject } from 'react';
import { Button, ButtonGroup, Tooltip } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import { useTranslation } from 'react-i18next';

type TextControl = HTMLInputElement | HTMLTextAreaElement;

interface FieldFormattingToolbarProps {
  inputRef: RefObject<TextControl | null>;
  value: string;
  onValueChange: (formattedText: string) => void;
}

const FieldFormattingToolbar = ({ inputRef, value, onValueChange }: FieldFormattingToolbarProps) => {
  const { t } = useTranslation();

  const applyFormat = (prefix: string, suffix = prefix) => {
    const control = inputRef.current;
    const selectionStart = control?.selectionStart ?? 0;
    const selectionEnd = control?.selectionEnd ?? value.length;
    const hasSelection = selectionEnd > selectionStart;
    const start = hasSelection ? selectionStart : 0;
    const end = hasSelection ? selectionEnd : value.length;
    onValueChange(`${value.slice(0, start)}${prefix}${value.slice(start, end)}${suffix}${value.slice(end)}`);
    requestAnimationFrame(() => control?.focus());
  };

  return (
    <ButtonGroup
      size="small"
      variant="outlined"
      aria-label={t('Format field text')}
      disabled={!value}
      onMouseDown={(event) => event.preventDefault()}
      sx={{ mt: 0.75, alignSelf: 'flex-start', '& .MuiButton-root': { minWidth: 34, px: 1, textTransform: 'none' } }}
    >
      <Tooltip title={t('Bold')}>
        <Button onClick={() => applyFormat('**')} aria-label={t('Bold')}><FormatBoldIcon fontSize="small" /></Button>
      </Tooltip>
      <Tooltip title={t('Italic')}>
        <Button onClick={() => applyFormat('__')} aria-label={t('Italic')}><FormatItalicIcon fontSize="small" /></Button>
      </Tooltip>
      <Button onClick={() => applyFormat('^^')} sx={{ fontWeight: 600 }}>{t('Semi bold')}</Button>
      <Button onClick={() => applyFormat('[[small]]', '[[/small]]')} aria-label={t('Decrease text size')}>A−</Button>
      <Button onClick={() => applyFormat('[[large]]', '[[/large]]')} aria-label={t('Increase text size')}>A+</Button>
    </ButtonGroup>
  );
};

export default FieldFormattingToolbar;
