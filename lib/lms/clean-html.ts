/** Strips scripts, iframes, forms, inline handlers and unsafe links from lesson HTML before it is shown. */
export function cleanHtml(html: string): string {
  return html
    .replace(/<(\/?)h4\b/gi, "<$1h3") // lessons sit under an h2: an h4 would skip a heading level
    .replace(/<\s*(script|iframe|object|embed|style|link|meta|base|form)\b[\s\S]*?(<\s*\/\s*\1\s*>|$)/gi, "")
    .replace(/<\s*(script|iframe|object|embed|style|link|meta|base|form)\b[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src|xlink:href)\s*=\s*("|')\s*(javascript|data|vbscript):[^"']*\2/gi, '$1=$2#$2');
}
