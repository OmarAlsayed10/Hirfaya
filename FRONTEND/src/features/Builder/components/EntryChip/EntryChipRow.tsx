import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import { ArrowLeft, ArrowRight } from '../../../../components/icons/MuiIcons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../../../theme/tokens';
import EntryChip from './EntryChip';

export interface EntryChipRowProps {
  labels: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

const SCROLL_STEP = 180;

// The chip strip scrolls, but with no affordance entries past the edge were unreachable by
// anything but a trackpad swipe. Arrows appear only when there is something to scroll to.
export const EntryChipRow = ({ labels, activeIndex, onSelect }: EntryChipRowProps) => {
  const { t } = useTranslation();
  const stripRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ left: false, right: false });

  const syncOverflow = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return;
    setOverflow({
      left: strip.scrollLeft > 1,
      right: strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const observer = new ResizeObserver(syncOverflow);
    observer.observe(strip);
    syncOverflow();
    return () => observer.disconnect();
  }, [labels.length, syncOverflow]);

  // Selecting an entry from elsewhere (adding one, deleting one) must bring it into view.
  useEffect(() => {
    stripRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    syncOverflow();
  }, [activeIndex, syncOverflow]);

  const scrollBy = (direction: number) => {
    stripRef.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: 'smooth' });
  };

  if (labels.length === 0) return null;

  const arrow = (direction: -1 | 1, disabled: boolean) => (
    <Tooltip title={direction === -1 ? t('Scroll left') : t('Scroll right')}>
      <span>
        <IconButton
          size="small"
          onClick={() => scrollBy(direction)}
          disabled={disabled}
          sx={{ color: COLORS.textSecondary, flexShrink: 0 }}
        >
          {direction === -1 ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
        </IconButton>
      </span>
    </Tooltip>
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
      {(overflow.left || overflow.right) && arrow(-1, !overflow.left)}
      <Stack
        ref={stripRef}
        direction="row"
        spacing={1}
        onScroll={syncOverflow}
        // Still scrollable — the arrows drive it. The bar itself is hidden because it sat
        // under the chips as a second, competing control.
        sx={{
          overflowX: 'auto',
          pb: 0.5,
          pt: 0.5,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {labels.map((label, index) => (
          <EntryChip key={index} label={label} active={activeIndex === index} onClick={() => onSelect(index)} />
        ))}
      </Stack>
      {(overflow.left || overflow.right) && arrow(1, !overflow.right)}
    </Box>
  );
};

export default EntryChipRow;
