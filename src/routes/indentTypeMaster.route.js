import { Router } from "express";
const router = Router();
import { getAll, getByName, upsertByName } from "../controllers/indentTypeMaster.controller.js";

router.get("/", getAll);
router.get("/:name", getByName);
router.post("/:name", upsertByName);

export default router;
