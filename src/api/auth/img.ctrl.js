require('dotenv').config();
import express from 'express';
import multer from 'multer';
const uploader = express.Router();
const path=require('path');
const AWS=require('aws-sdk');
const multerS3=require('multer-s3');
import Joi from 'joi';


AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2',
});

const upload = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: 'climbers',
        acl: 'public-read',
        key(req, file, cb) {
            cb(null, `profile/${+new Date()}${path.basename(file.originalname)}`);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});


uploader.post('/', upload.single('img'), (req, res, next) => {
    console.log(req.file);
    console.log("uploader.post('/upload-images' called");
    console.log(req.file.location);
    const schema=Joi.object().keys({
        profileImgUrl: Joi.string(),

    });
    res.status(201).json({
        url: req.file.location
    });

});


export default uploader;