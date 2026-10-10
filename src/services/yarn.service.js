import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.yarn.findMany({
    where: {
      active: active ? Boolean(active) : undefined,
    },
    include: {
      YarnVendors: true

    },
    orderBy: {
      id: "desc"
    }
  });
  return {
    statusCode: 0,
    data: data.map((item) => ({ ...item, childRecord: 0 })),
  };
}

async function getOne(id) {
  const data = await prisma.yarn.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      YarnVendors: true
    }

  });
  if (!data) return NoRecordFound("yarn");
  return { statusCode: 0, data: { ...data, childRecord: 0 } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.yarn.findMany({
    where: {
      active: active ? Boolean(active) : undefined,
      OR: [
        {
          name: {
            contains: searchKey,
          },
        },
      ],
    },
  });
  return { statusCode: 0, data };
}

async function create(body) {
  const { name, code, active, yarnVendors } = await body;
  const data = await prisma.yarn.create({
    data: {
      name,
      code,
      active,
      YarnVendors: {
        create: yarnVendors.map((item) => ({
          vendorId: item.value,
          name: item.label,

        })),
      },
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, code, active, yarnVendors } = await body;
  const dataFound = await prisma.yarn.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("yarn");
  const data = await prisma.yarn.update({
    where: {
      id: parseInt(id),
    },
    include: {
      YarnVendors: true

    },
    data: {
      name,
      code,
      active,
      YarnVendors: {
        deleteMany: {
          yarnId: parseInt(id),
        },
        create: yarnVendors.map((item) => ({
          vendorId: item.value,
          name: item.label,

        })),
      },
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.yarn.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}


async function getYarnVendors(req) {
  const { companyId, active } = req.query;
  const data = await prisma.yarnVendors.findMany();
  return {
    statusCode: 0,
    data: data,
  };
}

export { get, getOne, getSearch, create, update, remove, getYarnVendors };
