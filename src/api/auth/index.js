import checkLoggedIn from "../../lib/checkLoggedIn";

const express = require('express');
import * as authCtrl from './auth.ctrl';
import uploader from "./img.ctrl";
const auth=express.Router();

auth.post('/checkUserConflict', authCtrl.checkUserConflict);
auth.post('/requestPhoneAuth', authCtrl.requestPhoneAuth);
auth.post('/register', authCtrl.register);
auth.post('/login', authCtrl.login);
auth.get('/check', authCtrl.check);
auth.post('/logout', authCtrl.logout);


//프로필 정보 불러오기
auth.get('/load-profile', authCtrl.loadProfile);
//프로필 수정 (텍스트)
auth.post('/update-profile', authCtrl.update);
//프로필 이미지 수정
auth.use('/update-profile-img' , checkLoggedIn, uploader);

export default auth;