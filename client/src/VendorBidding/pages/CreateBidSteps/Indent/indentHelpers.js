// Shared helpers for the compact "Indents" step (lot rail + workspace + table).

/* ───────────── Indent field accessors ───────────── */

export const getIndentCategory = (ind) => ind.category || ind.indentType || 'Other';

export const getDeptName = (ind) =>
  (typeof ind.department === 'object' ? ind.department?.name : ind.department) || '-';

export const getUomName = (ind) =>
  (typeof ind.uom === 'object' ? ind.uom?.name : ind.uom) || '';

// Case-insensitive so "YARN", "Yarn" and "Dyes and chemicals" all resolve.
export const getTypeKey = (category = '') => {
  const c = String(category).toUpperCase();
  if (c.includes('YARN')) return 'yarn';
  if (c.includes('FABRIC')) return 'fabric';
  if (c.includes('SPARE')) return 'spares';
  if (c.includes('DYE')) return 'dyes';
  return 'general';
};

/* ───────────── Vendors & documents ───────────── */

export const vendorKey = (v) => String(v.id ?? v.name ?? v.label);
export const vendorName = (v) => v.label || v.name || 'Vendor';

// 'upd' = at least one doc needs an update, 'ok' = all up to date,
// 'rev' = docs present but some still under review, 'none' = no docs yet.
export const docState = (docs = []) => {
  if (docs.some((d) => d.status === 'Update Needed')) return 'upd';
  if (docs.length === 0) return 'none';
  if (docs.every((d) => d.status === 'Up to Date')) return 'ok';
  return 'rev';
};

// Glyph + colour + words, so status never relies on colour alone.
export const DOC_STATE_META = {
  upd: { glyph: '▲', cls: 'text-amber-700', label: 'update needed' },
  ok: { glyph: '●', cls: 'text-emerald-700', label: 'documents ready' },
  rev: { glyph: '◐', cls: 'text-blue-700', label: 'in review' },
  none: { glyph: '○', cls: 'text-slate-500', label: 'no documents' },
};

export const getIndentVendorDocs = (ind) =>
  (ind.vendors || []).reduce((all, v) => all.concat(v.documents || []), []);

export const getIndentDocsCount = (ind) =>
  getIndentVendorDocs(ind).length + (ind.commonDocuments || []).length;

export const indentNeedsUpdate = (ind) =>
  getIndentVendorDocs(ind).some((d) => d.status === 'Update Needed');

export const countUpdateNeeded = (indents = []) =>
  indents.reduce(
    (n, ind) => n + getIndentVendorDocs(ind).filter((d) => d.status === 'Update Needed').length,
    0
  );

// Unique vendors across a lot's indents, in first-seen order.
export const getLotVendors = (indents = []) => {
  const map = new Map();
  indents.forEach((ind) =>
    (ind.vendors || []).forEach((v) => {
      const key = vendorKey(v);
      const entry = map.get(key) || { key, name: vendorName(v), count: 0, docs: [] };
      entry.count += 1;
      entry.docs = entry.docs.concat(v.documents || []);
      map.set(key, entry);
    })
  );
  return Array.from(map.values());
};

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/* ───────────── Table columns per indent type ───────────── */

const dash = (v) => (v === undefined || v === null || v === '' ? '-' : String(v));

const qtyText = (ind) => `${Number(ind.qty || 0).toLocaleString()} ${getUomName(ind)}`.trim();

const formatDate = (v) => {
  if (!v || v === '-') return '-';
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    }
  }
  return s;
};

const col = (label, width, value, opts = {}) => ({ label, width, value, ...opts });

const DEPT = col('Dept', '100px', getDeptName);
const item = (width = 'minmax(130px,1.2fr)') =>
  col('Item', width, (i) => dash(i.item_name || i.id), { strong: true });
const QTY = col('Qty', '104px', qtyText, { align: 'right' });
const REQUIRED = col('Required by', '88px', (i) => formatDate(i.requiredBy));

export const TYPE_COLUMNS = {
  all: [
    col('Type', '130px', getIndentCategory),
    DEPT,
    item('minmax(150px,1.3fr)'),
    QTY,
    REQUIRED,
  ],
  yarn: [
    DEPT,
    item(),
    col('Count', '64px', (i) => dash(i.count)),
    col('Blend', '116px', (i) => dash(i.blend)),
    col('Ply', '64px', (i) => dash(i.ply)),
    col('Shade', '112px', (i) => dash(i.shade)),
    QTY,
    REQUIRED,
  ],
  fabric: [
    DEPT,
    item('minmax(120px,1fr)'),
    col('Construction', 'minmax(130px,1.1fr)', (i) => dash(i.construction)),
    col('GSM', '56px', (i) => dash(i.gsm)),
    col('Width', '64px', (i) => dash(i.width)),
    col('Shade', '100px', (i) => dash(i.shade)),
    QTY,
    REQUIRED,
  ],
  spares: [
    DEPT,
    item('minmax(110px,1fr)'),
    col('Machine', 'minmax(140px,1.2fr)', (i) => dash(i.machine)),
    col('Part no', '88px', (i) => dash(i.partNo)),
    col('Make', '112px', (i) => dash(i.make)),
    QTY,
    REQUIRED,
  ],
  dyes: [
    DEPT,
    item(),
    col('CI / CAS', '100px', (i) => dash(i.ciCas || i.code)),
    col('Strength', '80px', (i) => dash(i.strength)),
    col('Hazard', '110px', (i) => dash(i.hazard)),
    QTY,
    REQUIRED,
  ],
  general: [
    DEPT,
    item('minmax(130px,1fr)'),
    col('Specification', 'minmax(180px,1.6fr)', (i) => dash(i.spec)),
    QTY,
    REQUIRED,
  ],
};

// S.no | Indent | …type columns… | Vendors | Docs | Actions
export const buildGridTemplate = (typeKey) =>
  [
    '40px',
    '96px',
    ...(TYPE_COLUMNS[typeKey] || TYPE_COLUMNS.all).map((c) => c.width),
    'minmax(160px,1.5fr)',
    '64px',
    '116px',
  ].join(' ');

// "5,600 kg · 4 nos" style totals for the table footer.
export const sumQtyByUom = (indents = []) => {
  const totals = new Map();
  indents.forEach((ind) => {
    const uom = getUomName(ind) || '';
    totals.set(uom, (totals.get(uom) || 0) + Number(ind.qty || 0));
  });
  return Array.from(totals.entries())
    .map(([uom, total]) => `${total.toLocaleString()} ${uom}`.trim())
    .join(' · ');
};
