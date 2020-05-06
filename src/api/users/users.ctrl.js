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
        res.locals.user=user.serialize();
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

//로그인 중인 사용자가 작성한 포스트인지 확인하는 미들웨어
export const checkOwnPost=(ctx, next)=> {
    /*
    const {user, post}=ctx.state;
    if(post.user._id.toString() !== user._id) {
        ctx.status=403;
        return;
    }
    return next();*/
};


/*POST /api/posts
{
    title: '제목',
    body: '내용',
    tags: ['tag1', 'tag2']
}
* */
export const write=async (req, res, next)=> {
    /*
    console.log('write api called')

    const schema=Joi.object().keys({
        //객체가 다음 필드를 가지고 있음을 검증
        imgUrlList: Joi.array()
            .items(Joi.string()),
        body: Joi.string().required(),
        category: Joi.string().required(),
        centerTag: Joi.object(),
        tags: Joi.array()
            .items(Joi.string()),

    });

    //검증하고 나서 검증 실패인 경우 에러 처리
    const result=Joi.validate(req.body, schema);
    if(result.error){
        console.error(result.error);
        //Bad request
        return res.status(400).send(result.error);
    }

    const {imgUrlList, body, tags, centerTag, category}=req.body;
    const post=new Post({
        imgUrlList,
        body,
        tags,
        centerTag,
        category,
        user: res.locals.user,
    });

    try{
        await post.save();
        return res.json(post);
    }catch(e){
        return res.status(500).send(e);
    }*/
}

/*
* GET /api/posts?username=&tag=&page=
* */

export const list=async (req, res, next)=> {
    /*
    console.log('list api called');
    console.dir(req.query);
    const page=parseInt(req.query.page || '1', 10);

    if(page < 1) {
        return res.status(400).end();
    }

    const {tag, username, category}=req.query;
    //tag, username 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음
    const query={
        ...(username ? {'user.username': username}: {}),
        ...(tag ? {tags: tag} : {}),
        ...(category ? {category: category} : {}),
    };

    console.log("list query test");
    console.dir(query);

    try{
        const posts=await Post.find(query)
            .populate('comments')
            .sort({_id: -1})
            .limit(10)
            .skip((page-1) * 10)
            .lean()
            .exec();

        const postCount=await Post.countDocuments(query).exec();
        res.set('Last-Page', Math.ceil(postCount/10));


        res.send(posts);
    }catch(e){

        return res.status(500).send(e);
    }*/
};

/*
*GET /api/users/:id (get user profile)
* */
export const read=async (req, res)=> {
    const user=res.locals.user;
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
* PATCH /api/posts/id
* */
export const update=async (req, res)=> {
    //const {id}=ctx.params;
    /*
    const user=res.locals.user;
    console.dir(user);

    const schema=Joi.object().keys({
        name: Joi.string(),
        lv: Joi.string(),
        introduction: Joi.string(),
        location: '',
        tags: Joi.array().items(Joi.string()),
    });

    const result=Joi.validate(request.body, schema);
    if(result.error) {
        console.error(result.error);
        //Bad request
        return res.status(400).send(result.error);
    }

    try{
        const user=await User.findByIdAndUpdate(user._id, request.body, {
            new: true,
        }).exec();
        if(!user) {
            return res.status(404).send("존재하지 않는 계정입니다");
        }
        return res.json(user);
    }catch(e){
        return res.status(500).send(e);
    }*/
};