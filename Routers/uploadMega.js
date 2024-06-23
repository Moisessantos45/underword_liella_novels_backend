import express from "express";
import multer from "multer";
import fs from "fs";
import subirFileMega from "../controllers/ControllerMegaFiles.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./Uploads/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const newFilename = `${file.originalname}`;
    cb(null, newFilename);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post("/upload_file_mega", upload.array("file"), subirFileMega);

export default router;
