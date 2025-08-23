/**
 * File Upload Middleware using Multer
 *
 * This module provides utilities for handling image uploads in an Express app,
 * including storage configuration, file validation, error handling, and deletion.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Multer storage configuration
 * - Destination: 'uploads/' folder
 * - Filename: fieldname + unique timestamp + random number + original extension
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.originalname);
        const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
        cb(null, fileName);
    }
});

/**
 * File filter to allow only specific image types
 * Allowed types: jpeg, jpg, png, gif, webp
 */
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'));
    }
};

/**
 * Multer upload instance
 * - Max file size: 5MB
 * - Max files per request: 1
 */
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    },
    fileFilter: fileFilter
});

/**
 * Middleware for handling Multer errors
 * Responds with appropriate error messages for:
 * - File size limit
 * - File count limit
 * - Unexpected field name
 */
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files. Only 1 file allowed' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: 'Unexpected field name' });
        }
    }

    if (err) {
        return res.status(400).json({ error: err.message });
    }

    next();
};

/**
 * Utility function to delete a file
 * @param {string} filePath - path to the file to delete
 */
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

module.exports = {
    upload,
    handleUploadError,
    deleteFile
};
