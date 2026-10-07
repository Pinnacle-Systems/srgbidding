const { prisma } = require("../configs/prisma");

exports.getAll = async (req) => {
  // Assuming a generic Bidding model, update model name if different
  const data = await prisma.Bidding.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  return {
    statusCode: 0,
    data: data,
    totalCount: data.length,
  };
};

exports.getById = async (id) => {
  const data = await prisma.Bidding.findUnique({
    where: { id: parseInt(id) }
  });
  
  return {
    statusCode: 0,
    data: data,
  };
};

exports.create = async (body, req) => {
  const data = await prisma.Bidding.create({
    data: body
  });
  
  return {
    statusCode: 0,
    data: data,
    message: "Bid created successfully"
  };
};

exports.update = async (id, body, req) => {
  const data = await prisma.Bidding.update({
    where: { id: parseInt(id) },
    data: body
  });
  
  return {
    statusCode: 0,
    data: data,
    message: "Bid updated successfully"
  };
};

exports.deleteRecord = async (id) => {
  await prisma.Bidding.delete({
    where: { id: parseInt(id) }
  });
  
  return {
    statusCode: 0,
    message: "Bid deleted successfully"
  };
};
