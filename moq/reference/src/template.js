// @ts-check
// file: src/template.js
/**
 * @param { Document } document
 * @param { string } id
 */
function contentById(document, id) {
	const template = document.querySelector(`#${id}`);
	if (!(template instanceof HTMLTemplateElement))
		throw new Error(`Can't find template for ID "${id}"`);

	const content = template.content.firstElementChild;
	if (!(content instanceof HTMLElement))
		throw new Error(`Invalid root for template ID "${id}"`);

	return content;
}

/**
 * @param { Document } document
 * @param { string } id
 */
function contentItemPairById(document, id) {
	const content = contentById(document, id);

	const item = content.firstElementChild;
	if (!(item instanceof HTMLLIElement))
		throw new Error(`Template ID "${id}" does not contain list item`);

	content.removeChild(item);
	return [content, item];
}

export { contentById, contentItemPairById };
