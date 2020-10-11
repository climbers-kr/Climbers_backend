import express from 'express';
import auth from './auth';
import posts from './community';
import saveCenter from './admin';
import centers from './centers';
import users from './users';
import gyms from './gyms';

const api=express.Router();

api.use('/posts', posts);
api.use('/auth', auth);
api.use('/community', posts);
api.use('/admin', saveCenter);
api.use('/centers', centers);
api.use('/users', users);
api.use('/gyms', gyms);
//api.use('/test', test);

export default api;