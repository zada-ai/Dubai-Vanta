// Older hero slides / promo banners were saved with the template's violet-indigo gradients.
// Map those (and empty values) to the store's own brand gradient; keep any other colour the admin picked.
export const BRAND_GRADIENT = 'from-primary-700 via-primary-800 to-primary-950';

export const brandGradient = (value) =>
  !value || /violet|indigo|purple|fuchsia/.test(value) ? BRAND_GRADIENT : value;
