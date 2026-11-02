import { prisma as defaultPrisma } from "../lib/prisma.js";

/**
 * Concurrency-safe generator for child itemsDocId values.
 *
 * Enforces atomic sequential allocation per parent Indent using
 * PostgreSQL row-level locking (SELECT ... FOR UPDATE) on the parent Indent row.
 *
 * Expected child format: `${parentDocId}.${childSeq}`
 * Example:
 *   Parent: 'SRG/26-27/YIN/1'
 *   Children: 'SRG/26-27/YIN/1.1', 'SRG/26-27/YIN/1.2', ...
 *
 * @param {object} txOrPrisma - Prisma transaction client (tx) or global prisma instance
 * @param {number|string|object} parentIdentifier - Parent indent id, docId, or indent record object
 * @param {number} count - Number of sequential child IDs to allocate (default 1)
 * @returns {Promise<string|string[]>} Single itemsDocId string if count === 1, or Array of strings if count > 1
 */
export async function generateNextItemsDocIds(txOrPrisma, parentIdentifier, count = 1) {
  // Allow flexible parameter order if caller passes (parentIdentifier, txOrPrisma)
  let tx = txOrPrisma;
  let targetParent = parentIdentifier;

  if (
    (!tx || typeof tx.$queryRaw !== "function") &&
    targetParent &&
    typeof targetParent.$queryRaw === "function"
  ) {
    const temp = tx;
    tx = targetParent;
    targetParent = temp;
  }

  // If no active transaction client was provided, wrap in an atomic transaction
  if (!tx || typeof tx.$queryRaw !== "function") {
    return await defaultPrisma.$transaction(async (newTx) => {
      return await generateNextItemsDocIds(newTx, targetParent, count);
    });
  }

  const numCount = parseInt(count, 10);
  if (isNaN(numCount) || numCount <= 0) {
    return count === 1 ? "" : [];
  }

  // 1. Resolve parent Indent ID and docId
  let parentId = null;
  let parentDocId = null;

  if (typeof targetParent === "object" && targetParent !== null) {
    if (targetParent.id) parentId = parseInt(targetParent.id, 10);
    if (targetParent.docId) parentDocId = String(targetParent.docId).trim();
  } else if (typeof targetParent === "number") {
    parentId = targetParent;
  } else if (typeof targetParent === "string") {
    const trimmed = targetParent.trim();
    if (/^\d+$/.test(trimmed)) {
      parentId = parseInt(trimmed, 10);
    } else {
      parentDocId = trimmed;
    }
  }

  if (!parentId && !parentDocId) {
    throw new Error("Invalid parent identifier: Indent ID or docId is required.");
  }

  // 2. Concurrency-Safe Database-Level Row Lock:
  // Acquire an exclusive row-level lock (FOR UPDATE) on the parent Indent row in PostgreSQL.
  // This guarantees that any concurrent requests attempting to allocate child IDs for the
  // SAME parent will wait for this transaction to commit, preventing duplicate numbers.
  // Requests for DIFFERENT parents lock different rows and execute concurrently without blocking.
  let lockedParent = null;

  if (parentId) {
    const rows = await tx.$queryRaw`
      SELECT id, "docId" FROM "Indent" WHERE id = ${parentId} FOR UPDATE
    `;
    if (rows && rows.length > 0) {
      lockedParent = rows[0];
    }
  } else if (parentDocId) {
    const rows = await tx.$queryRaw`
      SELECT id, "docId" FROM "Indent" WHERE "docId" = ${parentDocId} FOR UPDATE
    `;
    if (rows && rows.length > 0) {
      lockedParent = rows[0];
    }
  }

  if (!lockedParent) {
    throw new Error(
      `Parent Indent not found for identifier: ${JSON.stringify(targetParent)}`
    );
  }

  parentId = lockedParent.id;
  parentDocId = lockedParent.docId ? String(lockedParent.docId).trim() : "";

  // 3. Determine base prefix for child itemsDocId
  let basePrefix = parentDocId;
  if (!basePrefix) {
    basePrefix = `INDENT-${parentId}`;
  } else if (basePrefix === "Draft Save") {
    // If parent is a draft, scope to parentId to avoid collision with other drafts in unique index
    basePrefix = `Draft Save-${parentId}`;
  }

  // 4. Query existing child items for this parent to identify the highest existing child sequence.
  // Handles existing children, gaps (e.g. 1.1, 1.2, 1.5 -> next is 1.6), and arbitrary numbering.
  const existingItems = await tx.indentItems.findMany({
    where: { indentId: parentId },
    select: { itemsDocId: true },
  });

  let maxSeq = 0;
  const prefixWithDot = `${basePrefix}.`;

  for (const item of existingItems) {
    if (!item?.itemsDocId) continue;
    const docIdStr = String(item.itemsDocId).trim();

    // Check if itemsDocId starts with this parent's basePrefix.
    if (docIdStr.startsWith(prefixWithDot)) {
      const seqStr = docIdStr.slice(prefixWithDot.length);
      const seqNum = parseInt(seqStr, 10);
      if (!isNaN(seqNum) && seqNum > maxSeq) {
        maxSeq = seqNum;
      }
    } else {
      // Fallback: extract any trailing numeric sequence after the last dot
      const lastDotIndex = docIdStr.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        const seqStr = docIdStr.slice(lastDotIndex + 1);
        const seqNum = parseInt(seqStr, 10);
        if (!isNaN(seqNum) && seqNum > maxSeq) {
          maxSeq = seqNum;
        }
      }
    }
  }

  // 5. Generate sequential child IDs strictly greater than the maximum existing child sequence
  const generatedIds = [];
  for (let i = 1; i <= numCount; i++) {
    generatedIds.push(`${basePrefix}.${maxSeq + i}`);
  }

  return numCount === 1 ? generatedIds[0] : generatedIds;
}

/**
 * Concurrency-safe generator for a single child itemsDocId.
 * Alias for generateNextItemsDocIds with count = 1.
 *
 * @param {object} txOrPrisma - Prisma transaction client (tx) or global prisma instance
 * @param {number|string|object} parentIdentifier - Parent indent id, docId, or indent record object
 * @returns {Promise<string>} Next child itemsDocId
 */
export async function generateNextItemsDocId(txOrPrisma, parentIdentifier) {
  return await generateNextItemsDocIds(txOrPrisma, parentIdentifier, 1);
}
