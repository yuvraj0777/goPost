const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

// Create a diskStorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/uploads");
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(12, (err, bytes) => {
        const fn = bytes.toString("hex") + path.extname(file.originalname);
        cb(null, fn);
    })
  },
});

const upload = multer({storage: storage});

module.exports = upload;
