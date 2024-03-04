// @ts-check
// file: src/date-time.js

/** @type { Intl.ResolvedDateTimeFormatOptions } */
const defaultOptionsBriefDateFormat = {
	locale: 'en-GB',
	timeZone: 'UTC',
	numberingSystem: 'latn',
	calendar: 'gregory',
	hour12: false,
};

/** @typedef { (epochTimestamp: number) => [local: string, utcIso: string] } FormatFn */

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

	/** @type { FormatFn } */
	const format = function format(epochTimestamp) {
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

	/** @type { FormatFn } */
	const format = function format(epochTimestamp, resetToday = false) {
		if (resetToday) today = new Date();

		const dateTime = new Date(epochTimestamp);
		const display =
			dateTime.getDate() === today.getDate() &&
			dateTime.getMonth() === today.getMonth() &&
			dateTime.getFullYear() === today.getFullYear()
				? timeOnly.format(dateTime)
				: dateOnly.format(dateTime);

		return [display, dateTime.toISOString()];
	};

	return format;
}

/**
 * @param { FormatFn } format
 * @param { HTMLElement | undefined } timeAncestor
 * @returns void
 */
/*
function localizeFormat(
	format,
	timeAncestor
) {
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
*/
export { /* localizeFormat, */ makeBriefDateFormat, makeNoteDateFormat };
