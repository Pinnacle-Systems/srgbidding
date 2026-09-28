import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.fabric.findMany({
    where: {
      active: active ? Boolean(active) : undefined,
    },
  });
  return {
    statusCode: 0,
    data: data.map((item) => ({ ...item, childRecord: 0 })),
  };
}

async function getOne(id) {
  const data = await prisma.fabric.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("fabric");
  return { statusCode: 0, data: { ...data, childRecord: 0 } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.fabric.findMany({
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
  const { name, code, active } = await body;
  const data = await prisma.fabric.create({
    data: {
      name,
      code,
      active,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, code, active } = await body;
  const dataFound = await prisma.fabric.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("fabric");
  const data = await prisma.fabric.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      code,
      active,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.fabric.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
