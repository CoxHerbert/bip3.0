export const csvToArray = s =>
  (s ?? '')
    .split(',')
    .map(v => `${v}`.trim())
    .filter(Boolean);

export const arrayToCsv = arr =>
  (arr ?? []).filter(v => v !== undefined && v !== null && `${v}`.trim() !== '').join(',');
