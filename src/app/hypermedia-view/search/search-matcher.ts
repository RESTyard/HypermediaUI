export interface MatchRange {
  start: number;
  end: number;
}

export type TextMatcher = (text: string) => MatchRange[];

export type MatcherResult =
  | { kind: 'none' }
  | { kind: 'invalid', error: string }
  | { kind: 'valid', match: TextMatcher };

export function createMatcher(query: string, caseSensitive: boolean, regex: boolean): MatcherResult {
  if (!query) {
    return { kind: 'none' };
  }

  let pattern: RegExp;
  try {
    pattern = new RegExp(regex ? query : escapeRegExp(query), caseSensitive ? 'g' : 'gi');
  } catch (e) {
    return { kind: 'invalid', error: e instanceof Error ? e.message : String(e) };
  }

  return {
    kind: 'valid',
    match: (text: string) => {
      const ranges: MatchRange[] = [];
      pattern.lastIndex = 0;
      let result: RegExpExecArray | null;
      while ((result = pattern.exec(text)) !== null) {
        if (result[0].length === 0) {
          // zero-length matches (e.g. "a*") would never advance and carry nothing to highlight
          pattern.lastIndex++;
          continue;
        }
        ranges.push({ start: result.index, end: result.index + result[0].length });
      }
      return ranges;
    },
  };
}

export interface TextSegment {
  text: string;
  isMatch: boolean;
}

export function splitByRanges(text: string, ranges: MatchRange[]): TextSegment[] {
  const segments: TextSegment[] = [];
  let position = 0;
  for (const range of ranges) {
    if (range.start > position) {
      segments.push({ text: text.substring(position, range.start), isMatch: false });
    }
    segments.push({ text: text.substring(range.start, range.end), isMatch: true });
    position = range.end;
  }
  if (position < text.length) {
    segments.push({ text: text.substring(position), isMatch: false });
  }
  return segments;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
