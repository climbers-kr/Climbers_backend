const express = require('express');
import * as centersCtrl from './centers.ctrl';

const centers=express.Router();

centers.get('/', centersCtrl.list); //암장 리스트
centers.get('/:id', centersCtrl.read); //개별 암장


export default centers;