import type { ReactNode } from 'react';
import { Box } from '@mui/material';

const FORMAT_PATTERN = /(\*\*([^*]+)\*\*|__([^_]+)__|\^\^([^\^]+)\^\^|\[\[large\]\]([\s\S]+?)\[\[\/large\]\]|\[\[small\]\]([\s\S]+?)\[\[\/small\]\])/g;

const formatPart = (match: RegExpExecArray, key: number): ReactNode => {
  if (match[2]) return <Box component="strong" key={key}><FormattedText text={match[2]} /></Box>;
  if (match[3]) return <Box component="em" key={key}><FormattedText text={match[3]} /></Box>;
  if (match[4]) return <Box component="span" key={key} sx={{ fontWeight: 600 }}><FormattedText text={match[4]} /></Box>;
  if (match[5]) return <Box component="span" key={key} sx={{ fontSize: '1.12em' }}><FormattedText text={match[5]} /></Box>;
  return <Box component="span" key={key} sx={{ fontSize: '0.9em' }}><FormattedText text={match[6]} /></Box>;
};

export const stripTextFormatting = (text: string): string => text
  .replace(/\*\*([^*]+)\*\*/g, '$1')
  .replace(/__([^_]+)__/g, '$1')
  .replace(/\^\^([^\^]+)\^\^/g, '$1')
  .replace(/\[\[(?:large|small)\]\]([\s\S]+?)\[\[\/(?:large|small)\]\]/g, '$1');

const FormattedText = ({ text }: { text: string }) => {
  const parts: ReactNode[] = [];
  let cursor = 0;
  const formatPattern = new RegExp(FORMAT_PATTERN.source, 'g');
  let match = formatPattern.exec(text);

  while (match) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(formatPart(match, match.index));
    cursor = match.index + match[0].length;
    match = formatPattern.exec(text);
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
};

export default FormattedText;
