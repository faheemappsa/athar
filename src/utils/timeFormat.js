export function cleanTime(value) {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})/);

  if (!match) return '';

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return '';
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function formatTime12Hour(value) {
  const time = cleanTime(value);

  if (!time) return '';

  const [hoursText, minutesText] = time.split(':');
  const hours = Number(hoursText);
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutesText}`;
}

export function formatDateTime12Hour(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutes}`;
}
