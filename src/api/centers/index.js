const express = require('express');
import * as centersCtrl from './centers.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const centers=express.Router();

centers.get('/', centersCtrl.list); //암장 리스트

const center=express.Router(); // /api/posts/:id
center.get('/', centersCtrl.read);
center.delete('/', checkLoggedIn, centersCtrl.checkOwnPost, centersCtrl.remove);
center.patch('/', checkLoggedIn, centersCtrl.checkOwnPost, centersCtrl.update);

centers.use('/:id', centersCtrl.getPostById, center);

export default centers;