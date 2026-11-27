// Brand Gradient: Royal Plum (#35152F) -> Rich Berry (#A83E68) -> Champagne Gold (#D9A441)
export const BRAND_GRADIENT = 'from-[#35152F] via-[#A83E68] to-[#D9A441]';

export const brandGradient = (value) =>
  !value || /violet|indigo|purple|fuchsia|primary|teal/.test(value) ? BRAND_GRADIENT : value;
