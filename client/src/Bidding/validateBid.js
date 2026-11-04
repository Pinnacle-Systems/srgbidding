// Publish rules. Edit this list to change what a bid needs before it can be published.
// Each issue carries the wizard step (1 Bid details, 2 Lots, 3 Indents + vendors, 4 Review) to jump to.

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export function validateBidForPublish(bidData = {}) {
  const issues = [];
  const add = (step, message) => issues.push({ step, message });

  const submission = bidData.submissionDeadline || bidData.terms?.submissionDeadline;
  const query = bidData.queryDeadline || bidData.terms?.queryDeadline;

  // Step 1: Bid details
  if (!String(bidData.bidTitle || '').trim()) add(1, 'Bid title is required');
  if (!submission) {
    add(1, 'Submission deadline is required');
  } else if (new Date(submission) < startOfToday()) {
    add(1, 'Submission deadline cannot be in the past');
  }
  if (query && submission && new Date(query) > new Date(submission)) {
    add(1, 'Query deadline must be on or before the submission deadline');
  }

  // Step 2: Lots
  const lots = bidData.lots || [];
  if (lots.length === 0) add(2, 'Add at least one lot');
  lots.forEach((lot, i) => {
    const label = `Lot ${lot.lotNumber || i + 1}${lot.name ? ` (${lot.name})` : ''}`;
    if (!String(lot.name || '').trim()) add(2, `${label} needs a name`);

    // Step 3: Indents
    const indents = lot.indents || [];
    if (indents.length === 0) add(3, `${label} has no indents`);

    // Vendors are chosen per indent in the Indents step (3)
    indents.forEach((ind) => {
      if (!(ind.vendors || []).length) {
        add(3,`${label}: indent ${ind.docId || ind.id} has no vendors invited`);
      }
    });
  });

  return {
    valid: issues.length === 0,
    issues,
    firstStep: issues.length ? Math.min(...issues.map((x) => x.step)) : null,
  };
}
