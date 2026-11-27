import jwt from "jsonwebtoken";
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
  const { companyId, partyId, vendorId } = req.query;
  const targetVendorId = partyId || vendorId;

  const where = {};
  if (companyId) {
    where.Branch = {
      companyId: parseInt(companyId),
    };
  }
  if (targetVendorId) {
    where.BiddingLots = {
      some: {
        BiddingIndent: {
          some: {
            BiddingIndentvendors: {
              some: {
                vendorId: parseInt(targetVendorId),
              },
            },
          },
        },
      },
    };
  }

  const data = await prisma.Bidding.findMany({
    where,
    include: {
      Branch: true,
      BiddingLots: {
        include: {
          BiddingIndent: {
            include: {
              BiddingIndentvendors: {
                include: {
                  Vendor: true,
                  indentVendorsUpload: {
                    include: {
                      Vendor: true,
                    },
                    orderBy: { id: "desc" },
                  },
                },
              },
              BiddingIndentChat: true,
              biddingIndentAttachments: true,
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
    orderBy: { id: "desc" },
  });

  return { statusCode: 0, data };
}

async function getOne(id, req) {
  let targetVendorId = req?.query?.partyId || req?.query?.vendorId;
  if (!targetVendorId && req?.headers?.authorization) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, "RANDOM-TOKEN");
      if (decoded?.partyId) {
        targetVendorId = decoded.partyId;
      } else if (decoded?.userId) {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(decoded.userId) },
          select: { partyId: true, role: { select: { name: true } } },
        });
        if (user?.role?.name?.toLowerCase() === "vendor" && user?.partyId) {
          targetVendorId = user.partyId;
        }
      }
    } catch (e) {}
  }

  const data = await prisma.Bidding.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      createdBy: true,
      Branch: true,
      BiddingLots: {
        where: targetVendorId
          ? {
              BiddingIndent: {
                some: {
                  BiddingIndentvendors: {
                    some: {
                      vendorId: parseInt(targetVendorId),
                    },
                  },
                },
              },
            }
          : undefined,
        include: {
          BiddingIndent: {
            where: targetVendorId
              ? {
                  BiddingIndentvendors: {
                    some: {
                      vendorId: parseInt(targetVendorId),
                    },
                  },
                }
              : undefined,
            include: {
              BiddingIndentvendors: {
                include: {
                  Vendor: true,
                  indentVendorsUpload: {
                    include: {
                      Vendor: true,
                    },
                    orderBy: { id: "desc" },
                  },
                },
              },
              BiddingIndentChat: true,
              biddingIndentAttachments: true,
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
  const { companyId, partyId, vendorId } = req.query;
  const targetVendorId = partyId || vendorId;

  const where = {
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
  };

  if (companyId) {
    where.Branch = {
      companyId: parseInt(companyId),
    };
  }
  if (targetVendorId) {
    where.BiddingLots = {
      some: {
        BiddingIndent: {
          some: {
            BiddingIndentvendors: {
              some: {
                vendorId: parseInt(targetVendorId),
              },
            },
          },
        },
      },
    };
  }

  const data = await prisma.Bidding.findMany({
    where,
    include: {
      Branch: true,
      BiddingLots: {
        include: {
          BiddingIndent: {
            include: {
              BiddingIndentvendors: {
                include: {
                  Vendor: true,
                  indentVendorsUpload: {
                    include: {
                      Vendor: true,
                    },
                    orderBy: { id: "desc" },
                  },
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
    orderBy: { id: "desc" },
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

async function create(body, req) {
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

async function update(id, body, req) {
  const bidId = parseInt(id);
  const dataFound = await prisma.Bidding.findUnique({
    where: { id: bidId },
  });

  if (!dataFound) return NoRecordFound("Bidding");

  let details = body.details || {};
  let terms = body.terms || {};
  let lotsList = body.lots || body.BiddingLots;

  if (typeof details === "string") {
    try { details = JSON.parse(details); } catch (e) {}
  }
  if (typeof terms === "string") {
    try { terms = JSON.parse(terms); } catch (e) {}
  }
  if (typeof lotsList === "string") {
    try { lotsList = JSON.parse(lotsList); } catch (e) { lotsList = []; }
  }

  const isVendorReq =
    body.isVendor === true ||
    body.isVendor === "true" ||
    body.userRole?.toLowerCase() === "vendor";

  // Collect any documents attached across indents
  const incomingDocs = [];
  if (Array.isArray(lotsList)) {
    lotsList.forEach((lot) => {
      const indents = lot.indents || lot.BiddingIndent || [];
      indents.forEach((ind) => {
        const bIndentId = parseId(ind.biddingIndentId || ind.id);
        const vendors = ind.vendors || ind.BiddingIndentvendors || [];
        vendors.forEach((v) => {
          const docs = v.documents || [];
          docs.forEach((d) => {
            incomingDocs.push({
              ...d,
              biddingIndentId: bIndentId,
            });
          });
        });
      });
    });
  }

  // Helper to sync attachments into BiddingIndentAttachments
  const syncAttachments = async (tx, docsToSync) => {
    for (const doc of docsToSync) {
      if (!doc.biddingIndentId) continue;
      const matchingFile = req?.files?.find(
        (f) => f.originalname === doc.fileName
      );
      const filePath = matchingFile
        ? matchingFile.filename
        : doc.filePath || doc.fileName;

      if (doc.id && typeof doc.id === "number") {
        await tx.biddingIndentAttachments.update({
          where: { id: doc.id },
          data: {
            name: doc.title || doc.name || doc.fileName,
            fileName: doc.fileName,
            filePath: filePath,
            date: new Date(),
          },
        });
      } else {
        await tx.biddingIndentAttachments.create({
          data: {
            biddingIndentId: doc.biddingIndentId,
            name: doc.title || doc.name || doc.fileName,
            fileName: doc.fileName,
            filePath: filePath,
            date: new Date(),
          },
        });
      }
    }
  };

  // IF VENDOR: Preserve all bid details and lots; only update attachments
  if (isVendorReq) {
    const data = await prisma.$transaction(async (tx) => {
      await syncAttachments(tx, incomingDocs);

      return await tx.Bidding.findUnique({
        where: { id: bidId },
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
                  BiddingIndentChat: true,
                  biddingIndentAttachments: true,
                },
              },
            },
          },
        },
      });
    });

    return { statusCode: 0, data, message: "Documents saved successfully" };
  }

  // IF ADMIN: Process full bid updates
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

  const data = await prisma.$transaction(async (tx) => {
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
                BiddingIndentChat: true,
                biddingIndentAttachments: true,
              },
            },
          },
        },
      },
    });

    await syncAttachments(tx, incomingDocs);

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

const extractVendorId = async (req, body = {}) => {
  let targetVendorId = body.vendorId || body.partyId || req?.query?.partyId || req?.query?.vendorId || req?.user?.partyId;
  if (!targetVendorId && req?.headers?.authorization) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, "RANDOM-TOKEN");
      if (decoded?.partyId) {
        targetVendorId = decoded.partyId;
      } else if (decoded?.userId) {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(decoded.userId, 10) },
          select: { partyId: true, role: { select: { name: true } } },
        });
        if (user?.partyId) {
          targetVendorId = user.partyId;
        }
      }
    } catch (e) {}
  }
  return targetVendorId ? parseInt(targetVendorId, 10) : null;
};

