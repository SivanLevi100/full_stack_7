// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// יצירת תיקיית uploads אם לא קיימת
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// הגדרת אחסון קבצים
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // תיקיית היעד לשמירת קבצים
    },
    filename: function (req, file, cb) {
        // יצירת שם קובץ ייחודי
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
        cb(null, fileName);
    }
});

// פילטר לסוגי קבצים מותרים
const fileFilter = (req, file, cb) => {
    // סוגי קבצים מותרים
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'));
    }
};

// הגדרת multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB מקסימום
        files: 1 // קובץ אחד בכל פעם
    },
    fileFilter: fileFilter
});

// Middleware לטיפול בשגיאות העלאה
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

// פונקציה למחיקת קובץ ישן
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