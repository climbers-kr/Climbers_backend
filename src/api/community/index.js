const express = require('express');
import * as postsCtrl from './posts.ctrl';
import uploader from './img.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const posts=express.Router();



posts.get('/', postsCtrl.list);
posts.post('/post', checkLoggedIn, postsCtrl.write);
posts.use('/upload-image' , checkLoggedIn, uploader);



const post=express.Router(); // /api/posts/:id
post.get('/', postsCtrl.read);
//post.patch('/comment', postsCtrl.readComment);
post.delete('/', checkLoggedIn, postsCtrl.checkOwnPost, postsCtrl.remove);
post.patch('/', checkLoggedIn, postsCtrl.checkOwnPost, postsCtrl.update);
post.post('/comment', checkLoggedIn, postsCtrl.comment);

posts.use('/:id', postsCtrl.getPostById, post);


export default posts;