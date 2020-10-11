const express = require('express');
import * as gymsCtrl from './gyms.ctrl';

const gyms=express.Router();

gyms.get('/', gymsCtrl.list); //암장 리스트
gyms.get('/:id', gymsCtrl.read); //개별 암장


export default gyms;