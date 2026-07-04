const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Define upload directory path & ensure it exists
const uploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Storage engine configuration with secure filename handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Prepend timestamp and random number to prevent filename collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    
    // Sanitize filename to prevent Directory Traversal attacks (remove .. and special characters)
    const sanitizedOriginalName = file.originalname
      .replace(/[^a-zA-Z0-9.\-_]/g, '') // Keep only alphanumeric, dots, dashes, underscores
      .replace(/\.\.+/g, '.');          // Clean up double dot traversals

    const fileExt = path.extname(sanitizedOriginalName).toLowerCase();
    const baseName = path.basename(sanitizedOriginalName, fileExt);

    // Final secured filename format
    cb(null, `${baseName}-${uniqueSuffix}${fileExt}`);
  },
});

// 3. File Filter to enforce PDF uploads only
const fileFilter = (req, file, cb) => {
  // Verify both mime type and file extension
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (file.mimetype === 'application/pdf' && fileExt === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF resumes are allowed!'), false);
  }
};

// 4. Configure Multer middleware instance
const uploadResume = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = uploadResume;
