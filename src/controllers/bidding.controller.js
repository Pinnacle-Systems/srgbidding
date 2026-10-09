const biddingService = require("../services/bidding.service");

exports.getAll = async (req, res, next) => {
  try {
    const result = await biddingService.getAll(req);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await biddingService.getById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const result = await biddingService.create(req.body, req);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const result = await biddingService.update(req.params.id, req.body, req);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.deleteRecord = async (req, res, next) => {
  try {
    const result = await biddingService.deleteRecord(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.createLot = async (req, res, next) => {
  try {
    const result = await biddingService.createLot(req.params.id, req.body, req);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateLot = async (req, res, next) => {
  try {
    const result = await biddingService.updateLot(req.params.lotId, req.body, req);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.deleteLot = async (req, res, next) => {
  try {
    const result = await biddingService.deleteLot(req.params.lotId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
