/** Extract Q&A blocks after a "Frequently Asked…" H2 until horizontal rule `---` or next H2 at section level. */
export function extractMarkdownFaqs(body: string): { q: string; a: string }[] {
  const m = body.match(/^##\s+Frequently Asked[^\n]*\n([\s\S]*?)(?=\n---\n|\n##\s+(?!#))/im);
  const section = m?.[1];
  if (!section) return [];

  const blocks = section
    .split(/^###\s+/m)
    .map((b) => b.trim())
    .filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split('\n');
    const q = lines[0]?.trim() ?? '';
    const a = lines.slice(1).join('\n').trim();
    return { q, a };
  });
}

/** Strip markdown links and emphasis for FAQ schema text. */
export function plainTextFromMarkdownChunk(text: string): string {
  return text
    .replace(/\[(.*?)\]\([^)]*\)/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/(?<![*])\*(?!\*)([^*]+)\*(?!\*)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
