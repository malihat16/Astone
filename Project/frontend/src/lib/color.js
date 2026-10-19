const ALIASES = { sky: 'skyblue', forest: 'forestgreen', sand: 'tan', mustard: 'goldenrod', charcoal: '#36454f', cream: '#f3e9d2', rose: '#e8a0b0', lilac: '#c8a2c8', olive: 'olive', mint: '#98d8b0', rust: '#b7410e', burgundy: '#800020', denim: '#3b5b8c' };

/** Turn a colour name a seller types ("Navy", "Forest green") into a hex code, or null if unknown. */
export function cssColorToHex(name) {
  if (!name || typeof document === 'undefined') return null;
  const key = name.trim().toLowerCase();
  const candidates = [ALIASES[key], key.replace(/\s+/g, ''), ALIASES[key.split(/\s+/).pop()], key.split(/\s+/).pop()].filter(Boolean);
  const ctx = document.createElement('canvas').getContext?.('2d');
  if (!ctx) return null;
  for (const candidate of candidates) {
    ctx.fillStyle = '#010203';
    ctx.fillStyle = candidate;
    const value = ctx.fillStyle;
    if (value !== '#010203') return value.startsWith('#') ? value.toUpperCase() : null;
  }
  return null;
}
