// Returns current datetime in ISO format: "yyyy-MM-ddTHH:mm"
export function getCurrentDateTimeISO(): string {
    const now = new Date();
    now.setSeconds(0, 0);
    return now.toISOString().slice(0, 16);
}

// Returns current datetime in local format: "yyyy-MM-ddTHH:mm"
export function getCurrentDateTimeLocal(): string {
    const now = new Date();
    now.setSeconds(0, 0);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Returns tomorrow's datetime at the same hour as now
export function getTomorrowDateTimeLocal(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setSeconds(0, 0);
    return tomorrow.toISOString().slice(0, 16);
}

// Returns a datetime X minutes from now
export function getFutureDateTimeISO(minutesAhead: number = 5): string {
    const future = new Date();
    future.setMinutes(future.getMinutes() + minutesAhead);
    future.setSeconds(0, 0);
    return future.toISOString().slice(0, 16);
}

// Returns a default scheduled datetime 6 hours from now in local format: "yyyy-MM-ddTHH:mm"
export function getDefaultScheduledDateTimeLocal(): string {
    const now = new Date();
    now.setHours(now.getHours() + 6);
    now.setSeconds(0, 0);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Convert local "yyyy-MM-ddTHH:mm" string to UTC ISO string
export function localDateTimeToUTC(localDateTime: string): string {
    // e.g. "2025-06-15T10:00"
    const localDate = new Date(localDateTime);
    return localDate.toISOString(); // returns UTC ISO string, e.g. "2025-06-15T04:00:00.000Z"
}

// Convert UTC ISO string to local "yyyy-MM-ddTHH:mm" format
export function utcToLocalDateTime(utcString: string): string {
    if (!utcString) return '';
    const date = new Date(utcString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

//Format to string readable
export function formatLocalDateTime(isoString: string): string {
  if (!isoString) return '';

  const date = new Date(isoString);
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',    // Jun
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true       // 12-hour format with AM/PM
  }).format(date);
}


export function getMaxDateTimeLocal(): string {
    const now = new Date();
    now.setFullYear(now.getFullYear() + 3000);
    now.setSeconds(0, 0);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}



export function getMinDateTimeLocal(): string {
    const now = new Date();
    now.setFullYear(now.getFullYear() - 3000);
    now.setSeconds(0, 0);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}



// format to isoMysqldatetime
export function isoToMySQLDatetime(isoString: string): string {
    // "2025-06-16T15:43:00.000Z" => "2025-06-16 15:43:00"
    return isoString.replace('T', ' ').replace('Z', '').slice(0, 19);
}
