import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
const uuidv4 = require('uuid/v4');
const uploader = express.Router();
// User model
//let User = require('../models/User');
import Test from '../../models/imgTest';
const DIR = './uploads/';
const fs = require('fs');
import checkLoggedIn from '../../lib/checkLoggedIn';


fs.readdir(DIR, (error) => {
    if (error) {
        console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
        console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
        fs.mkdirSync(DIR);
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuidv4() + '-' + fileName)
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif") {
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
        url: `${url}/uploads/${req.file.filename}`
    });

});

uploader.get("/", (req, res, next) => {
    console.log("test.post get called");
    Test.find().then(data => {
        res.status(200).json({
            message: "User list retrieved successfully!",
            users: data
        });
    });
});

export default uploader;