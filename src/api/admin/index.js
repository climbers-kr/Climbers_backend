const express = require('express');
import * as saveCtrl from './save.ctrl';
import uploader from './img.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';
import checkAdmin from '../../lib/checkAdmin';

const adminRouter=express.Router();

//adminRouter.use('/saveCenter', )

//adminRouter.get('/', saveCtrl.list);
adminRouter.post('/saveCenter', checkLoggedIn, checkAdmin, saveCtrl.write);
adminRouter.use('/uploadCenterImage' , checkLoggedIn, uploader);//temp

const router=express.Router(); // /api/posts/:id
//router.get('/', saveCtrl.read);
//router.delete('/', checkLoggedIn, saveCtrl.checkOwnPost, saveCtrl.remove);
router.patch('/', checkLoggedIn, saveCtrl.checkOwnPost, saveCtrl.update);


adminRouter.use('/saveCenter/:id', saveCtrl.getPostById, router);


export default adminRouter;