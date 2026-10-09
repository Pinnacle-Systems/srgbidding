const express = require("express");
const router = express.Router();
const biddingController = require("../controllers/bidding.controller");

router.get("/", biddingController.getAll);
router.get("/:id", biddingController.getById);
router.post("/", biddingController.create);
router.put("/:id", biddingController.update);
router.delete("/:id", biddingController.deleteRecord);

// Lots endpoints
router.post("/:id/lots", biddingController.createLot);
router.put("/lots/:lotId", biddingController.updateLot);
router.delete("/lots/:lotId", biddingController.deleteLot);

module.exports = router;
