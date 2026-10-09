const { prisma } = require("../configs/prisma");

exports.getAll = async (req) => {
  const data = await prisma.Bidding.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      BiddingLots: true,
      Branch: true,
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    }
  });
  
  return {
    statusCode: 0,
    data: data,
    totalCount: data.length,
  };
};

exports.getById = async (id) => {
  const data = await prisma.Bidding.findUnique({
    where: { id: parseInt(id) },
    include: {
      BiddingLots: {
        include: {
          BiddingIndent: true
        }
      },
      Branch: true,
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    }
  });
  
  return {
    statusCode: 0,
    data: data,
  };
};

exports.create = async (body, req) => {
  const data = await prisma.Bidding.create({
    data: {
      ...body,
      createdById: req.user?.id,
    }
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
    data: {
      ...body,
      updatedById: req.user?.id,
    }
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

// Lot endpoints
exports.createLot = async (biddingId, body, req) => {
  const data = await prisma.BiddingLots.create({
    data: {
      ...body,
      biddingId: parseInt(biddingId)
    }
  });
  
  return {
    statusCode: 0,
    data: data,
    message: "Lot created successfully"
  };
};

exports.updateLot = async (lotId, body, req) => {
  const data = await prisma.BiddingLots.update({
    where: { id: parseInt(lotId) },
    data: body
  });
  
  return {
    statusCode: 0,
    data: data,
    message: "Lot updated successfully"
  };
};

exports.deleteLot = async (lotId) => {
  await prisma.BiddingLots.delete({
    where: { id: parseInt(lotId) }
  });
  
  return {
    statusCode: 0,
    message: "Lot deleted successfully"
  };
};
