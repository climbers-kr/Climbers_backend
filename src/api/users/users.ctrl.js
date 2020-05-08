import Post from '../../models/post';
import User from '../../models/user';
import mongoose from 'mongoose';
import Joi from 'joi';
const {ObjectId} = mongoose.Types;

export const getUserByUsername=async (req, res, next)=> {
    const { username } = req.params;
    try{
        const user=await User.findByUsername(username).exec();
        //user가 존재하지 않을 때
        if(!user) {
            return res.status(404).end("존재하지 않는 회원 입니다");
        }
        res.locals.memberProfile=user.serialize();
        return next();
    }catch(e){
        res.status(500).send(e);
    }
};
export const getUserById=async (req, res, next)=> {
    const { id } = req.params;

    if(!ObjectId.isValid(id)){
        console.log("ObjectId not valid");
        return res.status(400).end();
    }

    try{
        const user=await User.findById(id).exec();
        //user가 존재하지 않을 때
        if(!user) {
            return res.status(404).end("존재하지 않는 회원 입니다");
        }
        res.locals.user=user.serialize();
        return next();
    }catch(e){
        res.status(500).send(e);
    }

};



/*
* GET /api/posts?username=&tag=&page=
* */

export const list=async (req, res, next)=> {

};

/*
*GET /api/users/:username (get user profile)
* */
export const read=async (req, res)=> {
    const user=res.locals.memberProfile;
    const query={
        ...(user._id && {'user._id': new ObjectId(user._id)}),
    };
    try{
        const postCount=await Post.countDocuments(query);
        user.postCount=postCount;

        return res.json(user);
    }catch(e){
        return res.status(500).send(e);
    }
};


/*
* PATCH /api/users/:username
* */
export const update=async (req, res)=> {

};