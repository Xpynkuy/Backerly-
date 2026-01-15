export function getDateLocale(i18nLang: string): string {
  const lang = (i18nLang || "en").toLowerCase();

  if (lang.startsWith("ru")) return "ru-RU";
  if (lang.startsWith("en")) return "en-US";

  return navigator.language || "en-US";
}
