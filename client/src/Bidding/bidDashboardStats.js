// Pure calculations for the admin dashboard. Input: the bid list from useGetBidsQuery.
// Quote counting mirrors BidsReports.jsx (first-seen status per vendor) so both pages agree.

export const STATUS_ORDER = ["DRAFT", "PUBLISHED", "CLOSING", "AWARDED", "CLOSED", "CANCELLED"];
export const CLOSING_SOON_HOURS = 48;
const ATTENTION_NO_QUOTE_HOURS = 72;
const STALE_DRAFT_DAYS = 7;
const HOUR = 1000 * 60 * 60;

const upper = (s) => String(s || "").toUpperCase();
export const getDeadline = (bid) => bid.submissionDeadline || bid.closingDate || null;
export const getBidCode = (bid) => bid.docId || bid.bidNo || `BID-${bid.id}`;

export const getBidVendorStats = (bid) => {
  const indents = (bid.BiddingLots || []).flatMap((l) => l.BiddingIndent || []);
  const vendors = new Map();
  indents.forEach((ind) =>
    (ind.BiddingIndentvendors || []).forEach((v) => {
      const id = v.vendorId || v.id;
      if (id && !vendors.has(id)) vendors.set(id, v.status);
    })
  );
  let quoted = 0;
  vendors.forEach((status) => {
    if (status === "QUOTED" || status === "Submitted") quoted += 1;
  });
  const indentsWithoutVendors = indents.filter((i) => !(i.BiddingIndentvendors || []).length).length;
  return { invited: vendors.size, quoted, indentCount: indents.length, indentsWithoutVendors };
};

export const hoursUntil = (dateStr, now = new Date()) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : (d - now) / HOUR;
};

export const formatTimeLeft = (hours) => {
  if (hours === null) return "No deadline";
  if (hours < 0) return "Overdue";
  if (hours < 1) return "< 1 hour";
  if (hours < 24) return `${Math.floor(hours)}h left`;
  return `${Math.ceil(hours / 24)}d left`;
};

export function computeDashboardStats(bids = [], now = new Date()) {
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0]));
  let quotesIn = 0;
  let vendorsInvited = 0;
  let closingSoon = 0;
  let overdue = 0;
  const closingList = [];
  const attention = [];

  bids.forEach((bid) => {
    const status = upper(bid.status) || "DRAFT";
    if (status in counts) counts[status] += 1;
    const vs = getBidVendorStats(bid);
    const code = getBidCode(bid);
    const title = bid.name || "Untitled Bid";
    const hours = hoursUntil(getDeadline(bid), now);

    if (status === "PUBLISHED" || status === "CLOSING") {
      quotesIn += vs.quoted;
      vendorsInvited += vs.invited;
    }

    if (status === "PUBLISHED") {
      if (hours !== null && hours < 0) overdue += 1;
      if (hours !== null && hours >= 0) {
        closingList.push({ bid, code, title, hours, ...vs });
        if (hours <= CLOSING_SOON_HOURS) closingSoon += 1;
      }
      if (hours !== null && hours >= 0 && hours <= ATTENTION_NO_QUOTE_HOURS && vs.quoted === 0) {
        attention.push({ bid, code, title, tone: "red", reason: `Closes in ${formatTimeLeft(hours).replace(" left", "")} with no quotes yet` });
      }
      if (hours !== null && hours < 0) {
        attention.push({ bid, code, title, tone: "red", reason: "Deadline passed. Close or award this bid" });
      }
    }

    if (status === "DRAFT") {
      const updated = new Date(bid.updatedAt || bid.createdAt);
      const days = Number.isNaN(updated.getTime()) ? 0 : (now - updated) / (HOUR * 24);
      if (days >= STALE_DRAFT_DAYS) {
        attention.push({ bid, code, title, tone: "amber", reason: `Draft untouched for ${Math.floor(days)} days` });
      }
    }

    if ((status === "DRAFT" || status === "PUBLISHED") && vs.indentsWithoutVendors > 0) {
      attention.push({
        bid, code, title, tone: "amber",
        reason: `${vs.indentsWithoutVendors} indent${vs.indentsWithoutVendors === 1 ? "" : "s"} with no vendors invited`,
      });
    }
  });

  closingList.sort((a, b) => a.hours - b.hours);
  attention.sort((a, b) => (a.tone === b.tone ? 0 : a.tone === "red" ? -1 : 1));

  return {
    total: bids.length,
    counts,
    published: counts.PUBLISHED,
    drafts: counts.DRAFT,
    awarded: counts.AWARDED,
    closingSoon,
    overdue,
    quotesIn,
    vendorsInvited,
    closingList: closingList.slice(0, 5),
    attention: attention.slice(0, 8),
    attentionTotal: attention.length,
  };
}
