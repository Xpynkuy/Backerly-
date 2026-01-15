export function formatDataTime(
  iso: string,
  locale: string = navigator.language
): string {
  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) return iso;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}