async function getVendorAllocatedItems(req) {
  const targetVendorId = await extractVendorId(req);
  if (!targetVendorId) {
    return { statusCode: 0, data: [] };
  }

  const items = await prisma.biddingIndent.findMany({
    where: {
      BiddingLots: {
        Bidding: {
          status: "PUBLISHED",
        },
      },
      BiddingIndentvendors: {
        some: {
          vendorId: targetVendorId,
        },
      },
    },
    include: {
      BiddingLots: {
        include: {
          Bidding: {
            select: {
              id: true,
              docId: true,
              name: true,
              submissionDeadline: true,
              queryDeadline: true,
              termsTemplate: true,
              description: true,
            },
          },
        },
      },
      Item: true,
      Uom: true,
      Color: true,
      Size: true,
      Counts: true,
      YarnBlend: true,
      Fabric: true,
      Yarn: true,
      biddingIndentAttachments: true,
      BiddingIndentvendors: {
        where: {
          vendorId: targetVendorId,
        },
        include: {
          Vendor: true,
          indentVendorsUpload: {
            orderBy: { id: "desc" },
          },
        },
      },
    },
    orderBy: { id: "desc" },
  });

  const formatted = items.map((ind) => {
    const custom = ind.customData || {};
    const vendorAssignment = ind.BiddingIndentvendors?.[0] || {};
    const uploads = vendorAssignment.indentVendorsUpload || [];
    const latestQuoteUpload = uploads.find((u) => u.price !== null && u.price !== undefined);
    const quotedPrice = latestQuoteUpload?.price || null;
    const quoteRemarks = latestQuoteUpload?.remarks || "";

    return {
      bidId: ind.BiddingLots?.Bidding?.id,
      bidNo: ind.BiddingLots?.Bidding?.docId || `BID-${ind.BiddingLots?.Bidding?.id}`,
      bidName: ind.BiddingLots?.Bidding?.name || "",
      biddingIndentId: ind.id,
      biddingLotId: ind.biddingLotId,
      indentItemId: ind.indentItemId,
      biddingIndentVendorId: vendorAssignment.id,
      itemName: ind.Yarn?.name || ind.Fabric?.name || ind.Item?.name || custom?.item_name || "Item",
      category: ind.indentType || custom?.category || "General",
      qty: ind.qty || 0,
      uom: ind.Uom?.name || "KGS",
      specs: {
        count: ind.Counts?.name || custom?.specs?.count,
        blend: ind.YarnBlend?.name || custom?.specs?.blend,
        shade: ind.Color?.name || custom?.specs?.shade,
        gsm: custom?.specs?.gsm,
        width: custom?.specs?.width,
        make: ind.make || custom?.specs?.make,
        partNo: custom?.specs?.partNo,
        spec: custom?.specs?.spec,
      },
      deadlines: {
        submission: ind.BiddingLots?.Bidding?.submissionDeadline,
        query: ind.BiddingLots?.Bidding?.queryDeadline,
      },
      terms: ind.BiddingLots?.Bidding?.description,
      buyerDocuments: ind.biddingIndentAttachments || [],
      vendorUploads: uploads,
      quotedPrice,
      quoteRemarks,
      vendorStatus: vendorAssignment.status || (quotedPrice ? "QUOTED" : "INVITED"),
    };
  });

  return { statusCode: 0, data: formatted };
}

