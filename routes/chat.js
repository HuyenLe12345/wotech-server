const express = require("express");
const { checkAuth } = require("../middleware/checkAuth");
const chatController = require("../controllers/chat.js");
const router = express.Router();

router.post("/createNewRoom", chatController.createNewRoom);
router.put("/addMessage", chatController.addMessage);
router.get("/getById", chatController.getMessageByRoomId);
module.exports = router;
