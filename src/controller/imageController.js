// imageController.js
const { Request, Response, NextFunction } = require("express");
const Image = require('../model/imageModal')
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const s3 = require("../utils/s3");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

const MAX_TITLE_LENGTH = 50;
const MAX_FILENAME_LENGTH = 50;

const uploadMiddleware = upload.array("images", 10);

const uploadImages = async (req, res, next) => {
    try {
        const files = req.files;

        const titlesRaw = req.body.titles;
        if (typeof titlesRaw !== 'string') {
            res.status(400).json({ error: "Titles must be a comma-separated string." });
            return;
        }

        const titles = titlesRaw.split(',').map((title) => title.trim());

        if (!req.user) {
            res.status(401).json({ message: "Unauthorized, user not found" });
            return;
        }

        const userId = req.user.id;

        if (!files || files.length === 0) {
            res.status(400).json({ error: "No files uploaded" });
            return;
        }

        const highestOrderImage = await Image.findOne({ userId }).sort("-order").select("order");
        const nextOrder = highestOrderImage ? highestOrderImage.order + 1 : 0;

        const uploadPromises = files.map(async (file, index) => {
            const truncatedFileName = file.originalname.slice(0, MAX_FILENAME_LENGTH);
            const fileExtension = truncatedFileName.split(".").pop();
            const imageKey = `${uuidv4()}.${fileExtension}`;

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: imageKey,
                Body: file.buffer,
                ContentType: file.mimetype,
            };

            await s3.send(new PutObjectCommand(params));

            const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;

            const title = titles[index]?.slice(0, MAX_TITLE_LENGTH) || truncatedFileName;

            const newImage = new Image({
                userId,
                imageUrl: imageUrl,
                imageKey: imageKey,
                title,
                order: nextOrder + index,
            });
            return newImage.save();
        });

        const savedImages = await Promise.all(uploadPromises);
        res.status(201).json({
            message: "Images uploaded successfully",
            images: savedImages,
        });
    } catch (e) {
        console.log("Error uploading images:", e);
        res.status(500).json({ error: "Error uploading images" });
    }
};

const getImages = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized, user not found" });
            return;
        }
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const images = await Image.find({ userId })
            .select('imageUrl title order')
            .sort("order")
            .skip(skip)
            .limit(limit);

        const total = await Image.countDocuments({ userId });

        res.status(200).json({
            images,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalImages: total
        });
    } catch (e) {
        console.error("Error fetching images:", e);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateImageTitle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const userId = req.user?.id;

        const truncatedTitle = title.slice(0, MAX_TITLE_LENGTH);

        const image = await Image.findOneAndUpdate(
            { _id: id, userId },
            { title: truncatedTitle },
            { new: true }
        );

        if (!image) {
            res.status(404).json({ error: "Image not found" });
            return;
        }

        res.json(image);
    } catch (error) {
        console.log("Error updating image title:", error);
        res.status(500).json({ error: "Error updating image title" });
    }
};

const deleteImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const image = await Image.findOneAndDelete({ _id: id, userId });

        if (!image) {
            res.status(404).json({ error: "Image not found" });
            return;
        }

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: image.imageKey,
        };

        await s3.send(new DeleteObjectCommand(params));

        res.json({ message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({ error: "Error deleting image" });
    }
};

const reorderImages = async (req, res, next) => {
    try {
        const { imageIds } = req.body;
        const userId = req.user?.id;

        await Promise.all(
            imageIds.map((image) =>
                Image.findOneAndUpdate(
                    { _id: image.id, userId },
                    { order: image.order },
                    { new: true }
                )
            )
        );

        res.json({ message: "Images reordered successfully" });
    } catch (error) {
        console.error("Error reordering images:", error);
        res.status(500).json({ error: "Error reordering images" });
    }
};

module.exports = {
    uploadMiddleware,
    uploadImages,
    getImages,
    updateImageTitle,
    deleteImage,
    reorderImages,
};