async function submitVendorQuote(biddingIndentId, body, req) {
  const targetVendorId = await extractVendorId(req, body);
  if (!targetVendorId) {
    return { statusCode: 1, message: "Vendor identification failed" };
  }

  const bIndentId = parseInt(biddingIndentId, 10);
  const priceVal = parseFloat(body.price);

  if (isNaN(priceVal) || priceVal <= 0) {
    return { statusCode: 1, message: "Please enter a valid price" };
  }

  const bVendor = await prisma.biddingIndentvendors.findFirst({
    where: {
      biddingIndentId: bIndentId,
      vendorId: targetVendorId,
    },
  });

  if (!bVendor) {
    return { statusCode: 1, message: "Vendor assignment not found for this indent" };
  }

  const quoteRecord = await prisma.indentVendorsUpload.create({
    data: {
      biddingIndentvendorsId: bVendor.id,
      vendorId: targetVendorId,
      price: priceVal,
      remarks: body.remarks ? String(body.remarks) : null,
      date: new Date(),
    },
  });

  await prisma.biddingIndentvendors.update({
    where: { id: bVendor.id },
    data: { status: "QUOTED" },
  });

  return { statusCode: 0, message: "Quote submitted successfully", data: quoteRecord };
}

async function uploadVendorIndentDocument(biddingIndentId, body, req) {
  const targetVendorId = await extractVendorId(req, body);
  const bIndentId = parseInt(biddingIndentId, 10);

  const bVendor = await prisma.biddingIndentvendors.findFirst({
    where: {
      biddingIndentId: bIndentId,
      vendorId: targetVendorId,
    },
  });

  if (!bVendor) {
    return { statusCode: 1, message: "Vendor assignment not found for this indent" };
  }

  const files = req.files || [];
  const createdRecords = [];

  let fileRemarks = [];
  if (body.remarks) {
    try {
      fileRemarks = typeof body.remarks === "string" ? JSON.parse(body.remarks) : body.remarks;
    } catch {
      fileRemarks = body.remarks;
    }
  }

  // Determine next quoteVersion: increments every time vendor uploads new attachments
  const existingUploads = await prisma.indentVendorsUpload.findMany({
    where: { biddingIndentvendorsId: bVendor.id },
    select: { quoteVersion: true },
  });

  let nextVersion = 1;
  if (existingUploads.length > 0) {
    const maxVer = Math.max(...existingUploads.map((u) => u.quoteVersion || 1));
    nextVersion = maxVer + 1;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let remark = null;
    if (Array.isArray(fileRemarks)) {
      remark = fileRemarks[i] || null;
    } else if (typeof fileRemarks === "string") {
      remark = fileRemarks;
    }

    const uploadRec = await prisma.indentVendorsUpload.create({
      data: {
        biddingIndentvendorsId: bVendor.id,
        vendorId: targetVendorId,
        price: null,
        remarks: remark,
        date: new Date(),
        fileName: file.originalname,
        filePath: file.filename,
        quoteVersion: nextVersion,
      },
    });
    createdRecords.push(uploadRec);
  }

  return { statusCode: 0, message: "Attachments uploaded successfully", data: createdRecords };
}

export {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
  getVendorAllocatedItems,
  submitVendorQuote,
  uploadVendorIndentDocument,
};
