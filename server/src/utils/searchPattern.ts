// User searches are literal text, never executable regular expressions.
export function searchPattern(text: string) {
  return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}
