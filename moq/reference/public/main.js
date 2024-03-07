!(function () {
	'use strict';
	const e = document.getElementById('note-data');
	if (!(e instanceof HTMLScriptElement))
		throw new Error('Unable to locate "note-data" JSON content.');
	const t = JSON.parse(e.text);
	!Array.isArray(t) || t.length < 1 || (t[0].updatedAt = Date.now() - 72e5);
	const n = t.reduce((e, t) => e.set(t.id, t), new Map());
	function o(e, t) {
		const n = e.querySelector(`#${t}`);
		if (!(n instanceof HTMLTemplateElement))
			throw new Error(`Can't find template for ID "${t}"`);
		const o = n.content.firstElementChild;
		if (!(o instanceof HTMLElement))
			throw new Error(`Invalid root for template ID "${t}"`);
		return o;
	}
	const r = {
		locale: 'en-GB',
		timeZone: 'UTC',
		numberingSystem: 'latn',
		calendar: 'gregory',
		hour12: !1,
	};
	const i = 'Untitled';
	const c = (function ({ locale: e, timeZone: t, hour12: n } = r) {
			const o = Intl.DateTimeFormat(e, {
				timeZone: t,
				hour12: n,
				dateStyle: 'medium',
				timeStyle: 'short',
			});
			return function (e) {
				const t = new Date(e);
				return [o.format(t), t.toISOString()];
			};
		})(Intl.DateTimeFormat().resolvedOptions()),
		s = (function (e) {
			const t = o(e, 'note-preview');
			return function (e) {
				const n = t.cloneNode(!0),
					o = n.querySelector('.text-with-markdown');
				return o instanceof HTMLElement && (o.innerHTML = e), n;
			};
		})(document),
		a = (function (e, t) {
			const n = o(e, 'note-edit'),
				r = o(e, 'note-edit__skeleton');
			return function (o, c) {
				if (c) return r.cloneNode(!0);
				const s = n.cloneNode(!0),
					a = s.querySelector('#note-title-input');
				a instanceof HTMLInputElement && (a.value = o ? o.title : i);
				const d = s.querySelector('.note-title');
				d instanceof HTMLElement &&
					(d.append(e.createTextNode(o ? o.title : i)),
					d.insertAdjacentElement('afterend', t(o ? o.html : '')));
				const l = s.querySelector('.note-editor-delete'),
					u = s.querySelector('.note-editor-done');
				if (o) {
					const e = s.querySelector('#note-body-input');
					e instanceof HTMLTextAreaElement && (e.textContent = o.body);
				}
				if (u instanceof HTMLButtonElement && l instanceof HTMLButtonElement) {
					o || l.remove();
					const t = o
						? (e) => {
								u.disabled = l.disabled = e.detail;
							}
						: (e) => {
								u.disabled = e.detail;
							};
					e.addEventListener('moq-busy', t);
				}
				return s;
			};
		})(document, s);
	const d = 'flash',
		l = (function ({ locale: e, timeZone: t, hour12: n } = r) {
			const o = Intl.DateTimeFormat(e, {
					timeZone: t,
					hour12: n,
					dateStyle: 'short',
				}),
				i = Intl.DateTimeFormat(e, {
					timeZone: t,
					hour12: n,
					timeStyle: 'short',
				});
			let c = new Date();
			return function (e, t = !1) {
				t && (c = new Date());
				const n = new Date(e);
				return [
					n.getDate() === c.getDate() &&
					n.getMonth() === c.getMonth() &&
					n.getFullYear() === c.getFullYear()
						? i.format(n)
						: o.format(n),
					n.toISOString(),
				];
			};
		})(Intl.DateTimeFormat().resolvedOptions()),
		u = (e) => 1 == (1 & e),
		f = (e) => 2 === e,
		m = (e) => 3 === e;
	function p(e) {
		const t = o(e, 'sidebar-note');
		return function (n, o = 0) {
			const r = t.cloneNode(!0);
			if (r.querySelector('header') instanceof HTMLElement) {
				const p = r.querySelector('strong');
				if (p instanceof HTMLElement) {
					const y = e.createTextNode(n.title);
					p.appendChild(y);
				}
				const h = r.querySelector('small');
				if (h instanceof HTMLElement) {
					const [E] = l(n.updatedAt),
						v = e.createTextNode(E);
					h.appendChild(v);
				}
			}
			const i = r.querySelector('.sidebar-note-excerpt');
			if (i instanceof HTMLElement) {
				const T = e.createTextNode(n.excerpt);
				i.replaceChildren(T);
			}
			const c = r.querySelector('.sidebar-note-toggle-expand'),
				s = [];
			if (c instanceof HTMLButtonElement) {
				const L = c.querySelector('[alt="expand" i]'),
					g = c.querySelector('[alt="collapse" i]');
				L instanceof HTMLElement &&
					((s[0] = L), g instanceof HTMLElement && (s[1] = g));
			}
			i &&
				c &&
				2 === s.length &&
				(c.removeChild(s[1]),
				r.removeChild(i),
				c.addEventListener('click', () => {
					if (!i.parentNode)
						return (
							r.classList.add('note-expanded'),
							r.append(i),
							void c.replaceChild(s[1], s[0])
						);
					c.replaceChild(s[0], s[1]),
						r.removeChild(i),
						r.classList.remove('note-expanded');
				}));
			const a = r.querySelector('.sidebar-note-open');
			if (a instanceof HTMLButtonElement) {
				const S = u(o),
					w = f(o) ? 'var(--gray-80)' : S ? 'var(--tertiary-blue)' : void 0,
					b = S ? '1px solid var(--primary-border)' : void 0;
				w && (a.style.backgroundColor = w), b && (a.style.border = b);
			}
			if (m(o)) {
				function N() {
					r.classList.add(d),
						e.dispatchEvent(new CustomEvent('moq-busy', { detail: !0 }));
				}
				function q(t) {
					if (t.animationName === d)
						return (
							r.classList.remove(d),
							e.dispatchEvent(new CustomEvent('moq-busy', { detail: !1 })),
							void setTimeout(N, 3e3)
						);
				}
				r.addEventListener('animationend', q), N();
			}
			return r;
		};
	}
	const h = (function (e) {
			const t = o(e, 'app');
			return function ({ newButton: e, note: n, noteList: o, searchField: r }) {
				const i = t.cloneNode(!0),
					c = i.querySelector('.sidebar-menu');
				if (!c)
					throw new Error('Failed to find ".sidebar-menu" in "app" content');
				c.append(r), c.append(e);
				const s = i.querySelector('nav');
				if (!s) throw new Error('Failed to find "nav" in "app" content');
				s.append(o);
				const a = i.querySelector('.note-viewer');
				if (!a)
					throw new Error('Failed to find "note-viewer" in "app" content');
				return a.append(n), i;
			};
		})(document),
		y = (function (e) {
			const t = o(e, 'edit-button');
			return function (n, o = !1, r = !1) {
				const i = t.cloneNode(!0),
					c = e.createTextNode(n);
				return (
					i.appendChild(c),
					o &&
						i.classList.replace('edit-button--solid', 'edit-button--outline'),
					r && i.setAttribute('disabled', ''),
					i instanceof HTMLButtonElement &&
						e.addEventListener('moq-busy', (e) => (i.disabled = e.detail)),
					i
				);
			};
		})(document),
		E = (function (e, t) {
			const n = o(e, 'note'),
				r = o(e, 'note__skeleton'),
				i = o(e, 'note__none');
			return function (o, d = 0) {
				const l = ((e) => 2 == (2 & e))(d);
				if (((e) => 1 == (1 & e))(d)) return a(o, l);
				if (l) return r.cloneNode(!0);
				if (!o) return i.cloneNode(!0);
				const u = n.cloneNode(!0),
					f = u.querySelector('.note-title');
				if (f instanceof HTMLElement) {
					const t = e.createTextNode(o.title);
					f.appendChild(t);
				}
				const m = u.querySelector('.note-updated-at');
				if (m instanceof HTMLElement) {
					const e = m.firstChild;
					if (e instanceof Text) {
						const [t] = c(o.updatedAt);
						e.nodeValue = e.nodeValue + ' ' + t;
					}
				}
				const p = u.querySelector('.note-menu');
				return (
					p instanceof HTMLElement && p.append(t('Edit')),
					u.append(s(o.html)),
					u
				);
			};
		})(document, y),
		v = (function (e) {
			const t = p(e),
				n = o(e, 'note-list__skeleton'),
				r = o(e, 'note-list__empty'),
				[i, c] = (function (e, t) {
					const n = o(e, t),
						r = n.firstElementChild;
					if (!(r instanceof HTMLLIElement))
						throw new Error(`Template ID "${t}" does not contain list item`);
					return n.removeChild(r), [n, r];
				})(e, 'note-list');
			return function (e, o, s, a = !1, d = !1) {
				if (a) return n.cloneNode(!0);
				const [l, u] =
					'string' == typeof e
						? [void 0, e.length > 0 ? e : void 0]
						: [Array.isArray(e) && e.length > 0 ? e : void 0, void 0];
				if (!l) {
					const e = r.cloneNode(!0);
					return (
						(e.textContent = u
							? `Couldn't find any notes titled "${u}"`
							: 'No notes created yet!'),
						e
					);
				}
				const f = i.cloneNode(!0),
					m = (function (e, t, n) {
						if (e) {
							const o = t ? 3 : 1;
							return n
								? (t) => (n === t ? 2 : e === t ? o : 0)
								: (t) => (t === e ? o : 0);
						}
						return n ? (e) => (e === n ? 2 : 0) : (e) => 0;
					})(o, d, s);
				for (const e of l) {
					const n = c.cloneNode(!0);
					n.append(t(e, m(e.id))), f.append(n);
				}
				return f;
			};
		})(document),
		T = (function (e) {
			const t = o(e, 'spinner'),
				n = o(e, 'search-field');
			return function (e, o = !1) {
				const r = t.cloneNode(!0),
					i = n.cloneNode(!0);
				if (e) {
					const t = i.querySelector('#sidebar-search-input');
					if (!(t instanceof HTMLInputElement))
						throw new Error(
							'Failed to find "#sidebar-search-input" input in "search-field" content'
						);
					t.value = e;
				}
				return (
					o &&
						(r.classList.add('spinner--active'),
						r.setAttribute('aria-busy', 'true')),
					i.append(r),
					i
				);
			};
		})(document),
		L = (e, t) => (e ? (t ? 3 : 1) : t ? 2 : 0);
	document.title = 'React Notes';
	document.querySelector('body').prepend(
		(function ({
			flushNote: e,
			isEditing: o,
			listLoading: r,
			nextId: i,
			noteId: c,
			search: s,
		}) {
			const a = r
				? void 0
				: (d = (function (e) {
							if (!e) return t;
							const n = e.toLowerCase();
							return t.filter((e) => e.title.toLowerCase().includes(n));
					  })(s)).length > 0
					? d
					: s;
			var d;
			const l = c ? ((u = c), n.get(u)) : void 0;
			var u;
			const f = r || ('string' == typeof i && i.length > 0);
			return h({
				searchField: T(s, f),
				newButton: y('New'),
				noteList: v(a, l?.id, i, r, e),
				note: E(l, L(o, i)),
			});
		})(
			(function (e) {
				const t = e.searchParams,
					n = t.get('moqnextid') ?? void 0,
					o = t.get('location') ?? void 0,
					r = o ? JSON.parse(o) : {},
					i = n && n.length > 0 ? n : void 0,
					c = 'string' == typeof r.selectedId ? r.selectedId : void 0;
				return {
					flushNote: t.has('moqflush'),
					isEditing: 'boolean' == typeof r.isEditing && r.isEditing,
					listLoading: t.has('moqlistload'),
					nextId: i && i !== c ? i : void 0,
					noteId: c,
					search:
						'string' == typeof r.searchText && r.searchText.length > 0
							? r.searchText
							: void 0,
				};
			})(new URL(document.location.href))
		)
	);
})();
