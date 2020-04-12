//import Router from 'koa-router';
import express from 'express';
//import posts from './posts';
import auth from './auth';
//import test from './test/img.routes';
import posts from './community';
import saveCenter from './admin';
import centers from './centers';

const api=express.Router();

//api.use('/posts', posts.routes());
//api.use('/auth', auth.routes());
api.use('/posts', posts);
api.use('/auth', auth);
api.use('/community', posts);
api.use('/admin', saveCenter);
api.use('/centers', centers);
//api.use('/test', test);

export default api;