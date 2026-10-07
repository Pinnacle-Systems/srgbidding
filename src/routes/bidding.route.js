const express = require("express");
const router = express.Router();
const biddingController = require("../controllers/bidding.controller");

router.get("/", biddingController.getAll);
router.get("/:id", biddingController.getById);
router.post("/", biddingController.create);
router.put("/:id", biddingController.update);
router.delete("/:id", biddingController.deleteRecord);

module.exports = router;
