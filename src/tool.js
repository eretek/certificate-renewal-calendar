/*! Eretek Online Araçlar #66 — Sertifika Envanteri ve Yenileme Takvimi */
ERT.def('66', {
	pd: function (s) {
		var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s) || null; if (m) { return Date.UTC(+m[1], +m[2] - 1, +m[3]); }
		m = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(s); if (m) { return Date.UTC(+m[3], +m[2] - 1, +m[1]); }
		return NaN;
	},
	run: function (v, c) {
		var P = ERT.tools['66'].pd, r = c.csv(v.csv, 'csv', 5000), H = r.head, col = function (n) { return ERT.csv.col(H, n); }, D = 86400000;
		var iN = col(['name', 'cert', 'sertifika', 'host']), iE = col(['not_after', 'expires', 'expiry', 'bitis', 'ablauf']), iO = col(['owner', 'sorumlu', 'verantwortlich']), iH = col(['host', 'hosts', 'domain']), iI = col(['issuer', 'ca', 'saglayici']);
		if (iN < 0 || iE < 0) { throw c.fe('csv', 'col', { c: 'name, not_after' }); }
		var t0 = new Date(); var ref = v.ref ? Date.parse(v.ref + 'T00:00:00Z') : Date.UTC(t0.getFullYear(), t0.getMonth(), t0.getDate()), lead = v.lead === null || v.lead === undefined ? 30 : v.lead;
		var list = r.rows.map(function (x, i) { var e = P(x[iE]); if (isNaN(e) || !x[iN]) { throw c.fe('csv', 'row', { r: i + 2 }); } return { n: x[iN], e: e, o: iO >= 0 ? x[iO] : '', h: iH >= 0 && iH !== iN ? x[iH] : '', is: iI >= 0 ? x[iI] : '', d: Math.round((e - ref) / D) }; });
		list.sort(function (a, b) { return a.e - b.e; });
		var cnt = { exp: 0, due: 0, ok: 0 }, rows = [], cls = [], ev = [];
		list.forEach(function (x) {
			var st = x.d < 0 ? 'exp' : (x.d <= lead ? 'due' : 'ok'); cnt[st]++;
			var rem = x.e - lead * D;
			rows.push([x.n, x.h || '–', x.is || '–', x.o || '–', new Date(x.e).toISOString().slice(0, 10), x.d, new Date(Math.max(rem, ref)).toISOString().slice(0, 10), c.t('s_' + st)]);
			cls.push(st === 'exp' ? 'err' : (st === 'due' ? 'warn' : 'ok'));
			if (x.d >= 0) {
				ev.push({ allDay: true, start: new Date(Math.max(rem, ref)), title: c.t('evRenew', { n: x.n }), desc: c.t('evDesc', { n: x.n, d: new Date(x.e).toISOString().slice(0, 10), o: x.o || '–' }), uid: 'ert66-r-' + x.n.replace(/[^A-Za-z0-9.-]/g, '') + '-' + x.e + '@eretek.com' });
				ev.push({ allDay: true, start: new Date(x.e), title: c.t('evExp', { n: x.n }), uid: 'ert66-e-' + x.n.replace(/[^A-Za-z0-9.-]/g, '') + '-' + x.e + '@eretek.com' });
			}
		});
		var cols = [c.t('c_n'), c.t('c_h'), c.t('c_i'), c.t('c_o'), c.t('c_e'), c.t('c_d'), c.t('c_r'), c.t('c_s')];
		var msgs = [];
		if (cnt.exp) { msgs.push(['err', c.t('mExp', { n: cnt.exp })]); }
		if (cnt.due) { msgs.push(['warn', c.t('mDue', { n: cnt.due, l: lead })]); }
		if (!cnt.exp && !cnt.due) { msgs.push(['ok', c.t('mOk', { l: lead })]); }
		msgs.push(['info', c.t('ics')], ['info', c.t('ref', { d: new Date(ref).toISOString().slice(0, 10) })]);
		return { big: c.t('big', { e: cnt.exp, d: cnt.due, t: list.length }), msgs: msgs, tables: [{ cols: cols, rows: rows, cls: cls }], x: { csv: { name: 'certificate-renewals', cols: cols, rows: rows }, ics: ev.length ? { name: 'certificate-renewals', cal: c.t('cal'), events: ev } : null }, v: { expired: cnt.exp, due: cnt.due, ok: cnt.ok, first: list[0].n } };
	}
});
