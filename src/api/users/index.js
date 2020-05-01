const express = require('express');
import * as usersCtrl from './users.ctrl';
import uploader from './img.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const users=express.Router();

users.get('/', usersCtrl.list);
users.post('/post', checkLoggedIn, usersCtrl.write);
users.use('/upload-image' , checkLoggedIn, uploader);

const user=express.Router(); // /api/users/:id
user.get('/', usersCtrl.read);
//post.patch('/comment', postsCtrl.readComment);
user.delete('/', checkLoggedIn, usersCtrl.checkOwnPost, usersCtrl.remove);
user.patch('/editProfile', checkLoggedIn, usersCtrl.checkOwnPost, usersCtrl.update);

users.use('/:id', usersCtrl.getUserById, user);


export default users;