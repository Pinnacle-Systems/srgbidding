import indentTypeService from "../services/indentTypeMaster.service.js";

export const getAll = async (req, res, next) => {
  try {
    const result = await indentTypeService.getAll(req);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getByName = async (req, res, next) => {
  try {
    const result = await indentTypeService.getByName(req.params.name);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const upsertByName = async (req, res, next) => {
  try {
    const result = await indentTypeService.upsertByName(req.params.name, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
