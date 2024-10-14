// imageRoutes.js
const express = require("express");
const {
  uploadMiddleware,
  uploadImages,
  getImages,
  updateImageTitle,
  deleteImage,
  reorderImages,
} = require("../controller/imageController");
const { isvalidate } = require("../middleware/authMiddleware");

const imageRouter = express.Router();

imageRouter.post("/upload", isvalidate, uploadMiddleware, uploadImages);
imageRouter.get("/", isvalidate, getImages);
imageRouter.put("/:id/title", isvalidate, updateImageTitle);
imageRouter.delete("/:id", isvalidate, deleteImage);
imageRouter.put("/reorder", isvalidate, reorderImages);

module.exports = imageRouter;
