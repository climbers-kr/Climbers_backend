import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
const uuidv4 = require('uuid/v4');
const uploader = express.Router();
const path = require('path');
// User model
//let User = require('../models/User');
import Test from '../../models/imgTest';
const DIR = `./src/public/centers`;
const fs = require('fs');
import checkLoggedIn from '../../lib/checkLoggedIn';


fs.readdir(DIR, (error) => {
    if (error) {
        console.log('centers 폴더가 없어 uploads 폴더를 생성합니다.');
        console.error('centers 폴더가 없어 uploads 폴더를 생성합니다.');
        fs.mkdirSync(DIR);
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const fileNameLowerCase = file.originalname.toLowerCase().split(' ').join('-');
        const fileName = path.basename(fileNameLowerCase, ext);
        cb(null, fileName + new Date().valueOf() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});

uploader.post('/', upload.single('img'), (req, res, next) => {
    console.log("uploader.post('/upload-images' called");
    //const reqFiles = [];
    const url = req.protocol + '://' + req.get('host');

    const user = new Test({
        _id: new mongoose.Types.ObjectId(),
        imgCollection: req.file.filename
    });

    res.status(201).json({
        url: `/centers/${req.file.filename}`
    });

});

export default uploader;