import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";
import {
  getYearShortCodeForFinYear,
  getYearShortCode,
  getDateFromDateTime,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import fs from "fs";
import path from "path";
import {
  createApprovalLog,
  getModuleApprovalSetup,
  evaluateConfigTrigger,
  getTriggeredConfig,
  buildIncludeForModule,
  approveRecord,
  rejectRecord,
} from "../utils/approvalHelper.js";

const REFERENCE_PAGE = "MACHINE & SPARE INDENT FORM";
const INDENT_TYPE = "MACHINE & SPARE";
const DOC_PREFIX = "MSI";


async function getNextDocId(branchId, shortCode, startTime, endTime, saveType) {
  if (saveType) return "Draft Save";

  let lastObject = await prisma.Indent.findFirst({
    where: {
      branchId: parseInt(branchId),
      indentType: INDENT_TYPE,
      AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }],
    },
    orderBy: { id: "desc" },
  });

  console.log(lastObject, "lastObject");


  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}/${shortCode}/${DOC_PREFIX}/1`;

  if (lastObject) {
    if (lastObject.docId === "Draft Save") {
      const records = await prisma.Indent.findMany({
        select: { docId: true },
        where: {
          branchId: parseInt(branchId),
          indentType: INDENT_TYPE,
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
      newDocId = `${branchObj.branchCode}/${shortCode}/${DOC_PREFIX}/${parseInt(maxDocId.split("/").at(-1)) + 1}`;
    } else {
      newDocId = `${branchObj.branchCode}/${shortCode}/${DOC_PREFIX}/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`;
    }
  }
  return newDocId;
}

function getPOApprovalStatus(log, isApprovalConfigured = false) {
  if (!log) {
    return isApprovalConfigured
      ? {
        status: "NOTAPPROVED",
        label: "Not Approved",
        color: "orange",
        currentLevel: 1,
        levelLogs: [],
      }
      : {
        status: "NOT_CONFIGURED",
        label: "No Approval",
        color: "gray",
        currentLevel: null,
        levelLogs: [],
      };
  }
  const base = {
    currentLevel: log.currentLevel,
    levelLogs: log.LevelLogs ?? [],
    remarks: log.remarks,
  };
  const map = {
    APPROVED: {
      ...base,
      status: "APPROVED",
      label: "Approved",
      color: "green",
    },
    REJECTED: { ...base, status: "REJECTED", label: "Rejected", color: "red" },
    PENDING: { ...base, status: "PENDING", label: "Pending", color: "orange" },
    NOTAPPROVED: {
      ...base,
      status: "NOTAPPROVED",
      label: "Not Approved",
      color: "orange",
    },
    SUPERSEDED: {
      ...base,
      status: "SUPERSEDED",
      label: "Re-approval Needed",
      color: "yellow",
    }, // ✅ NEW
  };
  return (
    map[log.status] ?? {
      ...base,
      status: "UNKNOWN",
      label: "Unknown",
      color: "gray",
    }
  );
}

function evaluateConfigs(activeConfigs, record) {
  if (!activeConfigs?.length) return false;

  const valid = activeConfigs
    .filter(
      (c) =>
        c.approvalLevels?.length > 0 &&
        c.approvalLevels.some((l) => l.LevelUsers?.length > 0),
    )
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  return valid.some((config) => evaluateConfigTrigger(config, record));
}


async function get(req) {
  const {
    branchId,
    pagination,
    pageNumber,
    dataPerPage,
    searchDocDate,
    searchDocId,
    finYearId,
    searchIndentType,
    searchStatus,
  } = req.query;

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime)
    : "";


  let data = await prisma.Indent.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      indentType: INDENT_TYPE,
      status: searchStatus ? searchStatus : undefined,
      docId: searchDocId ? { contains: searchDocId } : undefined,
      AND: finYearDate
        ? [
          { createdAt: { gte: finYearDate.startDateStartTime } },
          { createdAt: { lte: finYearDate.endDateEndTime } },
        ]
        : undefined,
    },


    orderBy: { docId: "desc" },
  });

  let totalCount = data.length;

  if (searchDocDate) {
    data = data?.filter((item) =>
      String(getDateFromDateTime(item.createdAt)).includes(searchDocDate),
    );
  }
  if (pagination) {
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage,
    );
  }
  const poIds = data.map((po) => po.id);

  const { module, hasApproval } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    branchId,
  );

  const approvalLogs = await prisma.approvalLog.findMany({
    where: { referencePage: REFERENCE_PAGE, referenceId: { in: poIds } },
    select: {
      id: true,
      referenceId: true,
      status: true,
      remarks: true,
      currentLevel: true,
      LevelLogs: {
        select: {
          action: true,
          levelNo: true,
          userId: true,
          createdAt: true,
          User: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const approvalLogMap = approvalLogs.reduce((acc, log) => {
    acc[log.referenceId] = log;
    return acc;
  }, {});

  const activeConfigs =
    hasApproval && module
      ? await prisma.approvalConfig.findMany({
        where: {
          moduleId: module.id,
          branchId: parseInt(branchId),
          active: true,
        },
        include: {
          ConfigConditions: {
            include: { Field: true, Operator: true, CompareField: true },
          },
          approvalLevels: {
            include: { LevelUsers: true },
            orderBy: { levelNo: "asc" },
          },
        },
        // orderBy: { priority: "asc" },
      })
      : [];

  const resolvedData = data.map((po) => {
    const log = approvalLogMap[po.id] ?? null;
    let shouldTrigger = false;
    if (!log && hasApproval && activeConfigs.length > 0) {
      shouldTrigger = evaluateConfigs(activeConfigs, po);
    }

    // Compute allowedActions based on status
    let allowedActions = [];
    const status = po.status || "DRAFT";
    if (status === "DRAFT") {
      allowedActions = ["edit", "submit", "discard"];
    } else if (status === "SUBMITTED") {
      // Typically you'd check if user is approver here, but we simplify for now
      allowedActions = ["approve", "reject", "return"];
    } else if (status === "APPROVED") {
      allowedActions = ["cancel"]; // if not consumed
    } else if (status === "REJECTED") {
      allowedActions = ["edit", "discard"];
    } else if (status === "RETURNED") {
      allowedActions = ["edit", "submit"];
    } else if (status === "CANCELLED") {
      allowedActions = [];
    }

    return {
      ...po,
      allowedActions,
      approvalStatus: getPOApprovalStatus(log, !!log || shouldTrigger),
      childRecord: 0,
    };
  });

  return {
    statusCode: 0,
    data: resolvedData,
    totalCount,
  };
}

async function getOne(id) {

  const data = await prisma.Indent.findUnique({
    where: { id: parseInt(id) },
    include: {
      IndentItems: {
        include: {
          Itemgroup: true,
          Item: true,
          Size: true,
          Color: true,
          Uom: true,
        }
      },
    }
  });

  if (!data) return NoRecordFound("Indent");

  let allowedActions = [];
  const status = data.status || "DRAFT";
  if (status === "DRAFT") {
    allowedActions = ["edit", "submit", "discard"];
  } else if (status === "SUBMITTED") {
    allowedActions = ["approve", "reject", "return"];
  } else if (status === "APPROVED") {
    allowedActions = ["cancel"];
  } else if (status === "REJECTED") {
    allowedActions = ["edit", "discard"];
  } else if (status === "RETURNED") {
    allowedActions = ["edit", "submit"];
  } else if (status === "CANCELLED") {
    allowedActions = [];
  }

  return {
    statusCode: 0,
    data: {
      ...data,
      allowedActions,
      childRecord: false,
    },
  };
}

async function getOneBillEntry(req) {
  const { supplierId } = req.query;
  const data = await prisma.purchaseInward.findMany({
    where: { supplierId: parseInt(supplierId) },
    include: {
      Store: { select: { locationId: true, storeName: true } },
      Branch: { select: { branchName: true } },
      supplier: { select: { name: true } },
      inwardItems: { include: { Hsn: true, StyleItem: true, Uom: true } },
    },
  });
  if (!data) return NoRecordFound("Purchase Inward");
  return { statusCode: 0, data };
}

// ── CREATE ────────────────────────────────────────────────────────────────────
async function create(body) {
  const {
    userId,
    branchId,
    storeId,
    docDate,
    supplierId,
    indentItems,
    finYearId,
    draftSave,
    orderId,
    departmentId,
    employeeId,
    requiredDate,
    priority,
    remarks

  } = await body;

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime,) : "";
  let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime, draftSave,);

  const IndentItems = typeof indentItems === "string" ? JSON.parse(indentItems) : indentItems;

  const { module, hasApproval } = await getModuleApprovalSetup(REFERENCE_PAGE, branchId);

  let data;
  await prisma.$transaction(async (tx) => {
    data = await tx.Indent.create({

      data: {
        docId: newDocId,
        indentType: String(INDENT_TYPE),
        priority: String(priority),
        remarks: String(remarks),
        docDate: docDate ? new Date(docDate) : null,
        requiredDate: requiredDate ? new Date(requiredDate) : null,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        departmentId: departmentId ? parseInt(departmentId) : null,
        employeeId: employeeId ? parseInt(employeeId) : null,

      },
    });

    if (hasApproval && module) {

      const includeClause = await buildIncludeForModule(module.id);

      const fullRecord = await tx.Indent.findUnique({
        where: { id: data.id },
        include: includeClause,
      });

      await createApprovalLog(
        tx,
        branchId,
        module.id,
        data.id,
        REFERENCE_PAGE,
        fullRecord,
        data.docId,
        userId,
      );
    }

    await createIssueItems(tx, IndentItems, data, userId, storeId, branchId, orderId, departmentId, employeeId);





  });

  return { statusCode: 0, data };
}


// ── CREATE INWARD ITEMS ───────────────────────────────────────────────────────
async function createIssueItems(
  tx,
  inwardItems,
  indent
) {

  let createdItem

  for (const item of inwardItems) {
    createdItem = await tx.IndentItems.create({
      data: {
        indentId: parseInt(indent.id),
        fabricId: item?.fabricId ? parseInt(item.fabricId) : null,
        gsmId: item?.gsmId ? parseInt(item.gsmId) : null,
        sizeId: item?.sizeId ? parseInt(item.sizeId) : null,
        colorId: item?.colorId ? parseInt(item.colorId) : null,
        uomId: item?.uomId ? parseInt(item.uomId) : null,
        qty: item?.qty ? String(item.qty) : null,

      },
    });



  }
  return createdItem



}

function findRemovedItemsGoods(dataFound, indentItems) {
  return dataFound.IndentItems.filter(
    (oldItem) =>
      !indentItems.find(
        (newItem) => parseInt(newItem.id) === parseInt(oldItem.id),
      ),
  );
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
async function update(id, body, files) {
  const {
    userId,
    branchId,
    storeId,
    docDate,
    supplierId,
    indentItems,
    productionType,
    orderId,
    departmentId,
    employeeId,
    requiredDate

  } = await body;


  const dataFound = await prisma.Indent.findUnique({
    where: { id: parseInt(id) },
    include: {
      IndentItems: true
    },
  });
  if (!dataFound) return NoRecordFound("Indent");


  const IndentItems = typeof indentItems === "string" ? JSON.parse(indentItems) : indentItems;
  const removedItemsGoods = findRemovedItemsGoods(dataFound, indentItems);
  const removeItemsGoodsIds = removedItemsGoods.map((item) => parseInt(item.id));

  let data;

  await prisma.$transaction(async (tx) => {
    if (removeItemsGoodsIds.length > 0) {

      await tx.IndentItems.deleteMany({
        where: { id: { in: removeItemsGoodsIds } },
      });
    }

    data = await tx.Indent.update({
      where: { id: parseInt(id) },
      data: {
        requiredDate: requiredDate ? new Date(requiredDate) : null,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
      },
    });

    await updateinwardItems(tx, IndentItems, data);


  });



  return { statusCode: 0, data };
}

// ── UPDATE INWARD ITEMS ───────────────────────────────────────────────────────
async function updateinwardItems(
  tx,
  indentItems,
  indentRecord,
) {
  for (const item of indentItems) {

    let createdOrUpdatedItem;
    if (item.id) {
      createdOrUpdatedItem = await tx.IndentItems.update({
        where: { id: parseInt(item.id) },
        data: {
          fabricId: item?.fabricId ? parseInt(item.fabricId) : null,
          gsmId: item?.gsmId ? parseInt(item.gsmId) : null,
          sizeId: item?.sizeId ? parseInt(item.sizeId) : null,
          colorId: item?.colorId ? parseInt(item.colorId) : null,
          uomId: item?.uomId ? parseInt(item.uomId) : null,
          qty: item?.qty ? String(item.qty) : null,
        },
      });
    } else {
      createdOrUpdatedItem = await tx.IndentItems.create({
        data: {
          indentId: parseInt(indentRecord.id),
          fabricId: item?.fabricId ? parseInt(item.fabricId) : null,
          gsmId: item?.gsmId ? parseInt(item.gsmId) : null,
          sizeId: item?.sizeId ? parseInt(item.sizeId) : null,
          colorId: item?.colorId ? parseInt(item.colorId) : null,
          uomId: item?.uomId ? parseInt(item.uomId) : null,
          qty: item?.qty ? String(item.qty) : null,
        },
      });
    }

  }

}

// ── REMOVE ────────────────────────────────────────────────────────────────────
async function remove(id) {
  const data = await prisma.Indent.delete({
    where: {
      id: parseInt(id)
    },
  })
  await prisma.approvalLog.deleteMany({
    where: {
      referenceId: parseInt(id),
      referencePage: REFERENCE_PAGE
    },
  })
  return { statusCode: 0, data };
}

// ── Remaining functions unchanged ─────────────────────────────────────────────
async function getPurchaseDetail(req) {
  const { invNo } = req.query;
  let data = await prisma.purchaseInward.findFirst({
    where: { invNo },
    include: {
      fabricInwardItems: {
        select: {
          materialStocks: true,
          id: true,
          purchaseInwardId: true,
          styleNo: true,
          fabricId: true,
          styleItemId: true,
          styleId: true,
          hsnId: true,
          fabWidth: true,
          fabMeter: true,
          uomId: true,
          noOfPcs: true,
          accessoryId: true,
          accessoryGroupId: true,
          accessoryItemId: true,
          qty: true,
          price: true,
          Fabric: true,
          Color: true,
          StyleItem: true,
          Accessory: true,
          AccessoryGroup: true,
          Uom: true,
          Size: true,
          filePath: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("Purchase Inward");
  return { statusCode: 0, data };
}

async function getPurchaseDetailStock(req) {
  const { invNo, storeId, branchId, returnType } = req.query;
  let purchaseData = await prisma.purchaseInward.findFirst({
    where: { invNo, inwardType: returnType },
    include: { inwardItems: true },
  });
  if (!purchaseData || purchaseData.length === 0)
    return NoRecordFound("Invoice");

  const isMaterial =
    returnType?.toLowerCase().includes("fabric") ||
    returnType?.toLowerCase().includes("accessory");
  let data;

  if (isMaterial) {
    data = await prisma.materialStock.groupBy({
      by: [
        "fabricId",
        "hsnId",
        "fabWidth",
        "accessoryId",
        "accessoryGroupId",
        "uomId",
        "styleId",
        "invNo",
        "portionId",
      ],
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        storeId: storeId ? parseInt(storeId) : undefined,
        invNo,
      },
      _sum: { qty: true, fabMeter: true },
    });
  } else {
    const rg =
      purchaseData.inwardItems.filter(
        (item) => item.styleId && item.styleItemId && item.uomId,
      ) || [];
    data = await prisma.stock.groupBy({
      by: ["fabricId", "hsnId", "uomId", "styleId", "styleItemId", "styleNo"],
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        storeId: storeId ? parseInt(storeId) : undefined,
        OR: rg.map((item) => ({
          styleId: item.styleId,
          styleItemId: item.styleItemId,
          hsnId: item.hsnId,
          uomId: item.uomId,
        })),
      },
      _sum: { qty: true },
    });
  }

  if (!data || data.length === 0) return NoRecordFound("Invoice not found");

  return {
    statusCode: 0,
    data: isMaterial
      ? data.map((d) => ({
        invNo: d.invNo,
        styleItemId: d.styleItemId,
        fabricId: d.fabricId,
        hsnId: d.hsnId,
        uomId: d.uomId,
        fabWidth: d.fabWidth,
        fabMeter: d._sum.fabMeter,
        accessoryId: d.accessoryId,
        accessoryGroupId: d.accessoryGroupId,
        qty: d._sum.qty,
        styleId: d.styleId,
        portionId: d.portionId,
      }))
      : data.map((d) => ({
        invNo: purchaseData.invNo,
        styleItemId: d.styleItemId,
        fabricId: d.fabricId,
        hsnId: d.hsnId,
        uomId: d.uomId,
        stkQty: d._sum.qty,
        styleId: d.styleId,
        styleNo: d.styleNo,
      })),
    returnType: purchaseData.inwardType,
    supplierId: purchaseData.supplierId,
  };
}

function manualFilterSearchDataPurchaseInwardItems(
  searchDocDate,
  searchDcDate,
  returnType,
  data,
) {
  const returnTypeToSearch =
    returnType === "General Return"
      ? ["Direct Inward"]
      : ["Order Purchase Inward", "General Purchase Inward"];
  return data.filter(
    (item) =>
      (searchDocDate
        ? String(getDateFromDateTime(item.PurchaseInward.docDate)).includes(
          searchDocDate,
        )
        : true) &&
      (searchDcDate
        ? String(getDateFromDateTime(item.PurchaseInward.dcDate)).includes(
          searchDcDate,
        )
        : true) &&
      (returnTypeToSearch
        ? returnTypeToSearch.includes(item.PurchaseInward.inwardType)
        : true),
  );
}

async function getAllDataPurInwardItems(data) {
  const results = await Promise.all(
    data?.map(async (item) => {
      const res = await getPurInwardItemById(item.id);
      return res.data;
    }),
  );
  return results.filter((item) => item.balQty > 0);
}

async function getPurInwardItemById(id) {
  let data = await prisma.inwardItems.findUnique({
    where: { id: parseInt(id) },
    include: {
      PurchaseInward: { select: { docId: true, dcDate: true, docDate: true } },
      Uom: { select: { name: true } },
      StyleItem: { select: { name: true } },
      Hsn: { select: { name: true } },
      Itemgroup: { select: { name: true } },
      Size: { select: { name: true } },
      Color: { select: { name: true } },
      Gsm: { select: { name: true } },
    },
  });
  if (!data) return NoRecordFound("Purchase Inward");

  const [itemWithPoQty, returnItems] = await Promise.all([
    prisma.poItems.findFirst({
      where: {
        styleItemId: data.styleItemId,
        poId: data.poId,
        uomId: data.uomId,
        hsnId: data.hsnId,
        gsmId: data.gsmId,
      },
    }),
    prisma.purchaseReturnItems.findMany({
      where: {
        styleItemId: data.styleItemId,
        purchaseInwardId: data.purchaseInwardId,
        uomId: data.uomId,
        hsnId: data.hsnId,
        gsmId: data.gsmId,
      },
      select: { returnQty: true },
    }),
  ]);

  const returnQty = returnItems.reduce(
    (sum, item) => sum + (item.returnQty ?? 0),
    0,
  );
  return {
    statusCode: 0,
    data: {
      ...data,
      poQty: itemWithPoQty?.qty ?? 0,
      alreadyReturnQty: returnQty,
      balQty: data.inwardQty - returnQty,
    },
  };
}

async function getPurchaseInwardItems(req) {
  const {
    branchId,
    active,
    supplierId,
    pagination,
    searchDocId,
    searchDocDate,
    searchDcDate,
    returnType,
  } = req.query;

  let data;
  let totalCount;
  if (pagination) {
    data = await prisma.inwardItems.findMany({
      where: {
        PurchaseInward: {
          docId: Boolean(searchDocId) ? { contains: searchDocId } : undefined,
          supplierId: supplierId ? parseInt(supplierId) : undefined,
        },
      },
      include: {
        PurchaseInward: {
          select: {
            supplierId: true,
            docDate: true,
            dcDate: true,
            inwardType: true,
          },
        },
        Uom: { select: { name: true } },
      },
    });
    data = manualFilterSearchDataPurchaseInwardItems(
      searchDocDate,
      searchDcDate,
      returnType,
      data,
    );
    data = data?.filter((i) => i.PurchaseInward.supplierId == supplierId);
    data = await getAllDataPurInwardItems(data);
  } else {
    data = await prisma.inwardItems.findMany({
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        active: active ? Boolean(active) : undefined,
      },
    });
  }
  return { statusCode: 0, data, totalCount };
}





function manualFilterSearchDataPIItems(searchPIDate, data) {
  return data.filter((item) =>
    searchPIDate
      ? String(getDateFromDateTime(item.PurchaseInward?.docDate)).includes(
        searchPIDate,
      )
      : true,
  );
}

async function getPurchaseInwardBillEntryItems(req) {
  const {
    branchId,
    active,
    supplierId,
    searchInvNo,
    pagination,
    dataPerPage,
    searchDocId,
    searchPIDate,
    searchDcNo,
    billType,
  } = req.query;

  let data;
  let totalCount;

  if (pagination) {
    const billedInwardItemIds = await prisma.purchaseBillEntryItems.findMany({
      where: { purchaseInwardId: { not: null } },
      select: {
        docId: true,
        styleItemId: true,
        sizeId: true,
        colorId: true,
        gsmId: true,
        purchaseInwardId: true,
      },
    });
    const billedKeys = new Set(
      billedInwardItemIds.map(
        (b) =>
          `${b.purchaseInwardId}_${b.styleItemId}_${b.sizeId}_${b.colorId}_${b.gsmId}`,
      ),
    );

    data = await prisma.inwardItems.findMany({
      where: {
        PurchaseInward: {
          docId: Boolean(searchDocId) ? { contains: searchDocId } : undefined,
          invNo: searchInvNo ? { contains: searchInvNo } : undefined,
          dcNo: Boolean(searchDcNo) ? { contains: searchDcNo } : undefined,
          AND: [
            {
              OR: [
                { receiptType: { not: "Against Invoice" } },
                { receiptType: null },
                { receiptType: "" },
              ],
            },
          ],
          supplierId: supplierId ? parseInt(supplierId) : undefined,
          inwardType: billType ? { contains: billType } : undefined,
        },
      },
      include: {
        PurchaseInward: {
          select: {
            supplierId: true,
            docDate: true,
            docId: true,
            invNo: true,
            dcNo: true,
            id: true,
          },
        },
        Hsn: { select: { name: true, tax: true } },
        StyleItem: { select: { name: true } },
        Uom: { select: { name: true } },
        Size: { select: { name: true } },
        Color: { select: { name: true } },
        Gsm: { select: { name: true } },
      },
    });

    data = manualFilterSearchDataPIItems(searchPIDate, data);
    data = data.filter((item) => {
      const key = `${item.purchaseInwardId}_${item.styleItemId}_${item.sizeId}_${item.colorId}_${item.gsmId}`;
      return !billedKeys.has(key);
    });
    data = data.filter((i) => i.PurchaseInward?.supplierId == supplierId);
  } else {
    data = await prisma.inwardItems.findMany({
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        active: active ? Boolean(active) : undefined,
      },
    });
  }

  return { statusCode: 0, data, totalCount };
}

export {
  get,
  getOne,
  create,
  update,
  remove,
  getPurchaseDetail,
  getPurchaseDetailStock,
  getPurchaseInwardItems,
  getOneBillEntry,
  getPurchaseInwardBillEntryItems,
};

async function submit(id, body) {
  const data = await prisma.Indent.update({
    where: { id: parseInt(id) },
    data: { status: "SUBMITTED" }
  });
  return { statusCode: 0, data };
}

async function approve(id, body) {
  try {
    const {
      userId,
      remarks,
      recordData,
      referencePage,
      referenceId,
      actionType,
    } = body;

    if (!userId) return { statusCode: 1, message: "userId is required" };
    if (actionType === "REJECT" && !remarks?.trim()) {
      return { statusCode: 1, message: "Remarks required for rejection" };
    }

    console.log(actionType === "APPROVE")

    if (actionType === "APPROVE") {
      return await approveRecord(
        referenceId,
        referencePage,
        userId,
        remarks,
        recordData ?? {},
      );
    } else if (actionType === "REJECT") {
      return await rejectRecord(referenceId, referencePage, userId, remarks);
    }

    return { statusCode: 1, message: "Invalid action type" };
  } catch (err) {
    return { statusCode: 400, message: err.message };
  }
}

async function reject(id, body) {
  const data = await prisma.Indent.update({
    where: { id: parseInt(id) },
    data: { status: "REJECTED" }
  });
  return { statusCode: 0, data };
}

async function returnIndent(id, body) {
  const data = await prisma.Indent.update({
    where: { id: parseInt(id) },
    data: { status: "RETURNED" }
  });
  return { statusCode: 0, data };
}

async function cancel(id, body) {
  const data = await prisma.Indent.update({
    where: { id: parseInt(id) },
    data: { status: "CANCELLED" }
  });
  return { statusCode: 0, data };
}

export {
  submit,
  approve,
  reject,
  returnIndent,
  cancel,

}