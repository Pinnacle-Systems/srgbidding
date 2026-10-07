import { prisma } from "../lib/prisma.js";

const getAll = async (req) => {
  const data = await prisma.IndentTypeMaster.findMany();
  return {
    statusCode: 0,
    data: data,
    totalCount: data.length,
  };
};

const getByName = async (name) => {
  const data = await prisma.IndentTypeMaster.findUnique({
    where: { name: name }
  });
  return {
    statusCode: 0,
    data: data,
  };
};

const upsertByName = async (name, body) => {
  console.log(body, "body");
  const data = await prisma.IndentTypeMaster.upsert({
    where: { name: name },
    update: { fieldSchema: body.fieldSchema },
    create: { name: name, fieldSchema: body.fieldSchema }
  });
  return {
    statusCode: 0,
    data: data,
    message: "Indent Type schema saved successfully"
  };
};

export default {
  getAll,
  getByName,
  upsertByName
};
