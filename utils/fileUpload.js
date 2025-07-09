const multer = require('multer');
const path = require('path');

// Configure multer for different environments
const configureMulter = (uploadPath, fileSizeLimit = 5 * 1024 * 1024) => {
  let storage;
  
  if (process.env.NODE_ENV === 'production') {
    // For production (Vercel), use memory storage
    // Files will be processed and uploaded to cloud storage
    storage = multer.memoryStorage();
  } else {
    // For development, use disk storage
    storage = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, uploadPath);
      },
      filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
  }

  // File filter for images
  const imageFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('يرجى تحميل ملف صورة صالح'), false);
    }
    cb(null, true);
  };

  // File filter for documents
  const documentFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(pdf|doc|docx|jpg|jpeg|png)$/)) {
      return cb(new Error('يرجى تحميل ملف صالح'), false);
    }
    cb(null, true);
  };

  return {
    imageUpload: multer({
      storage: storage,
      limits: { fileSize: fileSizeLimit },
      fileFilter: imageFilter
    }),
    documentUpload: multer({
      storage: storage,
      limits: { fileSize: fileSizeLimit },
      fileFilter: documentFilter
    })
  };
};

// Helper function to get file URL
const getFileUrl = (filename, type = 'profiles') => {
  if (process.env.NODE_ENV === 'production') {
    // Return cloud storage URL or process the file
    return `https://your-cloud-storage-url/${type}/${filename}`;
  } else {
    // Return local file path for development
    return `/uploads/${type}/${filename}`;
  }
};

// Helper function to process uploaded file
const processUploadedFile = async (file, type = 'profiles') => {
  if (process.env.NODE_ENV === 'production') {
    // Here you would upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
    // For now, we'll return a placeholder
    const filename = `${type}-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    return {
      filename: filename,
      url: getFileUrl(filename, type)
    };
  } else {
    // For development, return the local file path
    return {
      filename: file.filename,
      url: getFileUrl(file.filename, type)
    };
  }
};

module.exports = {
  configureMulter,
  getFileUrl,
  processUploadedFile
}; 