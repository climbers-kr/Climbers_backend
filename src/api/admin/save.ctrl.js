import Center from '../../models/center';
import mongoose from 'mongoose';
import Joi from 'joi';

const {ObjectId} = mongoose.Types;

export const getPostById=async (ctx, next)=> {
    const {id}=ctx.params;
    if(!ObjectId.isValid(id)){
        console.log("fuck not valid");
        ctx.status=400;
        return;
    }

    try{
        const post=await Post.findById(id);
        //포스트가 존재하지 않을 때
        if(!post) {
            ctx.status=404;
            return;
        }
        ctx.state.post=post;
        return next();
    }catch(e){
        ctx.throw(500, e);
    }

};

//로그인 중인 사용자가 작성한 포스트인지 확인하는 미들웨어
export const checkOwnPost=(ctx, next)=> {
    const {user, post}=ctx.state;
    if(post.user._id.toString() !== user._id) {
        ctx.status=403;
        return;
    }
    return next();
};


/*
POST /api/admin/saveCenter
*/
export const write=async (req, res, next)=> {
    console.log('write api called');

    const schema=Joi.object().keys({
        //객체가 다음 필드를 가지고 있음을 검증
        imgUrlList: Joi.array().items(Joi.string()),
        imageSource: Joi.array().items(Joi.string()),
        title: Joi.string().required(),
        location: Joi.string().required(),
        locationDetail: Joi.string().required(),
        locationObject: Joi.object().required(),
        contact: Joi.string().required(),
        sites: Joi.array().items(Joi.string()),
        prices: Joi.array().items(Joi.object()),
        time: Joi.string(),
        hasParking: Joi.boolean(),
        facility: Joi.object(),
    });

    //검증하고 나서 검증 실패인 경우 에러 처리
    const result=Joi.validate(req.body, schema);
    if(result.error){
        //Bad request
        console.dir(result.error);
        console.error('joi error');
        return res.status(400).send(result.error);
    }

    const {
        imgUrlList,
        imageSource,
        title,
        location,
        locationDetail,
        locationObject,
        contact,
        sites,
        prices,
        time,
        hasParking,
        facility
    }=req.body;

    const center=new Center({
        imgUrlList,
        imageSource,
        title,
        location,
        locationDetail,
        locationObject,
        contact,
        sites,
        prices,
        time,
        hasParking,
        facility,
    });

    try{
        await center.save();
        return res.json(center);
    }catch(e){
        console.error("save error occur");
        return res.status(500).send(e);
    }
};

/*
* GET /api/posts?username=&tag=&page=
* */

export const list=async (req, res, next)=> {
    console.log('list api called');
    console.dir(req.query);
    const page=parseInt(req.query.page || '1', 10);

    if(page < 1) {
        /*
        res.status=400;
        return;*/
        return res.status(400).end();
    }

    const {tag, username}=req.query;
    //tag, username 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음
    const query={
        ...(username ? {'user.username': username}: {}),
        ...(tag ? {tags: tag} : {}),
    };

    console.log("list query test");
    console.dir(query);


    try{
        const posts=await Post.find(query)
            .sort({_id: -1})
            .limit(10)
            .skip((page-1) * 10)
            .exec();

        const postCount=await Post.countDocuments(query).exec();
        res.set('Last-Page', Math.ceil(postCount/10));
        const body=posts
            .map(post=>post.toJSON())
            .map(post=> ({
                ...post,
                body:
                    post.body.length < 200 ? post.body: `${post.body.slice(0, 200)}...`,
            }));

        res.send(body);
    }catch(e){

        return res.status(500).send(e);
    }
};



/*
* PATCH /api/posts/id
* */
export const update=async ctx=> {
    const {id}=ctx.params;

    const schema=Joi.object().keys({
        title: Joi.string(),
        body: Joi.string(),
        tags: Joi.array().items(Joi.string()),
    });

    const result=Joi.validate(ctx.request.body, schema);
    if(result.error) {
        ctx.status=400;
        ctx.body=result.error;
        return;
    }


    try{
        const post=await Post.findByIdAndUpdate(id, ctx.request.body, {
            new: true,
        }).exec();
        if(!post) {
            ctx.status=404;
            return;
        }
        ctx.body=post;
    }catch(e){
        ctx.throw(500, e);
    }
};