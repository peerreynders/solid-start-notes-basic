// file: src/lib/date-time.ts

const defaultOptionsBriefDateFormat: Intl.ResolvedDateTimeFormatOptions = {
	locale: 'en-GB',
	timeZone: 'UTC',
	numberingSystem: 'latn',
	calendar: 'gregory',
	hour12: false,
};

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

	return function format(epochTimestamp: number) {
		const dateTime = new Date(epochTimestamp);
		// TS always infers arrays, not tuples
		const result: [string, string] = [
			display.format(dateTime),
			dateTime.toISOString(),
		];
		return result;
	};
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

export { makeBriefDateFormat, makeNoteDateFormat };
