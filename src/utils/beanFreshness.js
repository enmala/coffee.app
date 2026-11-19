function parseCalendarDate(dateString) {
  if (typeof dateString !== 'string') return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) return null;

  const [, yearString, monthString, dayString] = match;
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function getBeanFreshness(roastDate, currentDate = new Date()) {
  const roastDay = parseCalendarDate(roastDate);
  if (!(currentDate instanceof Date) || Number.isNaN(currentDate.getTime()) || !roastDay) return null;

  const today = Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );
  const days = Math.floor((today - roastDay.getTime()) / 86400000);
  if (days < 0) return null;

  const dayLabel = `${days} ${days === 1 ? 'día' : 'días'}`;
  if (days <= 5) {
    return { days, label: `Reposo y desgasificación · ${dayLabel}`, status: 'resting' };
  }
  if (days <= 30) {
    return { days, label: `Ventana óptima · ${dayLabel}`, status: 'optimal' };
  }
  if (days <= 45) {
    return { days, label: `Fuera de ventana óptima · ${dayLabel}`, status: 'past-optimal' };
  }

  return { days, label: `Pérdida progresiva de frescura · ${dayLabel}`, status: 'stale' };
}
