function toDate(value) {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
}

function padDatePart(value) {
  return String(value).padStart(2, '0');
}

export function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = padDatePart(today.getMonth() + 1);
  const day = padDatePart(today.getDate());

  return `${year}-${month}-${day}`;
}

export function isSameDay(dateA, dateB) {
  if (!dateA || !dateB) {
    return false;
  }

  const firstDate = toDate(dateA);
  const secondDate = toDate(dateB);

  if (Number.isNaN(firstDate.getTime()) || Number.isNaN(secondDate.getTime())) {
    return false;
  }

  return (
    firstDate.getFullYear() === secondDate.getFullYear()
    && firstDate.getMonth() === secondDate.getMonth()
    && firstDate.getDate() === secondDate.getDate()
  );
}

export function getArabicWeekday(date = new Date()) {
  const parsedDate = toDate(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(parsedDate);
}

export function getReadableArabicDate(date = new Date()) {
  const parsedDate = toDate(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsedDate);
}

export function hasDateChanged(savedDate) {
  if (!savedDate) {
    return true;
  }

  return savedDate !== getTodayDate();
}
