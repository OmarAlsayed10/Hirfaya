import type { ReactNode } from 'react';
import { Text } from '@react-pdf/renderer';

const FORMAT_PATTERN = /(\*\*([^*]+)\*\*|__([^_]+)__|\^\^([^\^]+)\^\^|\[\[large\]\]([\s\S]+?)\[\[\/large\]\]|\[\[small\]\]([\s\S]+?)\[\[\/small\]\])/g;

const formattedPart = (match: RegExpExecArray, key: number, fontSize: number): ReactNode => {
  if (match[2]) return <Text key={key} style={{ fontWeight: 'bold' }}><PdfFormattedText text={match[2]} fontSize={fontSize} /></Text>;
  if (match[3]) return <Text key={key} style={{ fontStyle: 'italic' }}><PdfFormattedText text={match[3]} fontSize={fontSize} /></Text>;
  if (match[4]) return <Text key={key} style={{ fontWeight: 600 }}><PdfFormattedText text={match[4]} fontSize={fontSize} /></Text>;
  if (match[5]) return <Text key={key} style={{ fontSize: fontSize * 1.12 }}><PdfFormattedText text={match[5]} fontSize={fontSize * 1.12} /></Text>;
  return <Text key={key} style={{ fontSize: fontSize * 0.9 }}><PdfFormattedText text={match[6]} fontSize={fontSize * 0.9} /></Text>;
};

const PdfFormattedText = ({ text, fontSize = 9.5 }: { text: string; fontSize?: number }) => {
  const parts: ReactNode[] = [];
  let cursor = 0;
  const formatPattern = new RegExp(FORMAT_PATTERN.source, 'g');
  let match = formatPattern.exec(text);

  while (match) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(formattedPart(match, match.index, fontSize));
    cursor = match.index + match[0].length;
    match = formatPattern.exec(text);
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
};

export default PdfFormattedText;
