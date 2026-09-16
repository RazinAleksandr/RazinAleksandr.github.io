/**
 * Inline-only markdown for short strings in data files (news, blurbs).
 *
 * Supports **bold**, *italic*, `code` and [text](href). Deliberately tiny —
 * this is for one-line copy, not documents; blog posts go through MDX.
 * Input is escaped first, so data-file text can never inject markup.
 */

const ESC: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function inlineMd(src: string): string {
  let s = src.replace(/[&<>"']/g, (c) => ESC[c]);

  // [text](href) — only http(s), mailto and in-site paths
  s = s.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|\/[^\s)]*)\)/g,
    (_m, text: string, href: string) => {
      const ext = /^https?:/.test(href);
      const attrs = ext ? ' target="_blank" rel="noopener"' : "";
      return `<a href="${href}"${attrs}>${text}</a>`;
    }
  );

  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");

  return s;
}
