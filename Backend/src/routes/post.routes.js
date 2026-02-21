const express = require("express");
const { createPostController, getPostController, getPostDetailsController } = require("../controllers/post.controller");
const postRouter = express.Router();
const multer = require("multer");
const identifyUser = require("../middlewares/auth.middleware");
const upload = multer({storage: multer.memoryStorage()})


postRouter.post("/",upload.single("image"), identifyUser,createPostController);
postRouter.get("/",identifyUser,getPostController);
postRouter.get("/details/:postId",identifyUser, getPostDetailsController);


module.exports = postRouter