//const Router=require('koa-router');
const express = require('express');
import * as postsCtrl from './posts.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const posts=express.Router();



posts.get('/', postsCtrl.list);
posts.post('/', checkLoggedIn, postsCtrl.write);


const post=express.Router(); // /api/posts/:id
post.get('/', postsCtrl.read);
post.delete('/', checkLoggedIn, postsCtrl.checkOwnPost, postsCtrl.remove);
post.patch('/', checkLoggedIn, postsCtrl.checkOwnPost, postsCtrl.update);


posts.use('/:id', postsCtrl.getPostById, post);


export default posts;