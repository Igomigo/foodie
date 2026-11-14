const palettes = [
  { background: "#243a2d", accent: "#73876b", foreground: "#f8f3df" },
  { background: "#923f2c", accent: "#d88763", foreground: "#fff0dc" },
  { background: "#553649", accent: "#ab7e87", foreground: "#fff0e5" },
  { background: "#283b56", accent: "#6885a0", foreground: "#f5ecd9" },
  { background: "#75612f", accent: "#c6a768", foreground: "#fff5dc" },
  { background: "#315e5c", accent: "#7ca5a0", foreground: "#f0eee0" },
];

export function kitchenPalette(name: string) {
  let total = 0;
  for (const character of name) total += character.charCodeAt(0);
  return palettes[total % palettes.length];
}
