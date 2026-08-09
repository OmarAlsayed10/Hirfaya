export interface FormatEdit {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

// Markers wrap the selection, or the whole field when nothing is selected.
const range = (value: string, start: number, end: number) =>
  end > start ? { start, end } : { start: 0, end: value.length };

// Two ways a range can already be formatted: the markers sit just outside it
// (ab[sel]cd with **), or they are part of the selection itself ([**sel**]).
export const formatState = (value: string, start: number, end: number, prefix: string, suffix: string) => {
  const { start: from, end: to } = range(value, start, end);
  const outside =
    value.slice(Math.max(0, from - prefix.length), from) === prefix &&
    value.slice(to, to + suffix.length) === suffix;
  const inside =
    to - from >= prefix.length + suffix.length &&
    value.slice(from, from + prefix.length) === prefix &&
    value.slice(to - suffix.length, to) === suffix;
  return { from, to, outside, inside, active: outside || inside };
};

export const isFormatted = (value: string, start: number, end: number, prefix: string, suffix: string) =>
  formatState(value, start, end, prefix, suffix).active;

// Clicking an active button removes the markers instead of stacking another pair — that
// repeated stacking is what produced "******" in the field.
export const toggleFormat = (
  value: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string = prefix,
): FormatEdit => {
  const { from, to, outside, inside } = formatState(value, start, end, prefix, suffix);

  if (outside) {
    const head = value.slice(0, from - prefix.length);
    const body = value.slice(from, to);
    const tail = value.slice(to + suffix.length);
    return { value: head + body + tail, selectionStart: head.length, selectionEnd: head.length + body.length };
  }

  if (inside) {
    const head = value.slice(0, from);
    const body = value.slice(from + prefix.length, to - suffix.length);
    const tail = value.slice(to);
    return { value: head + body + tail, selectionStart: head.length, selectionEnd: head.length + body.length };
  }

  const head = value.slice(0, from);
  const body = value.slice(from, to);
  const tail = value.slice(to);
  return {
    value: `${head}${prefix}${body}${suffix}${tail}`,
    selectionStart: head.length + prefix.length,
    selectionEnd: head.length + prefix.length + body.length,
  };
};

export interface Marker {
  prefix: string;
  suffix: string;
}

// Bold and semi bold are the same property — a font weight — so they cannot both apply.
// Nesting them meant turning semi bold off fell back to bold instead of to plain text.
// Applying one clears the others in its group first.
export const applyMarker = (
  value: string,
  start: number,
  end: number,
  marker: Marker,
  conflicts: Marker[] = [],
): FormatEdit => {
  if (isFormatted(value, start, end, marker.prefix, marker.suffix)) {
    return toggleFormat(value, start, end, marker.prefix, marker.suffix);
  }

  let current: FormatEdit = { value, selectionStart: start, selectionEnd: end };
  for (const conflict of conflicts) {
    if (isFormatted(current.value, current.selectionStart, current.selectionEnd, conflict.prefix, conflict.suffix)) {
      current = toggleFormat(current.value, current.selectionStart, current.selectionEnd, conflict.prefix, conflict.suffix);
    }
  }

  return toggleFormat(current.value, current.selectionStart, current.selectionEnd, marker.prefix, marker.suffix);
};
