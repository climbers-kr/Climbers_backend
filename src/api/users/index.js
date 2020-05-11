const express = require('express');
import * as usersCtrl from './users.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const users=express.Router();
users.get('/', usersCtrl.list);

const user=express.Router(); // /api/users/:username
user.get('/', usersCtrl.read);
//users.use('/:id', usersCtrl.getUserById, user);


users.use('/:username', usersCtrl.getUserByUsername, user);
export default users;