require('dotenv').config();
import express from 'express';
import multer from 'multer';
const uploader = express.Router();
const path=require('path');
const AWS=require('aws-sdk');
const multerS3=require('multer-s3');
import Joi from 'joi';
import User from '../../models/user';

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


uploader.post('/', upload.single('img'), async (req, res, next) => {
    try{
        const user = await User.findByIdAndUpdate(
            {_id: res.locals.user._id},
            {profileImgUrl: req.file.location},
            {new: true}).exec();

        if(!user) {
            return res.status(404).end();
        }

        res.status(201).json({
            url: req.file.location
        });
    }catch(e){
        return res.status(500).send(e);
    }

});


export default uploader;