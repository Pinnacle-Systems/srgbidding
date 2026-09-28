import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  create,
  update,
  remove,
  submit,
  approve,
  reject,
  returnIndent,
  cancel,
} from "../controllers/yarnIndent.controller.js";

router.post("/", create);

router.get("/", get);

router.get("/:id", getOne);

router.put("/:id", update);

router.delete("/:id", remove);

// Action routes
router.post("/:id/submit", submit);
router.post("/:id/approve", approve);
router.post("/:id/reject", reject);
router.post("/:id/return", returnIndent);
router.post("/:id/cancel", cancel);

export default router;
