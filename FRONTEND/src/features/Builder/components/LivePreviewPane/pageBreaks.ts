// Templates render one continuous flow that the page frame clips every PAGE_HEIGHT px, so an
// entry landing on the boundary gets sliced in half. Pushing it past the boundary with a top
// margin is what turns that slice into a real page break.
export const pageBreakPush = (top: number, bottom: number, pageHeight: number, padding: number): number => {
  const pageEnd = (Math.floor(top / pageHeight) + 1) * pageHeight;
  if (bottom <= pageEnd - padding) return 0;
  if (bottom - top > pageHeight - padding * 2) return 0;
  return pageEnd + padding - top;
};

// A section heading must never be the last thing on a page, so it travels with the entry
// that follows it.
export const breakUnits = (content: HTMLElement): HTMLElement[][] => {
  const units: HTMLElement[][] = [];
  content.querySelectorAll<HTMLElement>('[data-cv-section]').forEach((section) => {
    const children = Array.from(section.children) as HTMLElement[];
    for (let index = 0; index < children.length; index += 1) {
      const child = children[index];
      const next = children[index + 1];
      if (child.hasAttribute('data-cv-drag-handle') && next) {
        units.push([child, next]);
        index += 1;
      } else {
        units.push([child]);
      }
    }
  });
  return units;
};

export const applyPageBreaks = (
  page: HTMLElement,
  content: HTMLElement,
  pageHeight: number,
  padding: number,
  zoom: number,
) => {
  const units = breakUnits(content);
  units.forEach(([first]) => { first.style.marginTop = ''; });

  const screenPerPageUnit = page.getBoundingClientRect().height / pageHeight;
  if (!screenPerPageUnit || !zoom) return;

  units.forEach((unit) => {
    const origin = content.getBoundingClientRect().top;
    const top = (unit[0].getBoundingClientRect().top - origin) / screenPerPageUnit;
    const bottom = (unit[unit.length - 1].getBoundingClientRect().bottom - origin) / screenPerPageUnit;
    const push = pageBreakPush(top, bottom, pageHeight, padding);
    if (push > 0) unit[0].style.marginTop = `${push / zoom}px`;
  });
};
