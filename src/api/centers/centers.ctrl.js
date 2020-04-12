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
        const post=await Center.findById(id);
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
* GET /api/posts?username=&tag=&page=
* */

export const list=async (req, res, next)=> {
    console.log('list api called');
    console.dir(req.query);
    const page=parseInt(req.query.page || '1', 10);

    if(page < 1) {
        return res.status(400).end();
    }

    const {sido, sigungu}=req.query;
    //tag, username 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음
    const query={
        ...(sido ? {'locationObject.sido': sido}: {}),
        ...(sigungu ? {'locationObject.sigungu': sigungu} : {}),
    };

    console.log("list query test");
    console.dir(query);

    try{
        const centers=await Center.find(query)
            .sort({_id: -1})
            .limit(10)
            .skip((page-1) * 10)
            .exec();

        const centerCount=await Center.countDocuments(query).exec();
        res.set('Last-Page', Math.ceil(centerCount/10));
        const body=centers
            .map(center=>center.toJSON());
        /*
        const body=centers
            .map(post=>post.toJSON())
            .map(post=> ({
                ...post,
                body:
                    post.body.length < 200 ? post.body: `${post.body.slice(0, 200)}...`,
            }));*/

        res.send(body);
    }catch(e){
        return res.status(500).send(e);
    }
};

/*
*GET /api/posts/:id
* */
export const read=async ctx=> {
    ctx.body=ctx.state.post;
};
/*
*DELETE /
* */
export const remove=async ctx=> {
    const {id}=ctx.params;
    try{
        await Center.findByIdAndRemove(id).exec();
        ctx.status=204;
    }catch(e){
        ctx.throw(500, e);
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
        const post=await Center.findByIdAndUpdate(id, ctx.request.body, {
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