const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/avatars'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `user_${req.user.id}_${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
        cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
    },
});

module.exports = upload;