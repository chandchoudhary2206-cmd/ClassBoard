const multer = require('multer');
const path = require('path');

const profileImageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg, png, jpeg files are allowed'), false);
  }
};

const studyMaterialFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only pdf, doc, docx, ppt, pptx, txt files are allowed'), false);
  }
};

const assignmentFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip', 'application/x-zip-compressed'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only pdf, doc, docx, txt, zip files are allowed'), false);
  }
};

const submissionFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip', 'application/x-zip-compressed'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only pdf, doc, docx, txt, zip files are allowed'), false);
  }
};

const announcementFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg, png, jpeg, pdf files are allowed'), false);
  }
};

const createStorage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });

const uploadProfileImage = multer({
  storage: createStorage('uploads/profile-images/'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: profileImageFilter
});

const uploadStudyMaterial = multer({
  storage: createStorage('uploads/study-materials/'),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: studyMaterialFilter
});

const uploadAssignment = multer({
  storage: createStorage('uploads/assignments/'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: assignmentFilter
});

const uploadSubmission = multer({
  storage: createStorage('uploads/submissions/'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: submissionFilter
});

const uploadAnnouncement = multer({
  storage: createStorage('uploads/announcements/'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: announcementFilter
});

module.exports = { uploadProfileImage, uploadStudyMaterial, uploadAssignment, uploadSubmission, uploadAnnouncement };
