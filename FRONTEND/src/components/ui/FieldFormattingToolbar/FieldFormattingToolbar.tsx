import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { Button, ButtonGroup, Tooltip } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../../theme/tokens';
import { applyMarker, isFormatted } from './fieldFormatting';
import type { Marker } from './fieldFormatting';

type TextControl = HTMLInputElement | HTMLTextAreaElement;

const BOLD: Marker = { prefix: '**', suffix: '**' };
const SEMI_BOLD: Marker = { prefix: '^^', suffix: '^^' };
const ITALIC: Marker = { prefix: '__', suffix: '__' };
const SMALL: Marker = { prefix: '[[small]]', suffix: '[[/small]]' };
const LARGE: Marker = { prefix: '[[large]]', suffix: '[[/large]]' };

// Formats within a group set the same property, so only one of them can be on at a time.
const WEIGHT = [BOLD, SEMI_BOLD];
const SIZE = [SMALL, LARGE];

interface FieldFormattingToolbarProps {
  inputRef: RefObject<TextControl | null>;
  value: string;
  onValueChange: (formattedText: string) => void;
}

const FieldFormattingToolbar = ({ inputRef, value, onValueChange }: FieldFormattingToolbarProps) => {
  const { t } = useTranslation();
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  // The buttons light up for whatever the caret is sitting in, so the toolbar reads as a
  // state you toggle rather than a stamp you press.
  const syncSelection = useCallback(() => {
    const control = inputRef.current;
    if (!control) return;
    setSelection({ start: control.selectionStart ?? 0, end: control.selectionEnd ?? 0 });
  }, [inputRef]);

  useEffect(() => {
    const control = inputRef.current;
    if (!control) return;
    const onSelectionChange = () => {
      if (document.activeElement === control) syncSelection();
    };
    document.addEventListener('selectionchange', onSelectionChange);
    control.addEventListener('input', syncSelection);
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      control.removeEventListener('input', syncSelection);
    };
  }, [inputRef, syncSelection]);

  const applyFormat = (marker: Marker, group: Marker[] = []) => {
    const conflicts = group.filter((entry) => entry.prefix !== marker.prefix);
    const edit = applyMarker(value, selection.start, selection.end, marker, conflicts);
    onValueChange(edit.value);
    requestAnimationFrame(() => {
      const control = inputRef.current;
      if (!control) return;
      control.focus();
      control.setSelectionRange(edit.selectionStart, edit.selectionEnd);
      syncSelection();
    });
  };

  const activeSx = (marker: Marker) =>
    isFormatted(value, selection.start, selection.end, marker.prefix, marker.suffix)
      ? { bgcolor: COLORS.primaryAlpha12, borderColor: COLORS.primary, color: COLORS.primary }
      : undefined;

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
        <Button
          onClick={() => applyFormat(BOLD, WEIGHT)}
          aria-label={t('Bold')}
          aria-pressed={isFormatted(value, selection.start, selection.end, '**', '**')}
          sx={activeSx(BOLD)}
        >
          <FormatBoldIcon fontSize="small" />
        </Button>
      </Tooltip>
      <Tooltip title={t('Italic')}>
        <Button
          onClick={() => applyFormat(ITALIC)}
          aria-label={t('Italic')}
          aria-pressed={isFormatted(value, selection.start, selection.end, '__', '__')}
          sx={activeSx(ITALIC)}
        >
          <FormatItalicIcon fontSize="small" />
        </Button>
      </Tooltip>
      <Button
        onClick={() => applyFormat(SEMI_BOLD, WEIGHT)}
        aria-pressed={isFormatted(value, selection.start, selection.end, '^^', '^^')}
        sx={{ fontWeight: 600, ...activeSx(SEMI_BOLD) }}
      >
        {t('Semi bold')}
      </Button>
      <Button
        onClick={() => applyFormat(SMALL, SIZE)}
        aria-label={t('Decrease text size')}
        sx={activeSx(SMALL)}
      >
        A−
      </Button>
      <Button
        onClick={() => applyFormat(LARGE, SIZE)}
        aria-label={t('Increase text size')}
        sx={activeSx(LARGE)}
      >
        A+
      </Button>
    </ButtonGroup>
  );
};

export default FieldFormattingToolbar;
