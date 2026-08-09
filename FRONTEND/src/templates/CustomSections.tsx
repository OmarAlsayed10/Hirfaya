import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import BulletList from './BulletList';
import type { CustomSection } from '../redux/store/slices/cvBuilderSlice';

export interface CustomSectionsProps {
  sections: CustomSection[];
  sectionOrder: string[];
  headingSx: SxProps<Theme>;
  entryTitleSx: SxProps<Theme>;
  entryMetaSx: SxProps<Theme>;
  bodySx?: SxProps<Theme>;
}

// One renderer for every template: each passes its own heading and entry styles, so a
// user-added section looks native to the design instead of being a sixth hand-written copy.
export const CustomSections = ({
  sections,
  sectionOrder,
  headingSx,
  entryTitleSx,
  entryMetaSx,
  bodySx,
}: CustomSectionsProps) => (
  <>
    {sections.map((section) => {
      const entries = section.items.filter((item) => item.title.trim() || item.description.trim());
      if (!section.title.trim() && entries.length === 0) return null;

      return (
        <Box
          key={section.id}
          data-cv-section={`custom:${section.id}`}
          sx={{ order: sectionOrder.indexOf(`custom:${section.id}`) }}
        >
          <Typography draggable data-cv-drag-handle sx={headingSx}>
            {section.title}
          </Typography>
          {entries.map((item, index) => (
            <Box key={index} sx={{ mb: 1.2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography sx={entryTitleSx}>{item.title}</Typography>
                {item.date && <Typography sx={entryMetaSx}>{item.date}</Typography>}
              </Box>
              {item.subtitle && <Typography sx={entryMetaSx}>{item.subtitle}</Typography>}
              <BulletList text={item.description} sx={bodySx} />
            </Box>
          ))}
        </Box>
      );
    })}
  </>
);

export default CustomSections;
