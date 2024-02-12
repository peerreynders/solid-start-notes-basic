// file: src/lib/date-time.ts

const defaultOptionsBriefDateFormat: Intl.ResolvedDateTimeFormatOptions = {
	locale: 'en-GB',
	timeZone: 'UTC',
	numberingSystem: 'latn',
	calendar: 'gregory',
	hour12: false,
};

export type FormatFn = (
	epochTimestamp: number
) => [local: string, utcIso: string];

function makeNoteDateFormat({
	locale,
	timeZone,
	hour12,
} = defaultOptionsBriefDateFormat) {
	const display = Intl.DateTimeFormat(locale, {
		timeZone,
		hour12,
		dateStyle: 'medium',
		timeStyle: 'short',
	});

	const format: FormatFn = function format(epochTimestamp: number) {
		const dateTime = new Date(epochTimestamp);
		return [display.format(dateTime), dateTime.toISOString()];
	};
	return format;
}

function makeBriefDateFormat({
	locale,
	timeZone,
	hour12,
} = defaultOptionsBriefDateFormat) {
	const dateOnly = Intl.DateTimeFormat(locale, {
		timeZone,
		hour12,
		dateStyle: 'short',
	});
	const timeOnly = Intl.DateTimeFormat(locale, {
		timeZone,
		hour12,
		timeStyle: 'short',
	});
	let today = new Date();

	return function format(epochTimestamp: number, resetToday = false) {
		if (resetToday) today = new Date();

		const dateTime = new Date(epochTimestamp);
		const display =
			dateTime.getDate() === today.getDate() &&
			dateTime.getMonth() === today.getMonth() &&
			dateTime.getFullYear() === today.getFullYear()
				? timeOnly.format(dateTime)
				: dateOnly.format(dateTime);
		// TS always infers arrays, not tuples
		const result: [string, string] = [display, dateTime.toISOString()];
		return result;
	};
}

function localizeFormat(
	format: FormatFn,
	timeAncestor: HTMLElement | undefined
): void {
	if (!(timeAncestor instanceof HTMLElement))
		throw new Error('Unsuitable ancestor element');

	const time = timeAncestor.querySelector('time');
	if (!(time instanceof HTMLTimeElement))
		throw new Error('Unable to locate time element under specified ancestor');

	const current = time.textContent;
	if (!current) return;
	// i.e. nothing to do (CSR waiting for async content)

	const epochTimestamp = Date.parse(time.dateTime);
	const [local] = format(epochTimestamp);
	if (current !== local) time.textContent = local;
}

export { localizeFormat, makeBriefDateFormat, makeNoteDateFormat };
