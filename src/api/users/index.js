const express = require('express');
import * as usersCtrl from './users.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const users=express.Router();

users.get('/', usersCtrl.list);

users.use('/:username', usersCtrl.getUserByUsername, user);
const user=express.Router(); // /api/users/:username

user.get('/', usersCtrl.read);
//users.use('/:id', usersCtrl.getUserById, user);

export default users;