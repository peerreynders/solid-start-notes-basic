// Date formatting
const LOCALE_DEFAULT = 'en-US';

function makeFormats(maybeLocale?: string) {
  let selectedLocale:string | undefined;

  if (typeof maybeLocale === 'string') {
    selectedLocale = maybeLocale;

  } else if (typeof navigator === 'object') {
    selectedLocale = navigator.languages && navigator.languages.length ? 
    navigator.languages[0] : 
    navigator.language;
  }

  const locale = selectedLocale ?? LOCALE_DEFAULT; 

  const dateOnly = Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
  });

  const timeOnly = Intl.DateTimeFormat(locale, {
    timeStyle: 'short',
  });

  const dateTime = Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return [dateOnly, timeOnly, dateTime];
}

let [dateOnly, timeOnly, dateTime] = makeFormats(LOCALE_DEFAULT);

function setFormats(maybeLocale?: string) {
  [dateOnly, timeOnly, dateTime] = makeFormats(maybeLocale);
}

function formatDateOnly(date: Date): string {
  return dateOnly.format(date);
}

function formatTimeOnly(date: Date): string {
  return timeOnly.format(date);
}

function formatDateTime(date: Date): string {
  return dateTime.format(date);
}

function isToday(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export {
  isToday,
  setFormats,
  formatDateOnly,
  formatTimeOnly,
  formatDateTime
};
