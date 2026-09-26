export const recommendationLabels = {
  adotar: 'Adotar',
  testar: 'Testar',
  acompanhar: 'Acompanhar',
  evitar: 'Evitar por enquanto',
} as const;

export type Recommendation = keyof typeof recommendationLabels;

export function formatDate(date: Date, style: 'short' | 'long' = 'long') {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: style === 'short' ? 'short' : 'long',
    year: 'numeric',
  }).format(date);
}

export function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
