const multer = require('multer');
const path = require('path');

// 1. File Type Validation: JPG, JPEG, PNG, WEBP
const fileFilter = (req, file, cb) => {
    // Allow only specific image types
    const allowedTypes = /jpeg|jpg|png|webp/;
    // Check extension
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        const err = new Error('Invalid file type. Only jpg, jpeg, png, webp are allowed.');
        err.code = 'INVALID_FILE_TYPE';
        return cb(err);
    }
};

// 2. Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Sanitize original filename to prevent directory traversal or unsafe characters
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + sanitizedName);
    }
});

// 3. Limits Configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 6 // Max 1 featured + 5 additional
    },
    fileFilter: fileFilter
});

// 4. Error Handling Logic
const handleUploadError = (err, res) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files uploaded.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: `Unexpected field: ${err.field}` });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
        if (err.code === 'INVALID_FILE_TYPE') {
            return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Unknown upload error' });
};

/**
 * Wrapper middleware for upload.fields to handle errors inline
 * @param {Array} fields - Array of field objects { name, maxCount }
 */
const uploadFields = (fields) => {
    return (req, res, next) => {
        const uploadMiddleware = upload.fields(fields);
        uploadMiddleware(req, res, (err) => {
            if (err) {
                return handleUploadError(err, res);
            }
            next();
        });
    };
};

module.exports = {
    upload,
    handleUploadError,
    uploadFields
};
