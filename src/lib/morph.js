/*
 * natemoo-re/micromorph@0.4.5
 * ./dist/index.js
 *
 * Workaround because of vite build errors
 * https://github.com/natemoo-re/micromorph/blob/main/LICENSE
 */
/* global document */
var T = (e) => (t, r) => t[`node${e}`] === r[`node${e}`],
	b = T('Name'),
	C = T('Type'),
	g = T('Value');
function M(e, t) {
	if (e.attributes.length === 0 && t.attributes.length === 0) return [];
	let r = [],
		n = new Map(),
		o = new Map();
	for (let s of e.attributes) n.set(s.name, s.value);
	for (let s of t.attributes) {
		let a = n.get(s.name);
		s.value === a
			? n.delete(s.name)
			: (typeof a < 'u' && n.delete(s.name), o.set(s.name, s.value));
	}
	for (let s of n.keys()) r.push({ type: 5, name: s });
	for (let [s, a] of o.entries()) r.push({ type: 4, name: s, value: a });
	return r;
}
function N(e, t = !0) {
	let r = `${e.localName}`;
	for (let { name: n, value: o } of e.attributes)
		(t && n.startsWith('data-')) || (r += `[${n}=${o}]`);
	return (r += e.innerHTML), r;
}
function h(e) {
	switch (e.tagName) {
		case 'BASE':
		case 'TITLE':
			return e.localName;
		case 'META': {
			if (e.hasAttribute('name'))
				return `meta[name="${e.getAttribute('name')}"]`;
			if (e.hasAttribute('property'))
				return `meta[name="${e.getAttribute('property')}"]`;
			break;
		}
		case 'LINK': {
			if (e.hasAttribute('rel') && e.hasAttribute('href'))
				return `link[rel="${e.getAttribute('rel')}"][href="${e.getAttribute('href')}"]`;
			if (e.hasAttribute('href'))
				return `link[href="${e.getAttribute('href')}"]`;
			break;
		}
	}
	return N(e);
}
function x(e) {
	let [t, r = ''] = e.split('?');
	return `${t}?t=${Date.now()}&${r.replace(/t=\d+/g, '')}`;
}
function c(e) {
	if (e.nodeType === 1 && e.hasAttribute('data-persist')) return e;
	if (e.nodeType === 1 && e.localName === 'script') {
		let t = document.createElement('script');
		for (let { name: r, value: n } of e.attributes)
			r === 'src' && (n = x(n)), t.setAttribute(r, n);
		return (t.innerHTML = e.innerHTML), t;
	}
	return e.cloneNode(!0);
}
function R(e, t) {
	if (e.children.length === 0 && t.children.length === 0) return [];
	let r = [],
		n = new Map(),
		o = new Map(),
		s = new Map();
	for (let a of e.children) n.set(h(a), a);
	for (let a of t.children) {
		let i = h(a),
			u = n.get(i);
		u ? N(a, !1) !== N(u, !1) && o.set(i, c(a)) : s.set(i, c(a)), n.delete(i);
	}
	for (let a of e.childNodes) {
		if (a.nodeType === 1) {
			let i = h(a);
			if (n.has(i)) {
				r.push({ type: 1 });
				continue;
			} else if (o.has(i)) {
				let u = o.get(i);
				r.push({ type: 3, attributes: M(a, u), children: I(a, u) });
				continue;
			}
		}
		r.push(void 0);
	}
	for (let a of s.values()) r.push({ type: 0, node: c(a) });
	return r;
}
function I(e, t) {
	let r = [],
		n = Math.max(e.childNodes.length, t.childNodes.length);
	for (let o = 0; o < n; o++) {
		let s = e.childNodes.item(o),
			a = t.childNodes.item(o);
		r[o] = p(s, a);
	}
	return r;
}

/** @typedef {{ type: number, [key: string]: any }} Patch */

/** @param {Node | undefined} e target
 * @param {Node | undefined} t source
 * @returns Patch
 */
function p(e, t) {
	if (!e) return { type: 0, node: c(t) };
	if (!t) return { type: 1 };
	if (C(e, t)) {
		if (e.nodeType === 3) {
			let r = e.nodeValue,
				n = t.nodeValue;
			if (r.trim().length === 0 && n.trim().length === 0) return;
		}
		if (e.nodeType === 1) {
			if (b(e, t)) {
				let r = e.tagName === 'HEAD' ? R : I;
				return { type: 3, attributes: M(e, t), children: r(e, t) };
			}
			return { type: 2, node: c(t) };
		} else
			return e.nodeType === 9
				? p(e.documentElement, t.documentElement)
				: g(e, t)
					? void 0
					: { type: 2, value: t.nodeValue };
	}
	return { type: 2, node: c(t) };
}
function $(e, t) {
	if (t.length !== 0)
		for (let { type: r, name: n, value: o } of t)
			r === 5 ? e.removeAttribute(n) : r === 4 && e.setAttribute(n, o);
}

/**
 * @param { Node } e parent
 * @param { any } t PATCH
 * @param { Node= } r child
 */
async function O(e, t, r) {
	if (!t) return;
	let n;
	switch (
		(e.nodeType === 9
			? ((e = e.documentElement), (n = e))
			: r
				? (n = r)
				: (n = e),
		t.type)
	) {
		case 0: {
			let { node: o } = t;
			e.appendChild(o);
			return;
		}
		case 1: {
			if (!n) return;
			e.removeChild(n);
			return;
		}
		case 2: {
			if (!n) return;
			let { node: o, value: s } = t;
			if (typeof s == 'string') {
				n.nodeValue = s;
				return;
			}
			n.replaceWith(o);
			return;
		}
		case 3: {
			if (!n) return;
			let { attributes: o, children: s } = t;
			$(n, o);
			let a = Array.from(n.childNodes);
			await Promise.all(s.map((i, u) => O(n, i, a[u])));
			return;
		}
	}
}

/**
 * @param { Node } target
 * @param { Node } source
 * @return Promise<void>
 */
function P(target, source) {
	let r = p(target, source);
	return O(target, r);
}
export { P as default, p as diff, O as patch };
