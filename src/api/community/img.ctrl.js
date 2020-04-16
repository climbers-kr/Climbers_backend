require('dotenv').config();
import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
const uuidv4 = require('uuid/v4');
const uploader = express.Router();
import Test from '../../models/imgTest';
const DIR = './uploads/';
const fs = require('fs');
const path=require('path');
const AWS=require('aws-sdk');
const multerS3=require('multer-s3');
import checkLoggedIn from '../../lib/checkLoggedIn';


fs.readdir(DIR, (error) => {
    if (error) {
        console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
        console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
        fs.mkdirSync(DIR);
    }
});

AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2',
});

const upload = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: 'climbers',
        key(req, file, cb) {
            cb(null, `original/${+new Date()}${path.basename(file.originalname)}`);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});


uploader.post('/', upload.single('img'), (req, res, next) => {
    console.log(req.file);
    console.log("uploader.post('/upload-images' called");
    //const reqFiles = [];
    const url = req.protocol + '://' + req.get('host');

    const user = new Test({
        _id: new mongoose.Types.ObjectId(),
        imgCollection: req.file.filename
    });
    res.status(201).json({
        url: req.file.location
    });

});


export default uploader;