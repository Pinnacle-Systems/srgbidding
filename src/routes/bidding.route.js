import { Router } from "express";
const router = Router();
import {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove,
    getVendorAllocatedItems,
    submitVendorQuote,
    uploadVendorIndentDocument,
} from "../controllers/bidding.controller.js";
import { multerUploadForGrid } from "../utils/multerUpload.js";

// Dedicated Vendor Endpoints
router.get("/vendor/allocated-items", getVendorAllocatedItems);
router.post("/vendor/quote/:biddingIndentId", submitVendorQuote);
router.post("/vendor/upload/:biddingIndentId", multerUploadForGrid.array("files"), uploadVendorIndentDocument);

router.get("/", get);

router.get("/:id", getOne);

router.get("/search/:searchKey", getSearch);

router.post("/", multerUploadForGrid.array("images"), create);

router.put("/:id", multerUploadForGrid.array("images"), update);

router.delete("/:id", remove);

export default router;
