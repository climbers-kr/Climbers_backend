const express = require('express');
import * as authCtrl from './auth.ctrl';
const auth=express.Router();

auth.post('/checkUserConflict', authCtrl.checkUserConflict);
auth.post('/requestPhoneAuth', authCtrl.requestPhoneAuth);
auth.post('/register', authCtrl.register);
auth.post('/login', authCtrl.login);
auth.get('/check', authCtrl.check);
auth.post('/logout', authCtrl.logout);

export default auth;