import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getYearShortCodeForFinYear } from "../utils/helper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";


async function getNextDocId(branchId, shortCode, startTime, endTime, saveType) {
  // if (saveType) return "Draft Save";

  let lastObject = await prisma.Bidding.findFirst({
    where: {
      branchId: parseInt(branchId),
      AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }],
    },
    orderBy: { id: "desc" },
  });

  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}/${shortCode}/BID/1`;

  if (lastObject) {
    if (lastObject.docId === "Draft Save") {
      const records = await prisma.Bidding.findMany({
        select: { docId: true },
        where: {
          branchId: parseInt(branchId),
          AND: [
            { createdAt: { gte: startTime } },
            { createdAt: { lte: endTime } },
          ],
        },
      });
      const maxDocId = records.reduce((max, current) => {
        const currentNo = Number(current.docId.split("/").pop());
        const maxNo = max ? Number(max.split("/").pop()) : 0;
        return currentNo > maxNo ? current.docId : max;
      }, null);


      newDocId = `${branchObj.branchCode}/${shortCode}/BID/${parseInt(maxDocId.split("/").at(-1)) + 1}`;

    } else {
      newDocId = `${branchObj.branchCode}/${shortCode}/BID/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`;
    }
  }
  return newDocId;
}



async function get(req) {
  const { companyId } = req.query;

  const data = await prisma.Bidding.findMany({
    where: {

    },
    include: {
      BiddingLots: {
        include: {
          BiddingIndent: {
            include: {

              BiddingIndentvendors: true,
              BiddingIndentChat: true

            }
          }
        }
      }
    }
  });


  return { statusCode: 0, data };
}

async function getOne(id) {
  const data = await prisma.Bidding.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      createdBy: true,
      Branch: true,
      BiddingLots: {
        include: {
          BiddingIndent: {
            include: {
              BiddingIndentvendors: {
                include: {
                  Vendor: true,
                },
              },
              BiddingIndentChat: true,
              Item: true,
              Uom: true,
              Color: true,
              Size: true,
              Itemgroup: true,
              Fabric: true,
              Yarn: true,
            },
          },
        },
      },
    },
  });

  if (!data) return NoRecordFound("Bidding");

  return {
    statusCode: 0,
    data,
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;

  const data = await prisma.Bidding.findMany({
    where: {
      OR: [
        {
          name: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          docId: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          bidNo: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
      ],
    },
    include: {
      BiddingLots: {
        include: {
          BiddingIndent: {
            include: {
              BiddingIndentvendors: true,
              BiddingIndentChat: true,
            },
          },
        },
      },
    },
  });

  return { statusCode: 0, data };
}


// Helper for safe integer parsing
const parseId = (val) => {
  if (val === null || val === undefined) return null;
  const num = parseInt(val, 10);
  return isNaN(num) ? null : num;
};

// Safe date parser
const parseDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

// Helper to structure nested Lot -> Indent -> Vendor creation
const buildLotNestedCreate = (lotsList = []) => {
  return lotsList.map((lot, index) => {
    const indentsList = lot.indents || lot.BiddingIndent || [];
    return {
      name: lot.name || `Lot ${index + 1}`,
      description: lot.description || null,
      status: lot.status || "PENDING",
      lotNumber: lot.lotNumber ? String(lot.lotNumber) : String(index + 1),
      BiddingIndent: {
        create: indentsList.map((ind) => {
          const customData = ind.customData || {
            docId: ind.docId || (typeof ind.id === 'string' ? ind.id : null),
            department: typeof ind.department === 'object' ? ind.department?.name : ind.department,
            requiredBy: ind.requiredBy,
            item_name: ind.item_name,
            commonDocuments: ind.commonDocuments || [],
            vendorDocuments: (ind.vendors || []).map((v) => ({
              vendorId: v.id || v.vendorId,
              name: v.name || v.label,
              documents: v.documents || []
            })),
            specs: {
              count: ind.count,
              blend: ind.blend,
              shade: ind.shade,
              ply: ind.ply,
              construction: ind.construction,
              gsm: ind.gsm,
              width: ind.width,
              ciCas: ind.ciCas,
              strength: ind.strength,
              hazard: ind.hazard,
              machine: ind.machine,
              partNo: ind.partNo,
              make: ind.make,
              spec: ind.spec,
            }
          };

          const vendorsList = ind.vendors || ind.BiddingIndentvendors || [];

          return {
            indentId: parseId(ind.indentId || ind.Indent?.id),
            indentItemId: parseId(ind.indentItemId || (typeof ind.id === 'number' ? ind.id : null)),
            indentType: ind.indentType || ind.category || "General",
            itemGroupId: parseId(ind.itemGroupId),
            itemId: parseId(ind.itemId || ind.Item?.id),
            sizeId: parseId(ind.sizeId || ind.Size?.id),
            colorId: parseId(ind.colorId || ind.Color?.id),
            uomId: parseId(ind.uomId || ind.Uom?.id),
            hsnId: parseId(ind.hsnId || ind.Hsn?.id),
            gsmId: parseId(ind.gsmId || ind.Gsm?.id),
            yarnId: parseId(ind.yarnId || ind.Yarn?.id),
            fabricId: parseId(ind.fabricId || ind.Fabric?.id),
            yarnBlendId: parseId(ind.yarnBlendId || ind.YarnBlend?.id),
            countsId: parseId(ind.countsId || ind.Counts?.id),
            price: ind.price ? String(ind.price) : null,
            qty: ind.qty ? String(ind.qty) : "0",
            make: ind.make || null,
            customData,
            BiddingIndentvendors: {
              create: vendorsList
                .map((v) => {
                  const rawId = v.vendorId !== undefined ? v.vendorId : v.id;
                  const vId = parseId(rawId);
                  return vId
                    ? {
                      vendorId: vId,
                      status: v.status || "INVITED"
                    }
                    : null;
                })
                .filter(Boolean)
            }
          };
        })
      }
    };
  });
};

// Helper to extract unique Indent IDs and update their status (DRAFT / PUBLISHED / etc.)
const updateIndentsStatus = async (lotsList, newStatus, fallbackBidId = null, client = prisma) => {
  const indentIds = [];

  if (Array.isArray(lotsList)) {
    lotsList.forEach((lot) => {
      const indents = lot.indents || lot.BiddingIndent || [];
      indents.forEach((ind) => {
        const id = parseId(ind.id);
        if (id) indentIds.push(id);
      });
    });
  }

  // If lotsList wasn't passed or indentIds not found directly, check existing records in database
  if (indentIds.length === 0 && fallbackBidId) {
    const existing = await client.BiddingIndent.findMany({
      where: { BiddingLots: { biddingId: fallbackBidId } },
      select: { indentId: true },
    });
    existing.forEach((item) => {
      if (item.indentId) indentIds.push(item.indentId);
    });
  }

  const uniqueIndentIds = [...new Set(indentIds)];

  if (uniqueIndentIds.length > 0) {
    await client.IndentItems.updateMany({
      where: {
        id: { in: uniqueIndentIds },
      },
      data: {
        status: newStatus,
      },
    });
  }

  return uniqueIndentIds;
};

async function create(body) {
  const { finYearId, branchId, draftSave } = body;

  const details = body.details || {};
  const terms = body.terms || {};

  const name = body.name || body.bidTitle || details.bidTitle || details.name;
  const bidNo = body.bidNo || body.docId || details.bidNo || details.docId;
  const bidDate = body.bidDate || details.bidDate;
  const closingDate = body.closingDate || terms.closingDate || details.closingDate;
  const submissionDeadline = body.submissionDeadline || terms.submissionDeadline || details.submissionDeadline;
  const queryDeadline = body.queryDeadline || terms.queryDeadline || details.queryDeadline;
  const termsTemplate = body.termsTemplate || terms.termsTemplate;
  const description = body.description || (terms.paymentPolicy || body.policyTerms
    ? (typeof terms.paymentPolicy === 'string' ? terms.paymentPolicy : JSON.stringify(terms))
    : null);
  const status = body.status || "DRAFT";
  const lotsList = body.lots || body.BiddingLots || [];

  const parsedStartDate = parseDate(body.startDate) || parseDate(bidDate) || new Date();
  const parsedEndDate = parseDate(body.endDate)
    || parseDate(submissionDeadline)
    || parseDate(closingDate)
    || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const parsedSubmissionDeadline = parseDate(submissionDeadline);
  const parsedQueryDeadline = parseDate(queryDeadline);
  const parsedClosingDate = parseDate(closingDate) || parsedEndDate;

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime,) : "";
  let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime, status,);

  // Wrap all database operations in an atomic transaction
  const data = await prisma.$transaction(async (tx) => {
    const createdBid = await tx.Bidding.create({
      data: {
        name: name || (bidNo ? `Bid ${bidNo}` : "New Bid"),
        docId: newDocId,
        bidNo: bidNo || null,
        bidDate: bidDate ? String(bidDate) : null,
        closingDate: parsedClosingDate,
        submissionDeadline: parsedSubmissionDeadline,
        queryDeadline: parsedQueryDeadline,
        termsTemplate: termsTemplate || null,
        description: description,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        status: status || "DRAFT",
        branchId: parseId(branchId) || parseId(body.user?.branchId),
        createdById: parseId(body.user?.id),
        BiddingLots: {
          create: buildLotNestedCreate(lotsList)
        }
      },
      include: {
        BiddingLots: {
          include: {
            BiddingIndent: {
              include: {
                BiddingIndentvendors: {
                  include: {
                    Vendor: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Update associated indents status atomically within the same transaction
    const indentStatus = status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    await updateIndentsStatus(lotsList, indentStatus, null, tx);

    return createdBid;
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const bidId = parseInt(id);
  const dataFound = await prisma.Bidding.findUnique({
    where: { id: bidId },
  });

  if (!dataFound) return NoRecordFound("Bidding");

  const details = body.details || {};
  const terms = body.terms || {};

  const name = body.name || body.bidTitle || details.bidTitle || details.name;
  const docId = body.docId || body.bidNo || details.docId || details.bidNo;
  const bidNo = body.bidNo || body.docId || details.bidNo || details.docId;
  const bidDate = body.bidDate || details.bidDate;
  const closingDate = body.closingDate || terms.closingDate || details.closingDate;
  const submissionDeadline = body.submissionDeadline || terms.submissionDeadline || details.submissionDeadline;
  const queryDeadline = body.queryDeadline || terms.queryDeadline || details.queryDeadline;
  const termsTemplate = body.termsTemplate || terms.termsTemplate;
  const description = body.description || (terms.paymentPolicy || body.policyTerms
    ? (typeof terms.paymentPolicy === 'string' ? terms.paymentPolicy : JSON.stringify(terms))
    : undefined);
  const status = body.status;
  const branchId = body.branchId || details.branchId;

  const parsedStartDate = parseDate(body.startDate) || parseDate(bidDate);
  const parsedEndDate = parseDate(body.endDate) || parseDate(submissionDeadline) || parseDate(closingDate);
  const parsedSubmissionDeadline = parseDate(submissionDeadline);
  const parsedQueryDeadline = parseDate(queryDeadline);
  const parsedClosingDate = parseDate(closingDate);

  const lotsList = body.lots || body.BiddingLots;

  // Wrap all updates and indent status syncing in an atomic transaction
  const data = await prisma.$transaction(async (tx) => {
    // If lots are passed in an update, delete existing child lots and recreate them
    if (Array.isArray(lotsList)) {
      await tx.BiddingLots.deleteMany({
        where: { biddingId: bidId }
      });
    }

    const updatedBid = await tx.Bidding.update({
      where: { id: bidId },
      data: {
        name: name !== undefined ? name : dataFound.name,
        docId: docId !== undefined ? docId : dataFound.docId,
        bidNo: bidNo !== undefined ? bidNo : dataFound.bidNo,
        bidDate: bidDate !== undefined ? (bidDate ? String(bidDate) : null) : dataFound.bidDate,
        closingDate: parsedClosingDate !== null ? parsedClosingDate : dataFound.closingDate,
        submissionDeadline: parsedSubmissionDeadline !== null ? parsedSubmissionDeadline : dataFound.submissionDeadline,
        queryDeadline: parsedQueryDeadline !== null ? parsedQueryDeadline : dataFound.queryDeadline,
        termsTemplate: termsTemplate !== undefined ? termsTemplate : dataFound.termsTemplate,
        description: description !== undefined ? description : dataFound.description,
        startDate: parsedStartDate || dataFound.startDate,
        endDate: parsedEndDate || dataFound.endDate,
        status: status !== undefined ? status : dataFound.status,
        branchId: parseId(branchId) || dataFound.branchId,
        updatedById: parseId(body.user?.id) || dataFound.updatedById,
        ...(Array.isArray(lotsList) && lotsList.length > 0
          ? {
            BiddingLots: {
              create: buildLotNestedCreate(lotsList),
            },
          }
          : {}),
      },
      include: {
        BiddingLots: {
          include: {
            BiddingIndent: {
              include: {
                BiddingIndentvendors: {
                  include: {
                    Vendor: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Update associated indents status atomically within the same transaction
    const targetStatus = (status !== undefined ? status : dataFound.status) === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    await updateIndentsStatus(lotsList, targetStatus, bidId, tx);

    return updatedBid;
  });

  return { statusCode: 0, data, message: "Bid updated successfully" };
}

async function remove(id) {
  const bidId = parseInt(id);
  const dataFound = await prisma.Bidding.findUnique({
    where: { id: bidId },
  });

  if (!dataFound) return NoRecordFound("Bidding");

  const data = await prisma.$transaction(async (tx) => {
    // Revert indent status back to APPROVED so the indent is free to be bid again
    await updateIndentsStatus([], "APPROVED", bidId, tx);

    return await tx.Bidding.delete({
      where: { id: bidId },
    });
  });

  return { statusCode: 0, data, message: "Bid deleted successfully" };
}

export { get, getOne, getSearch, create, update, remove };
